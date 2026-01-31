import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
  onValueChange?: (value: string) => void;
}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, children, placeholder, value, onValueChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onValueChange?.(e.target.value);
      onChange?.(e);
    };

    return (
      <div className="relative w-full">
        <select
          ref={ref}
          value={value || ""}
          onChange={handleChange}
          className={cn(
            "flex min-h-[44px] md:min-h-[36px] w-full appearance-none items-center rounded-full border border-border bg-white dark:bg-zinc-900 px-4 py-3 md:py-2 pr-10 text-base md:text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-muted-foreground",
            className
          )}
          style={{ fontSize: '16px' }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
      </div>
    );
  }
);
NativeSelect.displayName = "NativeSelect";

interface NativeSelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {}

const NativeSelectItem = React.forwardRef<HTMLOptionElement, NativeSelectItemProps>(
  ({ className, children, ...props }, ref) => (
    <option ref={ref} className={cn("py-2", className)} {...props}>
      {children}
    </option>
  )
);
NativeSelectItem.displayName = "NativeSelectItem";

export { NativeSelect, NativeSelectItem };
