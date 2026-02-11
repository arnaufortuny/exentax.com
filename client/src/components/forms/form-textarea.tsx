import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface FormTextareaProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  description?: string;
  minHeight?: string;
  className?: string;
}

export function FormTextarea<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  minHeight = "160px",
  className = "",
}: FormTextareaProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-xs md:text-sm font-bold text-foreground">
            {label}
          </FormLabel>
          {description && <FormDescription>{description}</FormDescription>}
          <FormControl>
            <Textarea
              {...field}
              className="rounded-2xl p-5 border-2 border-border dark:border-border focus:border-accent bg-white dark:bg-card transition-all font-medium text-foreground dark:text-white placeholder:text-muted-foreground text-base"
              style={{ minHeight }}
              placeholder={placeholder}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
