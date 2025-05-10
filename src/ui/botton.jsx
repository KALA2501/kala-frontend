import React from "react";
import { cn } from "../utils/cn/cn";

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild && props.children?.type ? props.children.type : "button";
    const childProps = asChild && props.children?.props ? props.children.props : {};

    const commonClasses = cn(
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
      {
        "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500": variant === "default",
        "bg-transparent border border-indigo-600 text-indigo-600 hover:bg-indigo-50": variant === "outline",
        "bg-transparent text-indigo-600 hover:bg-indigo-50 hover:underline": variant === "link",
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500": variant === "destructive",
        "h-10 px-4 py-2 text-sm": size === "default",
        "h-9 px-3 text-xs": size === "sm",
        "h-12 px-6 text-base": size === "lg",
      },
      className
    );

    if (asChild && props.children) {
      return React.cloneElement(props.children, {
        ...childProps,
        className: cn(childProps.className, commonClasses),
        ref
      });
    }

    return (
      <Comp
        className={commonClasses}
        ref={ref}
        {...props}
      >
        {props.children}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button };
