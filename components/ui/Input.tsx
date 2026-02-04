"use client";

import { ComponentProps, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500 dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-50 dark:placeholder:text-slate-500 ${className}`}
        {...props}
      />
    );
  }
);

