import React from "react";
import { cn } from "../utils/cn/cn";

const buttonVariants = {
  default: "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500",
  outline: "bg-transparent border border-indigo-600 text-indigo-600 hover:bg-indigo-100",
  link: "bg-transparent text-indigo-600 hover:underline",
  destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

const buttonSizes = {
  sm: "h-9 px-3 text-sm",
  default: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg",
};

const Button = React.forwardRef(
  ({ className = "", variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button"; // usamos <span> si queremos inyectar en <Link>

    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        {...props}
      >
        {props.children}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button };
