import { FieldValues, UseControllerProps } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Label } from "../ui/label";

export interface RadioGroupFormFieldProps<T extends FieldValues> {
  controllerProps: UseControllerProps<T>;
  label: string;
  items: { label: string, value: string}[];
}

const RadioGroupFormField = <T extends FieldValues>(props: RadioGroupFormFieldProps<T>) => {
  const { items, label, controllerProps } = props;
  return (
    <FormField
      {...controllerProps}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="mb-2">{label}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              {items.map((item) => (
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={item.value} />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {item.label}
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export { RadioGroupFormField }