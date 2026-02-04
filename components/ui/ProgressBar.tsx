import React from "react";

type ProgressBarProps = {
  value: number; // 0-100
};

export function ProgressBar({ value }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
      <div
        className="h-full rounded-full bg-neutral-900 transition-[width] duration-150 ease-out dark:bg-neutral-100"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

