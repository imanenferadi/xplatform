import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "link";
type Size = "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-navy-900 text-text-on-primary hover:bg-blue-600 active:bg-navy-900/90 shadow-x-sm",
  secondary:
    "bg-surface text-text-900 border border-border hover:bg-blue-100 active:bg-blue-100",
  ghost: "bg-transparent text-text-900 hover:bg-surface-2",
  danger: "bg-red-500 text-white hover:opacity-90",
  link: "bg-transparent text-blue-600 hover:underline px-0 h-auto",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-sm rounded-x-md",
  lg: "h-12 px-6 text-base rounded-x-md",
  icon: "h-11 w-11 rounded-x-md",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          base,
          variant !== "link" && sizes[size],
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
