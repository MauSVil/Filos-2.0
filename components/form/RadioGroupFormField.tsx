import { FieldValues, UseControllerProps } from "react-hook-form";

import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Label } from "../ui/label";

import { cn } from "@/utils/cn";

export interface RadioGroupFormFieldProps<T extends FieldValues> {
  controllerProps: UseControllerProps<T>;
  label: string;
  items: { label: string; value: string; className: string }[];
  direction?: "row" | "column";
}

const RadioGroupFormField = <T extends FieldValues>(
  props: RadioGroupFormFieldProps<T>,
) => {
  const { items, label, controllerProps, direction = "column" } = props;

  return (
    <FormField
      {...controllerProps}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="mb-2">{label}</FormLabel>
          <FormControl>
            <RadioGroup
              className={cn("flex flex-row space-x-1", {
                "flex-col": direction === "column",
                "flex-row": direction === "row",
              })}
              defaultValue={field.value}
              value={field.value}
              onValueChange={field.onChange}
            >
              {items.map((item) => (
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={item.value} />
                  </FormControl>
                  <Label className={cn("font-normal", item.className)}>
                    {item.label}
                  </Label>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export { RadioGroupFormField };
