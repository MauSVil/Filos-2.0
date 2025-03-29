import { FieldValues, UseControllerProps } from "react-hook-form";

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
    ...rest
  } = props;

  return (
    <FormField
      {...controllerProps}
      render={({ field }) => (
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
              value={type === "file" ? "" : field.value}
              onChange={(e) => {
                if (type !== "file") {
                  const value = e.target.value;

                  if (valueModifierOnChange) {
                    field.onChange(valueModifierOnChange(value));
                  } else {
                    field.onChange(value);
                  }
                }
                if (type === "file") {
                  field.onChange(e.target.files?.[0]);
                }
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
