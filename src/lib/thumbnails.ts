/**
 * Thumbnail generation utilities
 * Generates thumbnails from images and videos client-side
 */

const THUMBNAIL_SIZE = 400; // Max width/height for thumbnails
const THUMBNAIL_QUALITY = 0.8; // JPEG quality

/**
 * Generate a thumbnail from an image file
 */
export async function generateImageThumbnail(
  imageData: Uint8Array,
  mimeType: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create blob from decrypted data
    const blob = new Blob([imageData as BlobPart], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const img = new Image();

    img.onload = () => {
      try {
        // Calculate thumbnail dimensions (maintain aspect ratio)
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > THUMBNAIL_SIZE) {
            height = (height * THUMBNAIL_SIZE) / width;
            width = THUMBNAIL_SIZE;
          }
        } else {
          if (height > THUMBNAIL_SIZE) {
            width = (width * THUMBNAIL_SIZE) / height;
            height = THUMBNAIL_SIZE;
          }
        }

        // Create canvas and draw scaled image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', THUMBNAIL_QUALITY);

        URL.revokeObjectURL(url);
        resolve(dataUrl);
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Generate a thumbnail from a video file
 */
export async function generateVideoThumbnail(
  videoData: Uint8Array,
  mimeType: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create blob from decrypted data
    const blob = new Blob([videoData as BlobPart], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      // Seek to 1 second or 10% of video duration
      const seekTime = Math.min(1, video.duration * 0.1);
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      try {
        // Calculate thumbnail dimensions
        let width = video.videoWidth;
        let height = video.videoHeight;

        if (width > height) {
          if (width > THUMBNAIL_SIZE) {
            height = (height * THUMBNAIL_SIZE) / width;
            width = THUMBNAIL_SIZE;
          }
        } else {
          if (height > THUMBNAIL_SIZE) {
            width = (width * THUMBNAIL_SIZE) / height;
            height = THUMBNAIL_SIZE;
          }
        }

        // Create canvas and draw video frame
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(video, 0, 0, width, height);

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', THUMBNAIL_QUALITY);

        URL.revokeObjectURL(url);
        resolve(dataUrl);
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video'));
    };

    video.src = url;
  });
}

/**
 * Get MIME type from filename
 */
export function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop() || '';

  // Image types
  const imageTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml',
  };

  // Video types
  const videoTypes: Record<string, string> = {
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'mkv': 'video/x-matroska',
    'ogg': 'video/ogg',
  };

  return imageTypes[ext] || videoTypes[ext] || 'application/octet-stream';
}
