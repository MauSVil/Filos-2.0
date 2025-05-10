'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useModule } from "../_modules/useModule";
import { useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Download } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import moment from "moment";
import { Label } from "@/components/ui/label";

const Content = () => {
  const { localData, flags, methods } = useModule();

  const { initDate, endDate } = localData;
  const { setInitDate, setEndDate } = methods;

  const tableBody = useMemo(() => {
    if (flags.isLoading || flags.isRefetching) {
      return (
        <>
          <TableRow>
            <TableCell>
              <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-16" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-16" />
            </TableCell>
          </TableRow>
        </>
      )
    }

    if (flags.isError) {
      return (
        <TableRow>
          <TableCell colSpan={2} className="text-center">Error al cargar los datos</TableCell>
        </TableRow>
      )
    }

    return Object.values(localData.productsSold ?? {})
    .sort((a, b) => b.quantity - a.quantity)
    .map((product) => (
      <TableRow key={product.id}>
        <TableCell>{product.product}</TableCell>
        <TableCell>{product.quantity}</TableCell>
      </TableRow>
    ))

  }, [flags.isLoading, flags.isRefetching, flags.isError])

  const content = useMemo(() => {
    if (!initDate || !endDate) return (
      <div className="text-center my-8">
        <p className="text-muted-foreground">Selecciona un rango de fechas para ver los productos vendidos</p>
      </div>
    )

    if (moment(initDate).isAfter(moment(endDate))) {
      return (
        <div className="text-center my-8">
          <p className="text-red-500">La fecha inicial no puede ser mayor a la fecha final</p>
        </div>
      )
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Cantidad</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableBody}
        </TableBody>
      </Table>
    )
  }, [initDate, endDate, flags.isLoading, flags.isRefetching, flags.isError, localData.productsSold])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Productos vendidos</h1>

      <div className="flex gap-2 items-end justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground">Desde</Label>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !initDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon />
                {initDate ? moment(initDate).format("DD/MM/YYYY") : "Seleccionar fecha inicial"}
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={initDate}
              onSelect={setInitDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground">Hasta</Label>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon />
                {endDate ? moment(endDate).format("DD/MM/YYYY") : "Seleccionar fecha final"}
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button variant={"outline"}>
          <Download />
          Exportar
        </Button>
      </div>
      <div className="p-4">
        {content}
      </div>
    </div>
  )
}

export default Content;