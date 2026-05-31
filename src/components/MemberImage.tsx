import React, { useState, useEffect, useRef } from 'react';
import { User, Loader2 } from 'lucide-react';
import { normalizeGoogleDriveImage, getGoogleDriveThumbnailUrl, extractGoogleDriveId } from '../utils/normalizeGoogleDriveImage';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

interface MemberImageProps {
  src: string | null | undefined;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  isVacant?: boolean;
  widthPreset?: 'small' | 'medium' | 'large';
}

export const MemberImage: React.FC<MemberImageProps> = ({
  src,
  alt,
  fallbackSrc,
  className = '',
  isVacant = false,
  widthPreset = 'medium',
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [loadState, setLoadState] = useState<'loading' | 'success' | 'error'>('loading');
  
  // Track consecutive attempt retries to strictly prevent infinite fallback loops (Max 2 retries allowed)
  const [retryCount, setRetryCount] = useState<number>(0);
  
  // Reference to track active timeout timers and avoid memory leaks
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Validate properties to filter exceptionally oversized links or unsafe extensions early
  const isUrlUnsafe = (urlStr: string | null | undefined): boolean => {
    if (!urlStr) return false;
    // URL length check
    if (urlStr.length > 2083) return true;
    // Rejected malicious extension checks
    if (/\.(exe|dll|bat|sh|src|bin|cmd|zip|rar)$/i.test(urlStr)) return true;
    return false;
  };

  useEffect(() => {
    // Clear any previous active timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset loop protection metrics
    setLoadState('loading');
    setRetryCount(0);

    if (isVacant) {
      setLoadState('success');
      return;
    }

    if (isUrlUnsafe(src)) {
      console.warn(`[MemberImage Warning]: Rejected unsafe or overlong URL payload requested for: "${alt}".`);
      goToFallbackState(true); // jump straight to error
      return;
    }

    const targetWidth = widthPreset === 'small' ? 150 : widthPreset === 'large' ? 600 : 300;
    const primaryUrl = getOptimizedImageUrl(src, targetWidth);
    if (!primaryUrl) {
      goToFallbackState();
    } else {
      setCurrentSrc(primaryUrl);
      
      // Implement 8-Second Image Load Timeout to abort stuck images automatically
      timeoutRef.current = setTimeout(() => {
        if (loadState === 'loading') {
          console.warn(`[MemberImage Timeout]: Aborting stuck image load after 8000ms for: "${alt}".`);
          triggerNextFallback();
        }
      }, 8000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [src, fallbackSrc, isVacant, widthPreset]);

  const goToFallbackState = (immediateError = false) => {
    if (fallbackSrc && !immediateError) {
      setCurrentSrc(fallbackSrc);
      setLoadState('success');
    } else {
      setLoadState('error');
    }
  };

  const triggerNextFallback = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Logging failed image provider URLs for simple diagnostics
    console.warn(`[MemberImage Error Logs]: Failed loading sequence for target: "${alt}" (current try URL: "${currentSrc}", retry step: ${retryCount}).`);

    // Let's increment retry counts and switch pathways
    const nextRetry = retryCount + 1;
    setRetryCount(nextRetry);

    if (nextRetry > 2) {
      // Hard cap reached: switch to absolute error state to avoid infinite rendering cycles
      setLoadState('error');
      return;
    }

    // Try Google Drive Thumbnail API as Retry Level 1 Fallback
    if (src && extractGoogleDriveId(src) && nextRetry === 1) {
      const thumbUrl = getGoogleDriveThumbnailUrl(src);
      if (thumbUrl && thumbUrl !== currentSrc) {
        setCurrentSrc(thumbUrl);
        // Start a fresh 8s timeout timer for the thumbnail
        timeoutRef.current = setTimeout(() => {
          triggerNextFallback();
        }, 8000);
        return;
      }
    }

    // Try standard fallback placeholder as Retry Level 2 Fallback
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }

    // Final failure trigger
    setLoadState('error');
  };

  const handleLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setLoadState('success');
  };

  if (isVacant) {
    return (
      <div 
        className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full w-full h-full text-slate-300 dark:text-slate-700 aspect-square ${className}`}
        aria-hidden="true"
      >
        <User size={48} />
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950/40 rounded-full aspect-square shrink-0 group select-none"
    >
      {/* 
        SKELETON LOADER WITH PULSE EFFEC (CLS Prevention):
        Locks the visual geometry perfectly so the surrounding card content does not jitter or collapse.
      */}
      {loadState === 'loading' && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center justify-center gap-1.5 opacity-60">
            <Loader2 className="animate-spin text-emerald-500/70" size={20} />
            <span className="text-[8px] font-black uppercase text-emerald-600/50 tracking-wider">Loading</span>
          </div>
        </div>
      )}

      {/* Actual safe Renderable <img> */}
      {loadState !== 'error' && currentSrc ? (
        <img
          src={currentSrc}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover rounded-full transition-all duration-700 ${
            loadState === 'loading' ? 'opacity-0 scale-95' : 'opacity-100 scale-100 group-hover:scale-105'
          } ${className}`}
          onLoad={handleLoad}
          onError={triggerNextFallback}
        />
      ) : (
        /* Final fallbacks: Elegant CSS-Based graphic to prevent broken image badges showing in UI */
        <div 
          className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 aspect-square rounded-full"
          aria-hidden="true"
        >
          <User className="w-1/2 h-1/2" />
        </div>
      )}
    </div>
  );
};
