/**
 * File type detection and categorization utilities
 */

export type FileCategory = 'image' | 'video' | 'audio' | 'text' | 'pdf' | 'other';

export interface FileTypeInfo {
  category: FileCategory;
  mimeType: string;
  canPreview: boolean;
}

const extensionMap: Record<string, FileTypeInfo> = {
  // Images
  jpg: { category: 'image', mimeType: 'image/jpeg', canPreview: true },
  jpeg: { category: 'image', mimeType: 'image/jpeg', canPreview: true },
  png: { category: 'image', mimeType: 'image/png', canPreview: true },
  gif: { category: 'image', mimeType: 'image/gif', canPreview: true },
  webp: { category: 'image', mimeType: 'image/webp', canPreview: true },
  svg: { category: 'image', mimeType: 'image/svg+xml', canPreview: true },
  bmp: { category: 'image', mimeType: 'image/bmp', canPreview: true },
  ico: { category: 'image', mimeType: 'image/x-icon', canPreview: true },

  // Videos
  mp4: { category: 'video', mimeType: 'video/mp4', canPreview: true },
  webm: { category: 'video', mimeType: 'video/webm', canPreview: true },
  ogg: { category: 'video', mimeType: 'video/ogg', canPreview: true },
  mov: { category: 'video', mimeType: 'video/quicktime', canPreview: true },
  avi: { category: 'video', mimeType: 'video/x-msvideo', canPreview: false },
  mkv: { category: 'video', mimeType: 'video/x-matroska', canPreview: false },

  // Audio
  mp3: { category: 'audio', mimeType: 'audio/mpeg', canPreview: true },
  wav: { category: 'audio', mimeType: 'audio/wav', canPreview: true },
  m4a: { category: 'audio', mimeType: 'audio/mp4', canPreview: true },
  flac: { category: 'audio', mimeType: 'audio/flac', canPreview: true },
  aac: { category: 'audio', mimeType: 'audio/aac', canPreview: true },

  // Text
  txt: { category: 'text', mimeType: 'text/plain', canPreview: true },
  md: { category: 'text', mimeType: 'text/markdown', canPreview: true },
  json: { category: 'text', mimeType: 'application/json', canPreview: true },
  xml: { category: 'text', mimeType: 'text/xml', canPreview: true },
  html: { category: 'text', mimeType: 'text/html', canPreview: true },
  css: { category: 'text', mimeType: 'text/css', canPreview: true },
  js: { category: 'text', mimeType: 'text/javascript', canPreview: true },
  ts: { category: 'text', mimeType: 'text/typescript', canPreview: true },
  csv: { category: 'text', mimeType: 'text/csv', canPreview: true },

  // PDF
  pdf: { category: 'pdf', mimeType: 'application/pdf', canPreview: true },
};

/**
 * Get file type info from filename
 */
export function getFileTypeInfo(filename: string): FileTypeInfo {
  const extension = filename.split('.').pop()?.toLowerCase();

  if (extension && extensionMap[extension]) {
    return extensionMap[extension];
  }

  return {
    category: 'other',
    mimeType: 'application/octet-stream',
    canPreview: false,
  };
}

/**
 * Check if a file can be previewed based on filename
 */
export function canPreviewFile(filename: string): boolean {
  return getFileTypeInfo(filename).canPreview;
}

/**
 * Get appropriate icon name for file type
 */
export function getFileIcon(filename: string): string {
  const { category } = getFileTypeInfo(filename);

  switch (category) {
    case 'image':
      return 'Image';
    case 'video':
      return 'Video';
    case 'audio':
      return 'Music';
    case 'text':
      return 'FileText';
    case 'pdf':
      return 'FileText';
    default:
      return 'File';
  }
}
