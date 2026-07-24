import { extractGoogleDriveId } from './normalizeGoogleDriveImage';

/**
 * Optimizes an image URL by applying dynamic resizing query parameters 
 * or routing heavy external URLs through a highly optimized WebP image proxy.
 * This ensures that low-end devices only download appropriate size assets.
 * 
 * Target size presets:
 * - small: 150px (fine grid profiles, testimonials)
 * - medium: 300px (standard leader profiles)
 * - large: 600px (event photos, large cards)
 */
export function getOptimizedImageUrl(url: string | null | undefined, width = 300): string {
  if (!url) return '';
  const trimmed = url.trim();

  // If it's a data URL (Base64), return it as is
  if (trimmed.startsWith('data:')) {
    return trimmed;
  }

  // If it's a relative asset path, leave it as is
  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return trimmed;
  }

  // Extract cache-busting parameter (t or v) to append to the target optimized url
  let tParam = '';
  try {
    const urlObj = new URL(trimmed);
    const t = urlObj.searchParams.get('t') || urlObj.searchParams.get('v');
    if (t) {
      tParam = `&t=${t}`;
    }
  } catch (e) {
    const match = trimmed.match(/[?&](t|v)=([a-zA-Z0-9]+)/);
    if (match) {
      tParam = `&t=${match[2]}`;
    }
  }

  // 1. Google Drive Image optimization: Rewrite to Google's CDN service with size parameter
  if (/drive\.google\.com/i.test(trimmed)) {
    const fileId = extractGoogleDriveId(trimmed);
    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}=s${width}`;
    }
  }

  // 2. Unsplash Image optimization: Tweak width parameters directly via Unsplash source engine
  if (/images\.unsplash\.com/i.test(trimmed)) {
    try {
      const urlObj = new URL(trimmed);
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', 'crop');
      urlObj.searchParams.set('q', '80');
      return urlObj.toString();
    } catch {
      let replaced = trimmed.replace(/[?&]w=\d+/g, `&w=${width}`);
      if (!replaced.includes('w=')) {
        replaced += `${replaced.includes('?') ? '&' : '?'}w=${width}&auto=format&fit=crop&q=80`;
      }
      return replaced;
    }
  }

  // Skip proxy for local development hosts and reliable Google CDNs / Firebase Storage
  const isLocalHost = trimmed.includes('localhost') || trimmed.includes('127.0.0.1') || trimmed.includes('0.0.0.0');
  const isGoogleOrFirebase = trimmed.includes('firebasestorage.googleapis.com') || trimmed.includes('googleusercontent.com') || trimmed.includes('googleapis.com');
  if (isLocalHost || isGoogleOrFirebase) {
    return trimmed;
  }

  // 3. General public external imagery: Route through high-density images.weserv.nl proxy
  try {
    return `https://wsrv.nl/?url=${encodeURIComponent(trimmed)}&w=${width}&output=webp&q=80${tParam}`;
  } catch (e) {
    return trimmed;
  }
}

export const MAX_ALLOWED_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export function validateImageFileSize(fileOrBlob: Blob, maxSize = MAX_ALLOWED_FILE_SIZE_BYTES): boolean {
  return fileOrBlob.size <= maxSize;
}

/**
 * Downsamples and compresses an uploaded image file client-side using Canvas rendering.
 * Excellent for preventing huge multi-megabyte smart-phone camera photos from overloading
 * database state or visual renderings on low-end devices.
 */
export async function compressInputImage(
  fileOrBlob: Blob,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.75
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (fileOrBlob.size > MAX_ALLOWED_FILE_SIZE_BYTES) {
      return reject(new Error(`File size (${(fileOrBlob.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 15MB.`));
    }

    if (!fileOrBlob.type.startsWith('image/')) {
      return resolve(fileOrBlob);
    }

    const reader = new FileReader();
    reader.readAsDataURL(fileOrBlob);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(fileOrBlob);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob || fileOrBlob);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => {
        resolve(fileOrBlob);
      };
    };
    reader.onerror = () => {
      resolve(fileOrBlob);
    };
  });
}
