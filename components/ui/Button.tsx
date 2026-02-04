"use client";

import { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "ghost";
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed";
  const primary =
    "bg-indigo-500 text-white hover:bg-indigo-400 active:bg-indigo-500 shadow-sm shadow-indigo-500/30";
  const ghost =
    "border border-slate-700 text-slate-100 hover:bg-slate-800/80";

  const variantClass = variant === "primary" ? primary : ghost;

  return <button className={`${base} ${variantClass} ${className}`} {...props} />;
}

