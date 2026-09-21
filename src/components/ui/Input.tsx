import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, id, ...props }, ref) => {
    const inputId = id ?? React.useId();
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "h-12 rounded-x-md border border-border bg-surface px-4 text-base text-text-900",
            "placeholder:text-text-500 outline-none transition-colors",
            "focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={helperText || error ? `${inputId}-desc` : undefined}
          {...props}
        />
        {(helperText || error) && (
          <span
            id={`${inputId}-desc`}
            className={cn("text-xs", error ? "text-red-500" : "text-text-500")}
          >
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
