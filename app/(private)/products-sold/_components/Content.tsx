'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useModule } from "../_modules/useModule";
import { useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, ChevronRight, Package, TrendingUp, AlertCircle, Crown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import moment from "moment";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Content = () => {
  const { localData, flags, methods } = useModule();

  const { initDate, endDate, page } = localData;
  const { setInitDate, setEndDate, setPage } = methods;

  const totalProducts = Object.keys(localData.productsSold ?? {}).length;
  const totalQuantity = Object.values(localData.productsSold ?? {}).reduce((acc, curr) => acc + curr.quantity, 0);
  const totalPages = Math.ceil(totalProducts / 10);

  const tableBody = useMemo(() => {
    if (flags.isLoading || flags.isRefetching) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="w-12">
            <Skeleton className="h-4 w-8" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-full max-w-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-6 w-16 ml-auto" />
          </TableCell>
        </TableRow>
      ))
    }

    if (flags.isError) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-8">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-8 w-8" />
              <p>Error al cargar los datos</p>
            </div>
          </TableCell>
        </TableRow>
      )
    }

    const sortedProducts = Object.values(localData.productsSold ?? {})
      .sort((a, b) => b.quantity - a.quantity);

    if (sortedProducts.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-8">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Package className="h-8 w-8" />
              <p>No hay productos vendidos en este período</p>
            </div>
          </TableCell>
        </TableRow>
      )
    }

    const maxQuantity = sortedProducts[0]?.quantity || 0;

    return sortedProducts
      .slice((page - 1) * 10, page * 10)
      .map((product, index) => {
        const position = (page - 1) * 10 + index + 1;
        const isTopProduct = product.quantity === maxQuantity && maxQuantity > 0;
        return (
          <TableRow key={product.id} className={isTopProduct ? "bg-primary/5" : ""}>
            <TableCell className="font-medium text-muted-foreground w-12">
              {isTopProduct ? (
                <Crown className="h-4 w-4 text-yellow-500" />
              ) : (
                `#${position}`
              )}
            </TableCell>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {product.product}
                {isTopProduct && (
                  <Badge variant="secondary" className="text-xs">
                    Estrella
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-primary/20 rounded-full flex-1 max-w-[100px]">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(product.quantity / totalQuantity) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {((product.quantity / totalQuantity) * 100).toFixed(1)}%
                </span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Badge variant="secondary" className="font-semibold">
                {product.quantity}
              </Badge>
            </TableCell>
          </TableRow>
        )
      })

  }, [flags.isLoading, flags.isRefetching, flags.isError, page, localData.productsSold, totalQuantity])

  const content = useMemo(() => {
    if (!initDate || !endDate) return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Selecciona un rango de fechas para ver los productos vendidos
        </AlertDescription>
      </Alert>
    )

    if (moment(initDate).isAfter(moment(endDate))) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            La fecha inicial no puede ser mayor a la fecha final
          </AlertDescription>
        </Alert>
      )
    }

    return (
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">Productos únicos vendidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unidades Vendidas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuantity}</div>
              <p className="text-xs text-muted-foreground">Unidades totales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio por Producto</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalProducts > 0 ? (totalQuantity / totalProducts).toFixed(1) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Unidades promedio</p>
            </CardContent>
          </Card>
        </div>

        {/* Table Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Productos Vendidos</CardTitle>
                <CardDescription>
                  Del {moment(initDate).format("DD/MM/YYYY")} al {moment(endDate).format("DD/MM/YYYY")}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  disabled={page === 1}
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[80px] text-center">
                  Página {page} de {totalPages || 1}
                </span>
                <Button
                  disabled={page >= totalPages}
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Nombre del Producto</TableHead>
                  <TableHead>% del Total</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableBody}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }, [initDate, endDate, flags.isLoading, flags.isRefetching, flags.isError, localData.productsSold, page, totalProducts, totalQuantity, totalPages, tableBody])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Productos Vendidos</h1>
        <p className="text-muted-foreground">
          Análisis detallado de productos vendidos por período
        </p>
      </div>

      {/* Date Range Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end border rounded-lg p-4 bg-card">
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Desde</Label>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal w-[160px]",
                  !initDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {initDate ? moment(initDate).format("DD/MM/YYYY") : "Fecha inicial"}
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
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
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Hasta</Label>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal w-[160px]",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {endDate ? moment(endDate).format("DD/MM/YYYY") : "Fecha final"}
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Content */}
      {content}
    </div>
  )
}

export default Content;