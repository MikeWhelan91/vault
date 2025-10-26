'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCrypto } from '@/contexts/CryptoContext';
import { useToast } from '@/contexts/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  Video,
  Mic,
  Plus,
  Calendar,
  Play,
  Pause,
  Square,
  Trash2,
  Download,
  Send,
  Heart,
  Gift,
  GraduationCap,
  Cake,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { encryptFile, generateItemKey } from '@/lib/crypto';
import { uploadObject } from '@/lib/r2-client';

type MessageCategory = 'birthday' | 'wedding' | 'graduation' | 'anniversary' | 'general' | 'guided_memory';

export default function MessagesPageClient() {
  const { metadata, session, addItem } = useCrypto();
  const { showToast } = useToast();
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaType, setMediaType] = useState<'video' | 'audio'>('video');
  const [category, setCategory] = useState<MessageCategory>('general');
  const [messageTitle, setMessageTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [triggerType, setTriggerType] = useState<'date' | 'age' | 'manual'>('manual');
  const [triggerDate, setTriggerDate] = useState('');
  const [recipientAge, setRecipientAge] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchMessages();
  }, [session.dbUserId]);

  useEffect(() => {
    return () => {
      // Cleanup: stop any active streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const fetchMessages = async () => {
    if (!session.dbUserId) return;

    try {
      const response = await fetch(`/api/messages?userId=${session.dbUserId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const constraints = mediaType === 'video'
        ? { video: true, audio: true }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current && mediaType === 'video') {
        videoRef.current.srcObject = stream;
      }

      // Try to use supported codec for Android compatibility
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

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      showToast('Recording started', 'success');
    } catch (error) {
      console.error('Error starting recording:', error);
      showToast('Failed to access camera/microphone. Please grant permissions.', 'error');
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
            console.log(`Upload progress: ${progress.percentage}%`);
          }
        );

        showToast('Message saved successfully!', 'success');
        setShowRecordModal(false);
        resetRecordingState();
        fetchMessages();
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!metadata) {
    return <div>Loading...</div>;
  }

  const categoryOptions = [
    { value: 'birthday', label: 'Birthday', icon: Cake },
    { value: 'wedding', label: 'Wedding', icon: Heart },
    { value: 'graduation', label: 'Graduation', icon: GraduationCap },
    { value: 'anniversary', label: 'Anniversary', icon: Gift },
    { value: 'guided_memory', label: 'Life Lesson', icon: MessageCircle },
    { value: 'general', label: 'General', icon: Video },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <MobilePageHeader
        title="Video Messages"
        subtitle="Record heartfelt video or audio messages for future delivery to loved ones on special occasions."
        icon={Video}
        actions={
          <Button onClick={() => setShowRecordModal(true)} size="sm">
            <Plus className="h-4 w-4" />
            <span className="ml-2">Record Message</span>
          </Button>
        }
      />

      {/* Messages Grid */}
      {isLoading ? (
        <Card className="rounded-3xl border border-champagne-200 bg-white shadow-sm">
          <p className="py-12 text-center text-sm text-plum-500">Loading messages...</p>
        </Card>
      ) : messages.length === 0 ? (
        <Card className="rounded-3xl border border-champagne-200 bg-white shadow-sm">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-champagne-200 bg-champagne-50 text-plum-500">
              <Video className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold text-plum-900">No messages yet</h3>
            <p className="mt-2 max-w-sm text-sm text-warm-600">
              Create meaningful video or audio messages for birthdays, graduations, weddings, or just to share your wisdom.
            </p>
            <Button onClick={() => setShowRecordModal(true)} size="lg" className="mt-6">
              <Plus className="h-4 w-4" />
              <span className="ml-2">Record Your First Message</span>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {messages.map((message) => (
            <Card key={message.id} className="rounded-2xl border border-champagne-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Video className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-plum-900">{message.title}</h3>
                  <p className="mt-1 text-sm text-plum-500">{message.category}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Record Modal */}
      <Modal
        isOpen={showRecordModal}
        onClose={() => {
          if (isRecording) {
            stopRecording();
          }
          setShowRecordModal(false);
          resetRecordingState();
        }}
        title="Record a Message"
        size="xl"
      >
        <div className="space-y-6">
          {/* Media Type Selection */}
          <div>
            <label className="block text-sm font-medium text-plum-700 mb-2">
              Recording Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => !isRecording && setMediaType('video')}
                disabled={isRecording}
                className={`p-4 rounded-xl border-2 transition-all ${
                  mediaType === 'video'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-champagne-200 hover:border-warm-300'
                } ${isRecording ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Video className="w-6 h-6 mx-auto mb-2 text-primary-600" />
                <span className="text-sm font-medium text-plum-900">Video</span>
              </button>
              <button
                onClick={() => !isRecording && setMediaType('audio')}
                disabled={isRecording}
                className={`p-4 rounded-xl border-2 transition-all ${
                  mediaType === 'audio'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-champagne-200 hover:border-warm-300'
                } ${isRecording ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Mic className="w-6 h-6 mx-auto mb-2 text-primary-600" />
                <span className="text-sm font-medium text-plum-900">Audio Only</span>
              </button>
            </div>
          </div>

          {/* Video Preview / Audio Indicator */}
          <div className="relative aspect-video rounded-xl bg-warm-900 overflow-hidden">
            {mediaType === 'video' ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className={`flex flex-col items-center gap-4 ${isRecording ? 'animate-pulse' : ''}`}>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-500">
                    <Mic className="h-10 w-10 text-white" />
                  </div>
                  <p className="text-white text-sm">
                    {isRecording ? 'Recording audio...' : 'Ready to record audio'}
                  </p>
                </div>
              </div>
            )}

            {/* Recording Controls Overlay */}
            {(isRecording || recordingDuration > 0) && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-full">
                <div className={`w-3 h-3 rounded-full ${isRecording && !isPaused ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-white font-mono font-semibold text-lg">
                  {formatDuration(recordingDuration)}
                </span>
              </div>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex justify-center gap-3">
            {!isRecording ? (
              <Button onClick={startRecording} size="lg" className="min-w-[140px]">
                <Video className="h-5 w-5" />
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
              <label className="block text-sm font-medium text-plum-700 mb-2">
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
                          : 'border-champagne-200 hover:border-warm-300'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1 text-primary-600" />
                      <span className="text-xs font-medium text-plum-900">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-plum-700 mb-2">
                Delivery Trigger
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTriggerType('manual')}
                  className={`p-3 rounded-lg border-2 text-sm ${
                    triggerType === 'manual'
                      ? 'border-primary-500 bg-primary-50 font-semibold'
                      : 'border-champagne-200'
                  }`}
                >
                  Manual
                </button>
                <button
                  onClick={() => setTriggerType('date')}
                  className={`p-3 rounded-lg border-2 text-sm ${
                    triggerType === 'date'
                      ? 'border-primary-500 bg-primary-50 font-semibold'
                      : 'border-champagne-200'
                  }`}
                >
                  Specific Date
                </button>
                <button
                  onClick={() => setTriggerType('age')}
                  className={`p-3 rounded-lg border-2 text-sm ${
                    triggerType === 'age'
                      ? 'border-primary-500 bg-primary-50 font-semibold'
                      : 'border-champagne-200'
                  }`}
                >
                  Age Milestone
                </button>
              </div>
            </div>

            {triggerType === 'date' && (
              <Input
                label="Trigger Date"
                type="date"
                value={triggerDate}
                onChange={(e) => setTriggerDate(e.target.value)}
              />
            )}

            {triggerType === 'age' && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Recipient Name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Sarah"
                />
                <Input
                  label="Age Milestone"
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
              onClick={() => {
                if (isRecording) stopRecording();
                setShowRecordModal(false);
                resetRecordingState();
              }}
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
    </div>
  );
}
