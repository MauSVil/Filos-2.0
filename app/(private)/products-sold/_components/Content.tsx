'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useModule } from "../_modules/useModule";
import { useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import moment from "moment";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const Content = () => {
  const { localData, flags, methods } = useModule();

  const { initDate, endDate, page } = localData;
  const { setInitDate, setEndDate, setPage } = methods;

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
    .slice((page - 1) * 10, page * 10)
    .map((product) => (
      <TableRow key={product.id}>
        <TableCell>{product.product}</TableCell>
        <TableCell>{product.quantity}</TableCell>
      </TableRow>
    ))

  }, [flags.isLoading, flags.isRefetching, flags.isError, page])

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
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-4 justify-end">
          <Badge className="text-sm font-semibold mr-5">
            Total: {Object.keys(localData.productsSold ?? {}).length}
          </Badge>
          <Button
            disabled={page === 1}
            size={"sm"}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="text-sm">
            {`${page} / ${Math.ceil((Object.keys(localData.productsSold ?? {}).length || 0) / 10)}`}
          </span>
          <Button
            disabled={Math.ceil((Object.keys(localData.productsSold ?? {}).length || 0) / 10) <= page}
            form=""
            size={"sm"}
            onClick={() => setPage((prev) => prev + 1)}
          >
            <ChevronRight size={14} />
          </Button>
        </div>
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
      </div>
    )
  }, [initDate, endDate, flags.isLoading, flags.isRefetching, flags.isError, localData.productsSold, page])

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
                  "justify-start text-left font-normal",
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
                  "justify-start text-left font-normal",
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