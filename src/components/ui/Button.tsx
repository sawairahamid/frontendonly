import type { ButtonHTMLAttributes, Ref } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  ref?: Ref<HTMLButtonElement>;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-white border border-accent hover:bg-[#2f74e8] active:bg-[#2a6ad6] disabled:bg-accent/40 disabled:border-accent/40",
  secondary:
    "bg-raised text-ink border border-line hover:bg-[#202b3f] hover:border-[#31405c] active:bg-[#1c2637]",
  ghost:
    "bg-transparent text-muted border border-transparent hover:bg-white/[0.04] hover:text-ink",
  danger:
    "bg-transparent text-err border border-err/40 hover:bg-err/10 active:bg-err/15",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-9 px-3.5 text-[13px] gap-2 rounded-lg",
};

export function Button({
  variant = "secondary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors duration-150",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {Icon ? <Icon className="size-4 shrink-0" strokeWidth={1.75} /> : null}
      {children}
      {IconRight ? <IconRight className="size-4 shrink-0" strokeWidth={1.75} /> : null}
    </button>
  );
}
