import { FieldValues, UseControllerProps } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { es } from "date-fns/locale";
import moment from "moment-timezone";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";

import { cn } from "@/lib/utils";

export interface NextUIInputFormFieldProps<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  controllerProps: UseControllerProps<T>;
  placeholder?: string;
  label?: string;
  emptyLabel?: string;
  description?: string;
}

export const DateFormField = <T extends FieldValues>(
  props: NextUIInputFormFieldProps<T>,
) => {
  const { controllerProps, label, emptyLabel, description } = props;

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
                  className={cn(
                    "w-[240px] pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                  variant={"outline"}
                >
                  {field.value ? (
                    <span>
                      {moment(field.value)
                        .tz("America/Mexico_City")
                        .format("DD/MM/YYYY")}
                    </span>
                  ) : (
                    <span>{emptyLabel}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                disabled={(date) =>
                  moment(date)
                    .tz("America/Mexico_City")
                    .isBefore(moment().tz("America/Mexico_City"))
                }
                lang="es"
                locale={es}
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
              />
            </PopoverContent>
          </Popover>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
