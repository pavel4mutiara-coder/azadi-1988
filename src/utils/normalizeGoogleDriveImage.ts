/**
 * In-memory cache for normalized image URLs to prevent costly repetitive string parsing
 * and Regex execution across app-wide lists of leaders and members.
 */
const normalizationCache = new Map<string, string>();
const driveIdCache = new Map<string, string | null>();

/**
 * Safely decodes any percent-encoded or obfuscated URL strings recursively
 * (up to a safe depth of 3 nested encodings) to detect hidden scripting attempts.
 */
function recursivelyDecode(str: string): string {
  let decoded = str;
  let prev = '';
  let depth = 0;
  
  while (decoded !== prev && depth < 3) {
    prev = decoded;
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      break;
    }
    depth++;
  }
  
  // Strip null bytes, control characters, and line breaks
  return decoded.replace(/[\x00-\x1F\x7F-\x9F]/g, "").replace(/\s+/g, "").trim();
}

/**
 * Safely extracts the Google Drive File ID from a variety of Google Drive URL formats.
 */
export function extractGoogleDriveId(url: string | null | undefined): string | null {
  if (!url) return null;
  const inputUrl = url.trim();
  
  if (driveIdCache.has(inputUrl)) {
    return driveIdCache.get(inputUrl)!;
  }

  const decoded = recursivelyDecode(inputUrl);

  // Severe protocol injection / scripting validation (reconfigured to catch obfuscated/encoded variants)
  if (/^(javascript|data|file|vbscript|onload|onerror|onmouseover):/i.test(decoded)) {
    driveIdCache.set(inputUrl, null);
    return null;
  }

  // Must belong to drive.google.com domain
  if (!/drive\.google\.com/i.test(decoded)) {
    driveIdCache.set(inputUrl, null);
    return null;
  }

  try {
    let parsed: URL;
    if (/^https?:\/\//i.test(decoded)) {
      parsed = new URL(decoded);
    } else {
      parsed = new URL('https://' + decoded);
    }

    if (/drive\.google\.com/i.test(parsed.hostname)) {
      // 1. Path segment check (e.g. /file/d/FILE_ID/view)
      const pathSegments = parsed.pathname.split('/');
      const dIndex = pathSegments.indexOf('d');
      if (dIndex !== -1 && pathSegments[dIndex + 1]) {
        const id = pathSegments[dIndex + 1];
        if (id && /^[a-zA-Z0-9_-]{25,50}$/.test(id)) {
          driveIdCache.set(inputUrl, id);
          return id;
        }
      }

      // 2. Query param 'id' check (e.g. ?id=FILE_ID or /open?id=FILE_ID)
      const idParam = parsed.searchParams.get('id');
      if (idParam && /^[a-zA-Z0-9_-]{25,50}$/.test(idParam)) {
        driveIdCache.set(inputUrl, idParam);
        return idParam;
      }
    }
  } catch (e) {
    // Fall back to regex parsing if URL parsing fails
  }

  // Regex fallback matching for common drive URLs:
  // /file/d/FILE_ID
  const fileDMatch = decoded.match(/\/file\/d\/([a-zA-Z0-9_-]{25,50})/i);
  if (fileDMatch && fileDMatch[1]) {
    driveIdCache.set(inputUrl, fileDMatch[1]);
    return fileDMatch[1];
  }

  // ?id=FILE_ID or &id=FILE_ID or uc?id=FILE_ID
  const idQueryMatch = decoded.match(/[?&]id=([a-zA-Z0-9_-]{25,50})/i);
  if (idQueryMatch && idQueryMatch[1]) {
    driveIdCache.set(inputUrl, idQueryMatch[1]);
    return idQueryMatch[1];
  }

  driveIdCache.set(inputUrl, null);
  return null;
}

/**
 * Robustly normalizes an image URL. If it's a Google Drive link, it transforms
 * it into a direct webview content URL or is validated/sanitized.
 * Supports smart detection of Dropbox, direct imagery/CDNs, etc.
 */
export function normalizeGoogleDriveImage(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Return cached normalization immediately if available
  if (normalizationCache.has(trimmed)) {
    return normalizationCache.get(trimmed)!;
  }

  const decoded = recursivelyDecode(trimmed);

  // Security checks for malicious injection attempts (XSS or Open Redirect filters)
  if (/^(javascript|data|file|vbscript|onload|onerror|onmouseover):/i.test(decoded)) {
    normalizationCache.set(trimmed, '');
    return '';
  }

  // Ensure that absolute URLs start with http/https, else verify if it is an app-relative path (e.g., '/logo.png')
  if (!/^https?:\/\//i.test(decoded) && !/^\//.test(decoded)) {
    // Simple hostname conversion helper (e.g., converts 'mycloud.com/img.jpg' safely)
    if (/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/i.test(decoded)) {
      const parsedUrl = 'https://' + decoded;
      normalizationCache.set(trimmed, parsedUrl);
      return parsedUrl;
    }
    normalizationCache.set(trimmed, '');
    return '';
  }

  // Detect Google Drive Link
  if (/drive\.google\.com/i.test(decoded)) {
    const fileId = extractGoogleDriveId(trimmed);
    if (fileId) {
      // Extract t param
      let tParam = '';
      const match = trimmed.match(/[?&](t|v)=([a-zA-Z0-9]+)/);
      if (match) {
        tParam = `&t=${match[2]}`;
      }
      // Preferred format: uvexport-view links bypass interactive auth redirects
      const normalizedDriveUrl = `https://drive.google.com/uc?export=view&id=${fileId}${tParam}`;
      normalizationCache.set(trimmed, normalizedDriveUrl);
      return normalizedDriveUrl;
    }
  }

  // Detect Dropbox Link
  if (/dropbox\.com/i.test(decoded)) {
    try {
      const parsed = new URL(decoded);
      parsed.searchParams.set('raw', '1');
      const dropboxUrl = parsed.toString();
      normalizationCache.set(trimmed, dropboxUrl);
      return dropboxUrl;
    } catch {
      const fallbackDropBox = decoded.replace(/\?dl=0/i, '?raw=1').replace(/\?dl=1/i, '?raw=1');
      normalizationCache.set(trimmed, fallbackDropBox);
      return fallbackDropBox;
    }
  }

  // Default passthrough
  normalizationCache.set(trimmed, decoded);
  return decoded;
}

/**
 * Returns a fallback thumbnail URL for a Google Drive File ID if the uc endpoint fails.
 */
export function getGoogleDriveThumbnailUrl(url: string | null | undefined): string {
  if (!url) return '';
  const fileId = extractGoogleDriveId(url);
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  return normalizeGoogleDriveImage(url);
}
