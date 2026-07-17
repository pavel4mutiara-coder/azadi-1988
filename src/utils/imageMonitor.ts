/**
 * Image Monitoring Utility
 * 
 * When an image fails to load in the browser (triggering `onError`), 
 * standard HTMLImageElement events do not expose HTTP status codes or response headers.
 * 
 * This utility performs a lightweight background fetch to inspect the exact HTTP response
 * (including status codes and headers) of the failing image URL, specifically logging
 * 403 (Forbidden) and 404 (Not Found) errors, and logs them for diagnostics.
 */

export interface ImageFailureLog {
  url: string;
  context?: string;
  status?: number;
  statusText?: string;
  headers: Record<string, string>;
  timestamp: string;
  errorMessage?: string;
}

export async function logImageLoadFailure(url: string, context: string = 'General'): Promise<ImageFailureLog> {
  const logData: ImageFailureLog = {
    url,
    context,
    headers: {},
    timestamp: new Date().toISOString(),
  };

  try {
    // Perform a background fetch (using GET with a small range or simple head request to minimize bandwidth)
    // Some CDNs/storages block HEAD requests, so we attempt HEAD and fallback to GET
    let response: Response;
    try {
      response = await fetch(url, { method: 'HEAD', referrerPolicy: 'no-referrer' });
    } catch {
      response = await fetch(url, { method: 'GET', referrerPolicy: 'no-referrer' });
    }

    logData.status = response.status;
    logData.statusText = response.statusText;

    // Extract response headers
    response.headers.forEach((value, key) => {
      logData.headers[key] = value;
    });

    // Log the detailed result
    if (response.status === 403) {
      console.error(`[Image Monitor] 🚨 HTTP 403 Forbidden: Image failed to load under context "${context}". URL: ${url}`, logData);
    } else if (response.status === 404) {
      console.error(`[Image Monitor] 🚨 HTTP 404 Not Found: Image failed to load under context "${context}". URL: ${url}`, logData);
    } else {
      console.warn(`[Image Monitor] ⚠️ HTTP ${response.status}: Image failed to load under context "${context}". URL: ${url}`, logData);
    }
  } catch (error: any) {
    logData.errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Image Monitor] ❌ Failed to fetch image metadata for: "${url}" under context "${context}". Network error: ${logData.errorMessage}`, logData);
  }

  return logData;
}
