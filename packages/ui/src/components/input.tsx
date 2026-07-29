import { Search } from "lucide-react";
import * as React from "react";
import { cn } from "../cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

// Recessed-field look (classic Aqua text field): an inset shadow reads as
// a groove cut into the surface, rather than a flat bordered box.
const baseInputClasses =
  "flex h-10 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-text " +
  "shadow-[inset_0_1px_2px_rgb(var(--shadow-color)/0.1),inset_0_1px_0_0_var(--bevel-lowlight)] " +
  "placeholder:text-text-subtle transition-colors duration-(--duration-fast) " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(baseInputClasses, invalid && "border-error focus-visible:ring-error", className)}
        aria-invalid={invalid || undefined}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export type SearchInputProps = Omit<InputProps, "type">;

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-subtle"
          aria-hidden
        />
        <Input ref={ref} type="search" className={cn("pl-9", className)} {...props} />
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";
