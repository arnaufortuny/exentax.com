import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface FormSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  description?: string;
  options: { value: string; label: string }[] | string[];
  className?: string;
}

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Seleccionar...",
  description,
  options,
  className = "",
}: FormSelectProps<T>) {
  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

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
            <NativeSelect 
              value={field.value || ""} 
              onValueChange={field.onChange}
              placeholder={placeholder}
              className="rounded-full h-11 md:h-12 px-5 border-2 border-gray-200 dark:border-[#2A2A2A] focus:border-accent bg-white dark:bg-[#1A1A1A] transition-all font-medium text-foreground dark:text-white text-base"
            >
              {normalizedOptions.map(opt => (
                <NativeSelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </NativeSelectItem>
              ))}
            </NativeSelect>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
