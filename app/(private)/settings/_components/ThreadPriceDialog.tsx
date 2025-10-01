"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/form";
import { InputFormField } from "@/components/form/InputFormField";
import { ThreadPriceInput, ThreadPriceInputModel } from "@/types/RepositoryTypes/ThreadPrice";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ThreadPriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ThreadPriceDialog = ({ open, onOpenChange }: ThreadPriceDialogProps) => {
  const form = useForm<ThreadPriceInput>({
    resolver: zodResolver(ThreadPriceInputModel),
    defaultValues: {
      pricePerKg: 0,
      date: new Date(),
    },
  });

  const { control, handleSubmit, reset } = form;

  const onSubmit = async (data: ThreadPriceInput) => {
    try {
      const response = await fetch("/api/thread-prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create thread price");
      }

      // Close dialog and reset form
      onOpenChange(false);
      reset();

      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      console.error("Error creating thread price:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Precio del Hilo</DialogTitle>
          <DialogDescription>
            Registra el nuevo precio del hilo por kilogramo
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <InputFormField
              controllerProps={{
                control,
                name: "pricePerKg",
              }}
              label="Precio por Kg (MXN)"
              name="pricePerKg"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              valueModifierOnChange={(value) => (value === "" ? 0 : Number(value))}
            />

            <FormField
              control={control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP", { locale: es })
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  reset();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ThreadPriceDialog;
