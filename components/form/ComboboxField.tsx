import { FieldValues, UseControllerProps } from "react-hook-form";
import { Check, ChevronsUpDown } from "lucide-react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

import { cn } from "@/utils/cn";

export interface ComboboxFormFieldProps<T extends FieldValues> {
  controllerProps: UseControllerProps<T>;
  label: string;
  placeholder?: string;
  items: { label: string; value: string }[];
  emptyLabel: string;
  searchLabel: string;
  onInputChange?: (text: string) => void;
  isLoading?: boolean;
  className?: string;
  labelClassName?: string;
}

export function ComboboxFormField<T extends FieldValues>({
  controllerProps,
  label,
  items,
  placeholder,
  emptyLabel,
  searchLabel,
  onInputChange,
  isLoading = false,
  className,
  labelClassName,
}: ComboboxFormFieldProps<T>) {
  return (
    <FormField
      {...controllerProps}
      render={({ field }) => (
        <FormItem className="flex flex-col">
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
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  className={cn(
                    "justify-between",
                    !field.value && "text-muted-foreground",
                    className,
                  )}
                  role="combobox"
                  variant="outline"
                >
                  {field.value
                    ? items.find((item) => item.value === field.value)?.label
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
                  {isLoading ? (
                    <CommandEmpty>Cargando...</CommandEmpty>
                  ) : (
                    <>
                      <CommandEmpty>{emptyLabel}</CommandEmpty>
                      <CommandGroup>
                        {items.map((item) => (
                          <CommandItem
                            key={item.value}
                            value={item.label}
                            onSelect={() => {
                              field.onChange(
                                item.value === "none" ? undefined : item.value,
                              );
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                item.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {item.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </FormItem>
      )}
    />
  );
}
