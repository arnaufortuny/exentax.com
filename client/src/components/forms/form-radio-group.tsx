import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface FormRadioGroupProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  description?: string;
  options: string[];
  columns?: 1 | 2 | 3;
  className?: string;
}

export function FormRadioGroup<T extends FieldValues>({
  control,
  name,
  label,
  description,
  options,
  columns = 1,
  className = "",
}: FormRadioGroupProps<T>) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={`space-y-4 ${className}`}>
          {label && (
            <FormLabel className="text-sm md:text-base font-black text-primary">
              {label}
            </FormLabel>
          )}
          {description && <FormDescription>{description}</FormDescription>}
          <FormControl>
            <div className={`grid ${gridCols[columns]} gap-3`}>
              {options.map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center gap-3 p-4 rounded-full border cursor-pointer transition-all active:scale-95 ${
                    field.value === opt
                      ? "border-[#6EDC8A] bg-[#6EDC8A]/5"
                      : "border-gray-200 bg-white hover:border-[#6EDC8A]/50"
                  }`}
                >
                  <input
                    type="radio"
                    {...field}
                    value={opt}
                    checked={field.value === opt}
                    className="hidden"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      field.value === opt ? "border-[#6EDC8A]" : "border-gray-200"
                    }`}
                  >
                    {field.value === opt && (
                      <div className="w-2 h-2 rounded-full bg-[#6EDC8A]" />
                    )}
                  </div>
                  <span className="font-black text-xs md:text-sm text-primary tracking-tight">
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
