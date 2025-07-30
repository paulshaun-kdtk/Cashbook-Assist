import React, { ReactNode } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils"; // assuming your classNames util is here

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
        outline: "bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
        info: "bg-blue-500 text-white shadow-theme-xs hover:bg-blue-600 disabled:bg-blue-300",
        success: "bg-green-500 text-white shadow-theme-xs hover:bg-green-600 disabled:bg-green-300",
        danger: "bg-red-500 text-white shadow-theme-xs hover:bg-red-600 disabled:bg-red-300",
        warning: "bg-yellow-500 text-white shadow-theme-xs hover:bg-yellow-600 disabled:bg-yellow-300",
        light: "bg-gray-100 text-gray-700 shadow-theme-xs hover:bg-gray-200 disabled:bg-gray-300",
        dark: "bg-gray-800 text-white shadow-theme-xs hover:bg-gray-900 disabled:bg-gray-700",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
        link: "bg-transparent text-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/50",
        link_success: "bg-transparent text-emerald-500 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/50",
        link_ghost: "bg-transparent text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900/50",
        link_info: "bg-transparent text-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/50",
        link_danger: "bg-transparent text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50",
        link_dark: "bg-transparent text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900/50",
        link_light: "bg-transparent text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900/50",
        link_error: "bg-transparent text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50",
        link_primary: "bg-transparent text-brand-500 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/50",
        link_warning: "bg-transparent text-yellow-500 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/50",
      },
      size: {
        sm: "px-4 py-3 text-sm",
        md: "px-5 py-3.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export type ButtonProps = {
  children?: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
} & VariantProps<typeof buttonVariants>;

const Button: React.FC<ButtonProps> = ({
  children,
  startIcon,
  endIcon,
  onClick,
  disabled,
  className,
  variant,
  size,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export { buttonVariants };
export default Button;
