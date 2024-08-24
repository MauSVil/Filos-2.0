import { Input } from "@nextui-org/input";
import { FormControl, FormField, FormItem } from ".";
import { FieldValues, UseControllerProps } from "react-hook-form";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";

export interface NextUIInputFormFieldProps<T extends FieldValues> extends React.InputHTMLAttributes<HTMLInputElement> {
  controllerProps: UseControllerProps<T>;
  label: string;
  hidden?: boolean;
  valueModifierOnChange?: (item: string | undefined) => any;
  error?: string;
  placeholder?: string;
  description?: string;
  items: { label: string, value: string }[];
}

export const SelectFormField = <T extends FieldValues>(props: NextUIInputFormFieldProps<T>) => {
  const {
    controllerProps,
    label,
    hidden,
    valueModifierOnChange,
    error,
    placeholder,
    description,
    items,
    ...rest
  } = props;
  return (
    <FormField
      {...controllerProps}
      render={({ field }) => (
        <FormItem hidden={hidden}>
          <FormControl>
            <Autocomplete
              label={label}
              isInvalid={!!error}
              errorMessage={error}
              placeholder={placeholder}
              selectedKey={field.value}
              description={description}
              onSelectionChange={(item) => {
                console.log(item, 'item');
                if (valueModifierOnChange) {
                  field.onChange(valueModifierOnChange(item?.toString()));
                } else {
                  field.onChange(item?.toString());
                }
              }}
              defaultItems={items}
            >
              {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
            </Autocomplete>
          </FormControl>
        </FormItem>
      )}
    />
  )
};