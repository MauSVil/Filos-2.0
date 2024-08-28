import { FieldValues, UseControllerProps } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { cn } from '@/utils/cn';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';

export interface ComboboxFormFieldProps<T extends FieldValues> {
  controllerProps: UseControllerProps<T>;
  label: string;
  placeholder?: string;
  items: { label: string, value: string}[];
  emptyLabel: string;
  searchLabel: string;
  onInputChange: (text: string) => void;
}

export function ComboboxFormField<T extends FieldValues>({
  controllerProps,
  label,
  items,
  placeholder,
  emptyLabel,
  searchLabel,
  onInputChange,
}: ComboboxFormFieldProps<T>) {
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
                        (item) => item.value === field.value
                      )?.label
                    : placeholder}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput
                  placeholder={searchLabel}
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (onInputChange) {
                      onInputChange(e.target.value);
                    }
                  }}
                />
                <CommandList>
                  <CommandEmpty>{emptyLabel}</CommandEmpty>
                  <CommandGroup>
                    {items.map((item) => (
                      <CommandItem
                        value={item.label}
                        key={item.value}
                        onSelect={() => {
                          field.onChange(item.value === 'none' ? undefined : item.value);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            item.value === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {item.label}
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
  );
}
