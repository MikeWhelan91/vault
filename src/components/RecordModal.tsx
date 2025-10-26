'use client';

import { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Video, Mic, Play, Pause, Square, Send, Cake, Heart, GraduationCap, Briefcase, PartyPopper, Star } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useCrypto } from '@/contexts/CryptoContext';
import { encryptFile, generateItemKey } from '@/lib/crypto';
import { uploadObject } from '@/lib/r2-client';

type MediaType = 'video' | 'audio';
type MessageCategory = 'birthday' | 'anniversary' | 'graduation' | 'retirement' | 'general' | 'milestone';
type TriggerType = 'manual' | 'date' | 'age';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  defaultMediaType?: MediaType;
}

export function RecordModal({ isOpen, onClose, onSave, defaultMediaType = 'video' }: RecordModalProps) {
  const { showToast } = useToast();
  const { addItem, session } = useCrypto();
  const [mediaType, setMediaType] = useState<MediaType>(defaultMediaType);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [messageTitle, setMessageTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [triggerType, setTriggerType] = useState<TriggerType>('manual');
  const [triggerDate, setTriggerDate] = useState('');
  const [recipientAge, setRecipientAge] = useState('');
  const [category, setCategory] = useState<MessageCategory>('general');
  const [isSaving, setIsSaving] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const categoryOptions = [
    { value: 'birthday', label: 'Birthday', icon: Cake },
    { value: 'anniversary', label: 'Anniversary', icon: Heart },
    { value: 'graduation', label: 'Graduation', icon: GraduationCap },
    { value: 'retirement', label: 'Retirement', icon: Briefcase },
    { value: 'milestone', label: 'Milestone', icon: Star },
    { value: 'general', label: 'General', icon: PartyPopper },
  ];

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
      showToast('Failed to access camera/microphone', 'error');
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

  const saveMessage = async () => {
    if (!messageTitle.trim()) {
      showToast('Please enter a title for your message', 'error');
      return;
    }

    if (chunksRef.current.length === 0) {
      showToast('Please record a message first', 'error');
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
      const videoData = new Uint8Array(arrayBuffer);

      // Generate encryption key for this video
      const itemKey = await generateItemKey();

      // Encrypt the video data
      const encryptedData = await encryptFile(videoData, itemKey);

      // Generate filename with extension
      const extension = mediaType === 'video' ? 'webm' : 'webm';
      const filename = `${messageTitle}.${extension}`;

      // Create item in database (stores wrapped encryption key)
      const mimeType = mediaType === 'video' ? 'video/webm' : 'audio/webm';
      const item = await addItem({
        type: 'file',
        name: filename,
        size: encryptedData.length,
        itemKeySalt: '',
      }, itemKey, mimeType);

      try {
        // Upload encrypted video to R2
        await uploadObject(
          session.userId,
          item.id,
          1,
          encryptedData,
          (progress) => {
            // Optional: could add progress indicator here
            console.log(`Upload progress: ${progress.percentage}%`);
          }
        );

        showToast('Message saved successfully!', 'success');
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
      console.error('Error saving message:', error);
      showToast(error instanceof Error ? error.message : 'Failed to save message', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const resetRecordingState = () => {
    setRecordingDuration(0);
    setMessageTitle('');
    setRecipientName('');
    setRecipientEmail('');
    setTriggerDate('');
    setRecipientAge('');
    setCategory('general');
    setTriggerType('manual');
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
      title={mediaType === 'video' ? 'Record Video Message' : 'Record Audio Message'}
      size="xl"
    >
      <div className="space-y-6">
        {/* Media Type Toggle */}
        <div className="flex gap-2 p-1 bg-warm-100 rounded-lg">
          <button
            onClick={() => setMediaType('video')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${
              mediaType === 'video'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-warm-600 hover:text-warm-900'
            }`}
          >
            <Video className="h-4 w-4" />
            <span className="font-medium">Video</span>
          </button>
          <button
            onClick={() => setMediaType('audio')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${
              mediaType === 'audio'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-warm-600 hover:text-warm-900'
            }`}
          >
            <Mic className="h-4 w-4" />
            <span className="font-medium">Audio</span>
          </button>
        </div>

        {/* Video Preview */}
        {mediaType === 'video' && (
          <div className="relative aspect-video bg-warm-900 rounded-xl overflow-hidden">
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

        {/* Audio Visualizer Placeholder */}
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

        {/* Message Details */}
        <div className="space-y-4 border-t pt-6">
          <Input
            label="Message Title"
            value={messageTitle}
            onChange={(e) => setMessageTitle(e.target.value)}
            placeholder="e.g., 18th Birthday Message for Sarah"
          />

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categoryOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setCategory(option.value as MessageCategory)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      category === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-warm-200 hover:border-warm-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1 text-primary-600" />
                    <span className="text-xs font-medium text-warm-900">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-2">
              Delivery Trigger
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTriggerType('manual')}
                className={`p-3 rounded-lg border-2 text-sm ${
                  triggerType === 'manual'
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-warm-200 text-warm-600 hover:border-warm-300'
                }`}
              >
                Manual Release
              </button>
              <button
                onClick={() => setTriggerType('date')}
                className={`p-3 rounded-lg border-2 text-sm ${
                  triggerType === 'date'
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-warm-200 text-warm-600 hover:border-warm-300'
                }`}
              >
                On Date
              </button>
              <button
                onClick={() => setTriggerType('age')}
                className={`p-3 rounded-lg border-2 text-sm ${
                  triggerType === 'age'
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-warm-200 text-warm-600 hover:border-warm-300'
                }`}
              >
                At Age
              </button>
            </div>
          </div>

          <Input
            label="Recipient Name (Optional)"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="e.g., Sarah"
          />

          {triggerType === 'date' && (
            <Input
              label="Trigger Date"
              type="date"
              value={triggerDate}
              onChange={(e) => setTriggerDate(e.target.value)}
            />
          )}

          {triggerType === 'age' && (
            <div>
              <Input
                label="Recipient Age"
                type="number"
                value={recipientAge}
                onChange={(e) => setRecipientAge(e.target.value)}
                placeholder="18"
              />
            </div>
          )}

          <Input
            label="Recipient Email (Optional)"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="recipient@example.com"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button
            variant="ghost"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button onClick={saveMessage} disabled={recordingDuration === 0 || !messageTitle.trim() || isSaving}>
            <Send className="h-4 w-4" />
            <span className="ml-2">{isSaving ? 'Saving...' : 'Save Message'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
