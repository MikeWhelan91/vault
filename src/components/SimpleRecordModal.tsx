'use client';

import { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Video, Mic, Play, Pause, Square, Send } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useCrypto } from '@/contexts/CryptoContext';
import { encryptFile, generateItemKey } from '@/lib/crypto';
import { uploadObject } from '@/lib/r2-client';

type MediaType = 'video' | 'audio';

interface SimpleRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function SimpleRecordModal({ isOpen, onClose, onSave }: SimpleRecordModalProps) {
  const { showToast } = useToast();
  const { addItem, session } = useCrypto();
  const [mediaType, setMediaType] = useState<MediaType>('video');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [fileName, setFileName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const startRecording = async () => {
    try {
      const constraints = mediaType === 'video'
        ? { video: true, audio: true }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoPreviewRef.current && mediaType === 'video') {
        videoPreviewRef.current.srcObject = stream;
      }

      // Android codec fallback
      let options = {};
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        options = { mimeType: 'video/webm;codecs=vp9' };
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        options = { mimeType: 'video/webm;codecs=vp8' };
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        options = { mimeType: 'video/webm' };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);

      // Show more specific error message
      let errorMessage = 'Failed to access camera/microphone';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Permission denied. Please allow camera/microphone access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera or microphone found. Please check your device.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera/microphone is already in use by another application.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'Camera/microphone constraints could not be satisfied.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }

      showToast(errorMessage, 'error');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const saveRecording = async () => {
    if (!fileName.trim()) {
      showToast('Please enter a file name', 'error');
      return;
    }

    if (chunksRef.current.length === 0) {
      showToast('Please record something first', 'error');
      return;
    }

    setIsSaving(true);

    try {
      // If still recording, stop it first
      if (isRecording) {
        stopRecording();
        // Wait a moment for the recording to stop
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const blob = new Blob(chunksRef.current, {
        type: mediaType === 'video' ? 'video/webm' : 'audio/webm'
      });

      // Convert blob to ArrayBuffer
      const arrayBuffer = await blob.arrayBuffer();
      const recordingData = new Uint8Array(arrayBuffer);

      // Generate encryption key
      const itemKey = await generateItemKey();

      // Encrypt the recording data
      const encryptedData = await encryptFile(recordingData, itemKey);

      // Generate filename with extension
      const filename = `${fileName}.webm`;

      // Create item in database (stores wrapped encryption key)
      const mimeType = mediaType === 'video' ? 'video/webm' : 'audio/webm';
      const item = await addItem({
        type: 'file',
        name: filename,
        size: encryptedData.length,
        itemKeySalt: '',
      }, itemKey, mimeType);

      try {
        // Upload encrypted recording to R2
        await uploadObject(
          session.userId,
          item.id,
          1,
          encryptedData,
          (progress) => {
            console.log(`Upload progress: ${progress.percentage}%`);
          }
        );

        showToast('Recording saved successfully!', 'success');
        handleClose();
        if (onSave) onSave();
      } catch (uploadError) {
        // If R2 upload fails, delete the database entry to keep things consistent
        console.error('R2 upload failed, cleaning up database entry:', uploadError);
        await fetch(`/api/items/${item.id}?userId=${session.dbUserId}`, {
          method: 'DELETE',
        });
        throw new Error('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Error saving recording:', error);
      showToast(error instanceof Error ? error.message : 'Failed to save recording', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const resetRecordingState = () => {
    setRecordingDuration(0);
    setFileName('');
    chunksRef.current = [];
  };

  const handleClose = () => {
    if (isRecording) stopRecording();
    resetRecordingState();
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Record Video/Audio"
      size="xl"
    >
      <div className="space-y-6">
        {/* Media Type Toggle */}
        <div className="flex gap-2 p-1 bg-graphite-100 rounded-lg">
          <button
            onClick={() => !isRecording && setMediaType('video')}
            disabled={isRecording}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${
              mediaType === 'video'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-graphite-600 hover:text-graphite-900'
            } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Video className="h-4 w-4" />
            <span className="font-medium">Video</span>
          </button>
          <button
            onClick={() => !isRecording && setMediaType('audio')}
            disabled={isRecording}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${
              mediaType === 'audio'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-graphite-600 hover:text-graphite-900'
            } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Mic className="h-4 w-4" />
            <span className="font-medium">Audio</span>
          </button>
        </div>

        {/* Video Preview */}
        {mediaType === 'video' && (
          <div className="relative aspect-video bg-graphite-900 rounded-xl overflow-hidden">
            <video
              ref={videoPreviewRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {(isRecording || recordingDuration > 0) && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-full">
                <div className={`w-3 h-3 rounded-full ${isRecording && !isPaused ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-white font-mono font-semibold text-lg">
                  {formatDuration(recordingDuration)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Audio Visualizer */}
        {mediaType === 'audio' && (isRecording || recordingDuration > 0) && (
          <div className="relative aspect-video bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ${isRecording && !isPaused ? 'animate-pulse' : ''}`}>
                <Mic className="w-8 h-8 text-white" />
              </div>
              <span className="text-white font-mono font-semibold text-2xl">
                {formatDuration(recordingDuration)}
              </span>
            </div>
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex justify-center gap-3">
          {!isRecording ? (
            <Button onClick={startRecording} size="lg" className="min-w-[140px]">
              {mediaType === 'video' ? <Video className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              <span className="ml-2">Start Recording</span>
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button onClick={resumeRecording} size="lg" variant="secondary">
                  <Play className="h-5 w-5" />
                  <span className="ml-2">Resume</span>
                </Button>
              ) : (
                <Button onClick={pauseRecording} size="lg" variant="secondary">
                  <Pause className="h-5 w-5" />
                  <span className="ml-2">Pause</span>
                </Button>
              )}
              <Button onClick={stopRecording} size="lg" className="bg-red-600 hover:bg-red-700">
                <Square className="h-5 w-5" />
                <span className="ml-2">Stop</span>
              </Button>
            </>
          )}
        </div>

        {/* File Name Input */}
        <div>
          <Input
            label="File Name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="e.g., Birthday Message 2024"
          />
          <p className="text-xs text-graphite-500 mt-1">Will be saved as: {fileName || 'filename'}.webm</p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button
            variant="ghost"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button onClick={saveRecording} disabled={recordingDuration === 0 || !fileName.trim() || isSaving}>
            <Send className="h-4 w-4" />
            <span className="ml-2">{isSaving ? 'Saving...' : 'Save Recording'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
