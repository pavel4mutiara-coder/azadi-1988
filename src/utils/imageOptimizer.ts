import { extractGoogleDriveId } from './normalizeGoogleDriveImage';

/**
 * Optimizes an image URL by applying dynamic resizing query parameters 
 * or routing heavy external URLs through a highly optimized WebP image proxy.
 *
 * Target size presets:
 * - small: 150px (fine grid profiles, testimonials)
 * - medium: 300px (standard leader profiles)
 * - large: 600px (event photos, large cards)
 */
export function getOptimizedImageUrl(
  url: string | null | undefined, 
  width = 300,
  version?: string | number
): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // If it's a data URL (Base64), return it as is
  if (trimmed.startsWith('data:')) {
    return trimmed;
  }

  // If it's a relative asset path, leave it as is
  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return trimmed;
  }

  // Extract cache-busting parameter (t or v) to append to the target optimized url
  let vParam = version ? `v=${version}` : '';
  if (!vParam) {
    try {
      const urlObj = new URL(trimmed);
      const t = urlObj.searchParams.get('t') || urlObj.searchParams.get('v');
      if (t) {
        vParam = `v=${t}`;
      }
    } catch {
      const match = trimmed.match(/[?&](t|v)=([a-zA-Z0-9_-]+)/);
      if (match) {
        vParam = `v=${match[2]}`;
      }
    }
  }

  // 1. Google Drive Image optimization: Rewrite to Google's CDN service with size parameter
  if (/drive\.google\.com/i.test(trimmed)) {
    const fileId = extractGoogleDriveId(trimmed);
    if (fileId) {
      const driveUrl = `https://lh3.googleusercontent.com/d/${fileId}=s${width}`;
      return vParam ? `${driveUrl}&${vParam}` : driveUrl;
    }
  }

  // 2. Unsplash Image optimization
  if (/images\.unsplash\.com/i.test(trimmed)) {
    try {
      const urlObj = new URL(trimmed);
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', 'crop');
      urlObj.searchParams.set('q', '80');
      if (vParam) {
        urlObj.searchParams.set('v', vParam.replace('v=', ''));
      }
      return urlObj.toString();
    } catch {
      let replaced = trimmed.replace(/[?&]w=\d+/g, `&w=${width}`);
      if (!replaced.includes('w=')) {
        replaced += `${replaced.includes('?') ? '&' : '?'}w=${width}&auto=format&fit=crop&q=80`;
      }
      return replaced;
    }
  }

  // Skip proxy for local development hosts and reliable Google CDNs
  const isLocalHost = trimmed.includes('localhost') || trimmed.includes('127.0.0.1') || trimmed.includes('0.0.0.0');
  const isGoogleOrFirebase = trimmed.includes('firebasestorage.googleapis.com') || trimmed.includes('googleusercontent.com') || trimmed.includes('googleapis.com');
  if (isLocalHost || isGoogleOrFirebase) {
    if (vParam && !trimmed.includes('v=') && !trimmed.includes('t=')) {
      return `${trimmed}${trimmed.includes('?') ? '&' : '?'}${vParam}`;
    }
    return trimmed;
  }

  // 3. General public external imagery: Route through high-density images.weserv.nl proxy
  try {
    const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(trimmed)}&w=${width}&output=webp&q=80`;
    return vParam ? `${proxyUrl}&${vParam}` : proxyUrl;
  } catch {
    if (vParam && !trimmed.includes('v=')) {
      return `${trimmed}${trimmed.includes('?') ? '&' : '?'}${vParam}`;
    }
    return trimmed;
  }
}

export const MAX_ALLOWED_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export function validateImageFileSize(fileOrBlob: Blob, maxSize = MAX_ALLOWED_FILE_SIZE_BYTES): boolean {
  return fileOrBlob.size <= maxSize;
}

