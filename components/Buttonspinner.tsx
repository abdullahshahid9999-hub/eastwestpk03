// components/ButtonSpinner.tsx
"use client";

import React from "react";

interface ButtonSpinnerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-[#002147] text-[#D4AF37] border border-[#D4AF37] hover:bg-[#002f63] focus:ring-[#D4AF37]",
  secondary:
    "bg-[#D4AF37] text-[#002147] hover:bg-[#c4a02d] focus:ring-[#002147]",
  danger:
    "bg-red-700 text-white hover:bg-red-800 focus:ring-red-400",
};

export function ButtonSpinner({
  loading = false,
  loadingText,
  variant = "primary",
  children,
  className = "",
  disabled,
  ...props
}: ButtonSpinnerProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        px-5 py-2.5 rounded-lg text-sm font-semibold
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-60 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      )}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  );
}