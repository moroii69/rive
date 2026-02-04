"use client";

import { ComponentProps, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none ring-0 transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 ${className}`}
        {...props}
      />
    );
  }
);

