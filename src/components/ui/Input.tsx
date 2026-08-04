import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

const fieldStyles =
  "w-full rounded-md border border-border bg-panel px-2.5 py-1.5 text-[13px] text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={clsx(fieldStyles, className)} {...props} />
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={clsx(fieldStyles, "resize-none", className)} {...props} />
);
Textarea.displayName = "Textarea";
