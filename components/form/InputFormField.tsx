import { FieldValues, UseControllerProps } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

export interface NextUIInputFormFieldProps<T extends FieldValues> extends React.InputHTMLAttributes<HTMLInputElement> {
  controllerProps: UseControllerProps<T>;
  placeholder?: string;
}

export const InputFormField = <T extends FieldValues>(props: NextUIInputFormFieldProps<T>) => {
  const {
    controllerProps,
    hidden,
    placeholder,
    type = "text",
  } = props;
  return (
    <FormField
      {...controllerProps}
      render={({ field }) => (
        <FormItem hidden={hidden}>
          <FormControl>
            <Input
              {...field}
              placeholder={placeholder}
              type={type}
            />
          </FormControl>
          <FormMessage className="text-xs text-red-500" />
        </FormItem>
      )}
    />
  )
};