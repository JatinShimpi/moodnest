import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "ghost" | "danger";

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-md text-[13px] font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover px-3 py-1.5",
  ghost: "bg-transparent border border-border text-text-muted hover:text-text hover:bg-panel-hover px-3 py-1.5",
  danger: "bg-transparent text-danger hover:bg-danger/10 px-3 py-1.5",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(({ className, variant = "primary", ...props }, ref) => (
  <button ref={ref} className={clsx(base, variants[variant], className)} {...props} />
));
Button.displayName = "Button";
