import { FieldValues, UseControllerProps } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Switch } from "../ui/switch";

export interface NextUIInputFormFieldProps<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  controllerProps: UseControllerProps<T>;
  placeholder?: string;
  label?: string;
}

export const SwitchFormField = <T extends FieldValues>(
  props: NextUIInputFormFieldProps<T>,
) => {
  const { controllerProps, hidden, label, className } = props;

  return (
    <FormField
      {...controllerProps}
      render={({ field }) => (
        <FormItem className={className} hidden={hidden}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Switch
              {...field}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <FormMessage className="text-xs text-red-500" />
        </FormItem>
      )}
    />
  );
};
