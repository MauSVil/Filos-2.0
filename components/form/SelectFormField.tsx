import { FormControl, FormField, FormItem } from ".";
import { FieldValues, UseControllerProps } from "react-hook-form";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { FormLabel, FormMessage } from "../ui/form";

export interface NextUIInputFormFieldProps<T extends FieldValues> extends React.InputHTMLAttributes<HTMLInputElement> {
  controllerProps: UseControllerProps<T>;
  label: string;
  hidden?: boolean;
  valueModifierOnChange?: (item: string | undefined) => any;
  error?: string;
  placeholder?: string;
  description?: string;
  items: { label: string, value: string }[];
  handleValueChange?: (value: string) => void;
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
    handleValueChange,
    ...rest
  } = props;
  return (
    <FormField
      {...controllerProps}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value
                    ? items.find(
                        (language) => language.value === field.value
                      )?.label
                    : "Selecciona una clave unica"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Busca una clave..." onValueChange={handleValueChange} />
                <CommandList>
                  <CommandEmpty>No se encontro la clave</CommandEmpty>
                  <CommandGroup>
                    {items.map((language, idx) => (
                      <CommandItem
                        value={language.label}
                        key={`${language.value} - ${idx}`}
                        onSelect={() => {
                          field.onChange(language.value);
                        }}
                      >
                        {language.label}
                        <Check
                          className={cn(
                            "ml-auto",
                            language.value === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
};