'use client';

import React, { useRef, useState } from 'react';
import { Button } from './Button';

export interface FileUploadProps {
  onFileSelect: (file: File | File[]) => void;
  accept?: string;
  maxSize?: number; // bytes
  disabled?: boolean;
  multiple?: boolean;
}

export function FileUpload({
  onFileSelect,
  accept,
  maxSize = 100 * 1024 * 1024, // 100MB default
  disabled = false,
  multiple = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    setError('');

    if (files.length === 0) return;

    // Check file count
    if (!multiple && files.length > 1) {
      setError('Please select only one file');
      return;
    }

    // Process first file (or all if multiple)
    const targetFiles = multiple ? files : [files[0]];

    // Check file sizes
    for (const file of targetFiles) {
      if (file.size > maxSize) {
        const maxMB = Math.round(maxSize / (1024 * 1024));
        setError(`File "${file.name}" exceeds ${maxMB}MB limit`);
        return;
      }
    }

    // Call callback with single file or array
    if (multiple && targetFiles.length > 0) {
      onFileSelect(targetFiles);
    } else if (targetFiles.length > 0) {
      onFileSelect(targetFiles[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
        multiple={multiple}
      />

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
        `}
      >
        <div className="flex flex-col items-center gap-2">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Click to upload
            </span>{' '}
            or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {multiple ? 'Select multiple files • ' : ''}Max {Math.round(maxSize / (1024 * 1024))}MB per file
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
