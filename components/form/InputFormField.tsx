import { Input } from "@nextui-org/input";
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from ".";
import { FieldValues, FormState, UseControllerProps } from "react-hook-form";

export interface NextUIInputFormFieldProps<T extends FieldValues> extends React.InputHTMLAttributes<HTMLInputElement> {
  controllerProps: UseControllerProps<T>;
  label: string;
  description?: string;
  hidden?: boolean;
  valueModifierOnChange?: (item: string) => any;
  error?: string;
}

export const InputFormField = <T extends FieldValues>(props: NextUIInputFormFieldProps<T>) => {
  const {
    controllerProps,
    label,
    description,
    hidden,
    valueModifierOnChange,
    error,
    ...rest
  } = props;
  return (
    <FormField
      {...controllerProps}
      render={({ field }) => (
        <FormItem hidden={hidden}>
          <FormControl>
            <Input
              isInvalid={!!error}
              errorMessage={error}
              value={field.value}
              label={label}
              description={description}
              onValueChange={(value) => {
                if (valueModifierOnChange) {
                  field.onChange(valueModifierOnChange(value));
                } else {
                  field.onChange(value);
                }
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
};