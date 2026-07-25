import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div 
      className={`animate-pulse bg-surface-container-high rounded-md ${className}`} 
      {...props}
    ></div>
  );
};

export const SkeletonRow = () => {
  return (
    <tr className="border-b border-border-glass bg-surface-glass">
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-3 w-32" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-6 py-4 text-center">
        <Skeleton className="h-6 w-12 rounded-full mx-auto" />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </td>
    </tr>
  );
};

export const MobileSkeletonCard = () => {
  return (
    <div className="p-4 flex flex-col gap-4 border-b border-border-glass">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-6 w-10 rounded-full" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full max-w-xs" />
      </div>
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-border-glass/50">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
};
