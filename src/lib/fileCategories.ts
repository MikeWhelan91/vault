// File category detection based on MIME type and extension

export type FileCategory = 'video' | 'image' | 'document' | 'audio' | 'other';

const CATEGORY_MAPPINGS: Record<string, FileCategory> = {
  // Videos
  'video/mp4': 'video',
  'video/mpeg': 'video',
  'video/quicktime': 'video',
  'video/x-msvideo': 'video',
  'video/webm': 'video',
  'video/x-matroska': 'video',
  '.mp4': 'video',
  '.mov': 'video',
  '.avi': 'video',
  '.mkv': 'video',
  '.webm': 'video',
  '.m4v': 'video',

  // Images
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'image/heic': 'image',
  'image/heif': 'image',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.png': 'image',
  '.gif': 'image',
  '.webp': 'image',
  '.svg': 'image',
  '.heic': 'image',
  '.heif': 'image',

  // Documents
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.ms-excel': 'document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document',
  'application/vnd.ms-powerpoint': 'document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'document',
  'text/plain': 'document',
  'text/csv': 'document',
  'application/rtf': 'document',
  '.pdf': 'document',
  '.doc': 'document',
  '.docx': 'document',
  '.xls': 'document',
  '.xlsx': 'document',
  '.ppt': 'document',
  '.pptx': 'document',
  '.txt': 'document',
  '.csv': 'document',
  '.rtf': 'document',

  // Audio
  'audio/mpeg': 'audio',
  'audio/mp4': 'audio',
  'audio/wav': 'audio',
  'audio/x-wav': 'audio',
  'audio/webm': 'audio',
  'audio/ogg': 'audio',
  'audio/flac': 'audio',
  '.mp3': 'audio',
  '.m4a': 'audio',
  '.wav': 'audio',
  '.webm': 'audio',
  '.ogg': 'audio',
  '.flac': 'audio',
};

export function getFileCategory(filename: string, mimeType?: string): FileCategory {
  // Check MIME type first
  if (mimeType && CATEGORY_MAPPINGS[mimeType]) {
    return CATEGORY_MAPPINGS[mimeType];
  }

  // Check extension
  const extension = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (extension && CATEGORY_MAPPINGS[extension]) {
    return CATEGORY_MAPPINGS[extension];
  }

  return 'other';
}

export function getVideoDurationLimit(): number {
  // 2 minutes in seconds
  return 120;
}

export function getTypicalVideoSize(durationSeconds: number): number {
  // Assuming 1080p at ~1 MB/second (moderate quality)
  return durationSeconds * 1024 * 1024;
}

export function getSuggestedMaxVideoSize(): number {
  // 2 minutes at 1 MB/s = ~120 MB, let's allow up to 200 MB for higher quality
  return 200 * 1024 * 1024;
}
