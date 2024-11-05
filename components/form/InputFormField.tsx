import { FieldValues, UseControllerProps } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

export interface NextUIInputFormFieldProps<T extends FieldValues> extends React.InputHTMLAttributes<HTMLInputElement> {
  controllerProps: UseControllerProps<T>;
  placeholder?: string;
  label?: string;
}

export const InputFormField = <T extends FieldValues>(props: NextUIInputFormFieldProps<T>) => {
  const {
    controllerProps,
    hidden,
    placeholder,
    label,
    type = "text",
    className,
    ...rest
  } = props;
  return (
    <FormField
      {...controllerProps}
      render={({ field }) => (
        <FormItem hidden={hidden} className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              placeholder={placeholder}
              type={type}
              className={className}
              {...rest}
            />
          </FormControl>
          <FormMessage className="text-xs text-red-500" />
        </FormItem>
      )}
    />
  )
};