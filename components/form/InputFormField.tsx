import { FieldValues, UseControllerProps } from "react-hook-form";
import { useEffect, useState } from "react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

import { cn } from "@/lib/utils";

export interface NextUIInputFormFieldProps<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  controllerProps: UseControllerProps<T>;
  placeholder?: string;
  label?: string;
  valueModifierOnChange?: (value: string) => any;
  labelClassName?: string;
  debounceMs?: number; // Add debounce prop
}

export const InputFormField = <T extends FieldValues>(
  props: NextUIInputFormFieldProps<T>,
) => {
  const {
    controllerProps,
    hidden,
    placeholder,
    label,
    type = "text",
    className,
    valueModifierOnChange,
    labelClassName,
    debounceMs,
    ...rest
  } = props;

  return (
    <FormField
      {...controllerProps}
      render={({ field }) => {
        const [localValue, setLocalValue] = useState(field.value);

        // Sync local value when field value changes externally
        useEffect(() => {
          setLocalValue(field.value);
        }, [field.value]);

        // Debounce handler
        useEffect(() => {
          if (!debounceMs) return;

          const handler = setTimeout(() => {
            if (localValue !== field.value) {
              field.onChange(localValue);
            }
          }, debounceMs);

          return () => clearTimeout(handler);
        }, [localValue, debounceMs, field]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          if (type === "file") {
            field.onChange(e.target.files?.[0]);
            return;
          }

          const value = e.target.value;
          const processedValue = valueModifierOnChange ? valueModifierOnChange(value) : value;

          if (debounceMs) {
            // Update local state immediately for responsive UI
            setLocalValue(processedValue);
          } else {
            // Update form state immediately if no debounce
            field.onChange(processedValue);
          }
        };

        return (
          <FormItem className={className} hidden={hidden}>
            <div className="flex gap-2">
              <FormLabel
                className={cn("text-white", {
                  [labelClassName!]: labelClassName,
                })}
              >
                {label}
              </FormLabel>
              <FormMessage className="text-red-400 text-xs" />
            </div>
            <FormControl>
              <Input
                {...field}
                className={className}
                placeholder={placeholder}
                type={type}
                {...rest}
                value={
                  type === "file"
                    ? ""
                    : type === "number" && (debounceMs ? localValue : field.value) === 0
                      ? ""
                      : (debounceMs ? (localValue ?? "") : (field.value ?? ""))
                }
                onChange={handleChange}
              />
            </FormControl>
          </FormItem>
        );
      }}
    />
  );
};
