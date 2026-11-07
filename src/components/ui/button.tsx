import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[3px] text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-olive-400 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-olive-600 text-ink-100 hover:bg-olive-500",
        secondary: "bg-ink-800 text-ink-200 border border-ink-700 hover:bg-ink-700",
        ghost: "text-ink-300 hover:bg-ink-800 hover:text-ink-100",
        outline: "border border-ink-600 text-ink-200 hover:bg-ink-800",
        active: "bg-olive-700 text-olive-300 border border-olive-600",
        danger: "bg-hostile/20 text-hostile border border-hostile/40 hover:bg-hostile/30",
      },
      size: {
        default: "h-7 px-2.5",
        sm: "h-6 px-2 text-[11px]",
        icon: "h-7 w-7",
        iconSm: "h-6 w-6",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";
