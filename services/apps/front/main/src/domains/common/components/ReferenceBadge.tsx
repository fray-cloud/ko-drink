import React from 'react';

interface ReferenceBadgeProps {
  left: string;
  right: string;
}

export function ReferenceBadge({ left, right }: ReferenceBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-md overflow-hidden shadow-sm my-1 mx-0.5">
      <span className="px-2 text-sm font-medium text-white bg-gray-600 dark:bg-gray-700">
        {left}
      </span>
      <span className="px-2 text-sm font-medium text-white bg-blue-500 dark:bg-blue-800">
        {right}
      </span>
    </span>
  );
}

