'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getFileTypeInfo } from '@/lib/file-types';
import { Download, ZoomIn, ZoomOut, Maximize2, Volume2, VolumeX } from 'lucide-react';

interface MediaViewerProps {
  filename: string;
  data: Uint8Array;
  onDownload: () => void;
}

export function MediaViewer({ filename, data, onDownload }: MediaViewerProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [muted, setMuted] = useState(false);

  const fileInfo = getFileTypeInfo(filename);

  useEffect(() => {
    // Create blob URL for media
    if (fileInfo.category !== 'text') {
      const blob = new Blob([new Uint8Array(data)], { type: fileInfo.mimeType });
      const url = URL.createObjectURL(blob);
      setObjectUrl(url);

      return () => URL.revokeObjectURL(url);
    } else {
      // Decode text content
      const decoder = new TextDecoder();
      setTextContent(decoder.decode(data));
    }
  }, [data, fileInfo]);

  if (!fileInfo.canPreview) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-graphite-600 mb-4">
            Preview not available for this file type
          </p>
          <Button onClick={onDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download File
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-graphite-200 pb-4">
          <div className="flex items-center gap-2">
            {fileInfo.category === 'image' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom(Math.max(25, zoom - 25))}
                  disabled={zoom <= 25}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-graphite-600 min-w-[60px] text-center">
                  {zoom}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom(100)}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
          <Button onClick={onDownload} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Content */}
        <div className="min-h-[400px] flex items-center justify-center bg-graphite-50 rounded-lg overflow-auto">
          {fileInfo.category === 'image' && objectUrl && (
            <img
              src={objectUrl}
              alt={filename}
              style={{ width: `${zoom}%`, maxWidth: '100%' }}
              className="object-contain"
            />
          )}

          {fileInfo.category === 'video' && objectUrl && (
            <video
              src={objectUrl}
              controls
              className="w-full max-h-[600px]"
              muted={muted}
            >
              Your browser does not support the video tag.
            </video>
          )}

          {fileInfo.category === 'audio' && objectUrl && (
            <div className="w-full max-w-2xl p-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Volume2 className="w-8 h-8 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-graphite-900 truncate">
                      {filename}
                    </h3>
                    <p className="text-sm text-graphite-600">Audio file</p>
                  </div>
                </div>
                <audio
                  src={objectUrl}
                  controls
                  className="w-full"
                  muted={muted}
                >
                  Your browser does not support the audio tag.
                </audio>
              </div>
            </div>
          )}

          {fileInfo.category === 'text' && textContent && (
            <div className="w-full h-[600px] overflow-auto">
              <pre className="p-6 text-sm font-mono text-graphite-900 whitespace-pre-wrap break-words">
                {textContent}
              </pre>
            </div>
          )}

          {fileInfo.category === 'pdf' && objectUrl && (
            <iframe
              src={objectUrl}
              className="w-full h-[600px] border-0"
              title={filename}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
