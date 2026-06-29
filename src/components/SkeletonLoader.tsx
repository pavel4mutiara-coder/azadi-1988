import React from 'react';

type SkeletonVariant = 'card' | 'list' | 'table' | 'stats' | 'profile' | 'notice' | 'text';

interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'card',
  count = 3,
  className = '',
}) => {
  // Base classes for shimmer effect
  const shimmerBase = 'animate-pulse bg-slate-200 dark:bg-slate-800 rounded-2xl';
  const textShimmer = 'animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg';

  const renderSkeleton = () => {
    switch (variant) {
      case 'stats':
        return (
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 ${className}`}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-soft flex flex-col items-center text-center gap-4"
              >
                {/* Icon Circle */}
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${shimmerBase}`} />
                {/* Value / Label */}
                <div className="w-full space-y-2 flex flex-col items-center">
                  <div className={`h-3 w-16 ${textShimmer}`} />
                  <div className={`h-6 w-24 ${textShimmer}`} />
                </div>
              </div>
            ))}
          </div>
        );

      case 'profile':
        return (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 ${className}`}>
            {Array.from({ length: count }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col items-center text-center space-y-4"
              >
                {/* Profile Image Circle */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse border-4 border-slate-50 dark:border-slate-950 shadow-md" />
                {/* Name */}
                <div className={`h-5 w-40 ${textShimmer}`} />
                {/* Designation */}
                <div className={`h-3.5 w-28 ${textShimmer}`} />
                {/* Phone */}
                <div className={`h-3 w-32 ${textShimmer}`} />
              </div>
            ))}
          </div>
        );

      case 'table':
        return (
          <div className={`bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-850 shadow-xl overflow-hidden ${className}`}>
            {/* Table Header Shimmer */}
            <div className="p-4 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center gap-4">
              <div className="flex gap-2 w-full sm:w-auto">
                <div className={`h-9 w-20 ${shimmerBase}`} />
                <div className={`h-9 w-20 ${shimmerBase}`} />
                <div className={`h-9 w-20 ${shimmerBase}`} />
              </div>
              <div className={`h-9 w-40 ${shimmerBase}`} />
            </div>
            {/* Table Rows */}
            <div className="p-6 space-y-6">
              {Array.from({ length: count }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/50 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl shrink-0 ${shimmerBase}`} />
                    <div className="space-y-2 flex-1">
                      <div className={`h-4 w-32 md:w-48 ${textShimmer}`} />
                      <div className={`h-3 w-20 md:w-28 ${textShimmer}`} />
                    </div>
                  </div>
                  <div className="space-y-2 w-full md:w-auto md:text-right">
                    <div className={`h-4 w-16 ${textShimmer} md:ml-auto`} />
                    <div className={`h-3 w-24 ${textShimmer} md:ml-auto`} />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto md:justify-end">
                    <div className={`h-8 w-8 ${shimmerBase}`} />
                    <div className={`h-8 w-8 ${shimmerBase}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'list':
        return (
          <div className={`space-y-6 ${className}`}>
            {Array.from({ length: count }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-emerald-50 dark:border-slate-800 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl border-b-8 border-b-emerald-500/5"
              >
                {/* Circular Indicator */}
                <div className={`w-16 h-16 rounded-2xl shrink-0 ${shimmerBase}`} />

                {/* Content Area */}
                <div className="flex-1 text-center md:text-left space-y-2.5 w-full">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                    <div className={`h-5 w-40 ${textShimmer}`} />
                    <div className={`h-4.5 w-20 ${textShimmer} self-center md:self-auto`} />
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <div className={`h-3 w-24 ${textShimmer}`} />
                    <div className={`h-3 w-32 ${textShimmer}`} />
                    <div className={`h-3 w-28 ${textShimmer}`} />
                  </div>
                </div>

                {/* Right block (Amount & button) */}
                <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto shrink-0">
                  <div className={`h-6 w-24 ${textShimmer}`} />
                  <div className={`h-9 w-32 ${shimmerBase}`} />
                </div>
              </div>
            ))}
          </div>
        );

      case 'notice':
        return (
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
            {Array.from({ length: count }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    {/* Badge */}
                    <div className={`h-5 w-16 ${textShimmer}`} />
                    {/* Date */}
                    <div className={`h-3.5 w-24 ${textShimmer}`} />
                  </div>
                  {/* Title */}
                  <div className={`h-5.5 w-5/6 ${textShimmer}`} />
                  {/* Content lines */}
                  <div className="space-y-2">
                    <div className={`h-3.5 w-full ${textShimmer}`} />
                    <div className={`h-3.5 w-11/12 ${textShimmer}`} />
                    <div className={`h-3.5 w-4/5 ${textShimmer}`} />
                  </div>
                </div>
                {/* Footer/Button */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/60">
                  <div className={`h-8 w-24 ${shimmerBase}`} />
                  <div className={`h-4 w-12 ${textShimmer}`} />
                </div>
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <div className={`space-y-3 ${className}`}>
            {Array.from({ length: count }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <div className={`h-4 w-full ${textShimmer}`} />
                <div className={`h-4 w-5/6 ${textShimmer}`} />
                <div className={`h-4 w-2/3 ${textShimmer}`} />
              </div>
            ))}
          </div>
        );

      case 'card':
      default:
        return (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 ${className}`}>
            {Array.from({ length: count }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-full"
              >
                {/* Image Skeleton */}
                <div className="h-48 md:h-56 bg-slate-200 dark:bg-slate-800 animate-pulse w-full" />
                {/* Card Body */}
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-3.5 w-24 ${textShimmer}`} />
                      <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <div className={`h-3.5 w-16 ${textShimmer}`} />
                    </div>
                    {/* Title */}
                    <div className={`h-5 w-11/12 ${textShimmer}`} />
                    {/* Content lines */}
                    <div className="space-y-2">
                      <div className={`h-3 w-full ${textShimmer}`} />
                      <div className={`h-3 w-5/6 ${textShimmer}`} />
                    </div>
                  </div>
                  {/* Action row */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    <div className={`h-9 w-32 ${shimmerBase}`} />
                    <div className={`h-4 w-12 ${textShimmer}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return <>{renderSkeleton()}</>;
};
