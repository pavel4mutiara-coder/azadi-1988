
import { useState, useCallback, useRef, useEffect } from 'react';
import { uploadService, UploadLog } from '../services/uploadService';

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  url: string | null;
  logs: UploadLog[];
  retryAttempt: number;
}

export const useImageUpload = () => {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    url: null,
    logs: [],
    retryAttempt: 0
  });

  const lastAttemptRef = useRef<{ file: File; folder: string } | null>(null);
  const MAX_AUTO_RETRIES = 2; // Keep it low to prevent infinite loops on mobile

  useEffect(() => {
    // Sync logs from the service in real-time
    const unsubscribe = uploadService.subscribe((logs) => {
      setState(prev => ({ ...prev, logs }));
    });
    return unsubscribe;
  }, []);

  const upload = useCallback(async (file: File, folder: string = 'uploads', retryCount = 0): Promise<string | null> => {
    // Reset global logs if this is a fresh manual attempt
    if (retryCount === 0) {
      uploadService.clearLogs();
    }
    
    lastAttemptRef.current = { file, folder };
    
    setState(prev => ({ 
      ...prev, 
      isUploading: true, 
      progress: retryCount > 0 ? prev.progress : 0, 
      error: retryCount > 0 ? `Retrying... (Attempt ${retryCount})` : null,
      retryAttempt: retryCount 
    }));

    try {
      const url = await uploadService.upload(file, folder, (progress) => {
        setState(prev => ({ ...prev, progress }));
      });

      setState(prev => ({ 
        ...prev, 
        isUploading: false, 
        progress: 100, 
        url,
        error: null,
        retryAttempt: 0
      }));
      
      return url;
    } catch (err: any) {
      console.warn(`[useImageUpload] Upload failed (Attempt ${retryCount}):`, err.message);

      // Automatic Retry Logic
      if (retryCount < MAX_AUTO_RETRIES) {
        const nextRetry = retryCount + 1;
        const delay = Math.pow(2, nextRetry) * 1500; // 3s, 6s
        
        setState(prev => ({ 
          ...prev, 
          error: `Network flicker. Auto-retrying in ${delay / 1000}s...` 
        }));

        await new Promise(r => setTimeout(r, delay));
        return upload(file, folder, nextRetry);
      }

      setState(prev => ({ 
        ...prev, 
        isUploading: false, 
        error: err.message,
        progress: 0
      }));
      throw err;
    }
  }, []);

  const retry = useCallback(() => {
    if (lastAttemptRef.current) {
      return upload(lastAttemptRef.current.file, lastAttemptRef.current.folder);
    }
    return Promise.reject(new Error("No previous upload found to retry."));
  }, [upload]);

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      url: null,
      logs: uploadService.getLogs(),
      retryAttempt: 0
    });
    lastAttemptRef.current = null;
  }, []);

  return {
    ...state,
    upload,
    retry,
    reset,
    hasLastAttempt: !!lastAttemptRef.current
  };
};
