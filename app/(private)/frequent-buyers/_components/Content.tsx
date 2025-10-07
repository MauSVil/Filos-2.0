'use client';

import { useMemo } from "react";
import { useModule } from "../_modules/useModule";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Users, ShoppingCart, Package, AlertCircle, Crown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Content = () => {
  const { localData, flags, methods } = useModule();
  const { buyers, page } = localData;
  const { setPage } = methods;

  const totalBuyers = Object.keys(buyers ?? {}).length;
  const totalOrders = Object.values(buyers ?? {}).reduce((acc, curr) => acc + curr.orders, 0);
  const totalProducts = Object.values(buyers ?? {}).reduce((acc, curr) => acc + curr.products, 0);
  const totalPages = Math.ceil(totalBuyers / 10);

  const sortedBuyers = useMemo(() => {
    return Object.entries(buyers ?? {}).sort(([, a], [, b]) => b.orders - a.orders);
  }, [buyers]);

  const maxOrders = sortedBuyers[0]?.[1]?.orders || 0;
  const topBuyers = sortedBuyers.filter(([, data]) => data.orders === maxOrders && maxOrders > 0);
  const topBuyer = topBuyers[0];

  const tableBody = useMemo(() => {
    if (flags.isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="w-12">
            <Skeleton className="h-4 w-8" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-full max-w-sm" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-4 w-20 ml-auto" />
          </TableCell>
        </TableRow>
      ))
    }

    if (flags.isError) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-8 w-8" />
              <p>Error al cargar los datos</p>
            </div>
          </TableCell>
        </TableRow>
      )
    }

    if (totalBuyers === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Users className="h-8 w-8" />
              <p>No hay compradores registrados</p>
            </div>
          </TableCell>
        </TableRow>
      )
    }

    return sortedBuyers
      .slice((page - 1) * 10, page * 10)
      .map(([name, data], index) => {
        const position = (page - 1) * 10 + index + 1;
        const isTopBuyer = data.orders === maxOrders && maxOrders > 0;

        return (
          <TableRow key={name} className={isTopBuyer ? "bg-primary/5" : ""}>
            <TableCell className="font-medium text-muted-foreground w-12">
              {isTopBuyer ? (
                <Crown className="h-4 w-4 text-yellow-500" />
              ) : (
                `#${position}`
              )}
            </TableCell>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {name}
                {isTopBuyer && (
                  <Badge variant="secondary" className="text-xs">
                    Top
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="gap-1">
                <ShoppingCart className="h-3 w-3" />
                {data.orders}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="gap-1">
                <Package className="h-3 w-3" />
                {data.products}
              </Badge>
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {(data.products / data.orders).toFixed(1)} productos/orden
            </TableCell>
          </TableRow>
        )
      })
  }, [flags.isLoading, flags.isError, page, sortedBuyers, totalBuyers, maxOrders])

  const content = useMemo(() => {
    if (flags.isLoading && totalBuyers === 0) {
      return (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    }

    if (flags.isError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar los datos de compradores frecuentes
          </AlertDescription>
        </Alert>
      )
    }

    if (totalBuyers === 0) {
      return (
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            No hay compradores registrados en el año actual
          </AlertDescription>
        </Alert>
      )
    }

    return (
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Compradores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBuyers}</div>
              <p className="text-xs text-muted-foreground">Compradores únicos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">Órdenes totales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">Productos vendidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio Órdenes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalBuyers > 0 ? (totalOrders / totalBuyers).toFixed(1) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Órdenes por comprador</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Buyer(s) Highlight */}
        {topBuyers.length > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                {topBuyers.length > 1 ? `Compradores Top del Año (${topBuyers.length} empatados)` : 'Comprador Top del Año'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {topBuyers.map(([name, data]) => (
                  <div key={name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 last:pb-0 border-b last:border-b-0">
                    <div>
                      <p className="text-2xl font-bold">{name}</p>
                      <p className="text-sm text-muted-foreground">Cliente más frecuente</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{data.orders}</p>
                        <p className="text-xs text-muted-foreground">Órdenes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{data.products}</p>
                        <p className="text-xs text-muted-foreground">Productos</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Compradores Frecuentes</CardTitle>
                <CardDescription>
                  Ranking de compradores por número de órdenes realizadas
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
                  <TableHead>Nombre del Comprador</TableHead>
                  <TableHead>Órdenes</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead className="text-right">Promedio</TableHead>
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
  }, [flags.isLoading, flags.isError, page, totalBuyers, totalOrders, totalProducts, totalPages, topBuyers, tableBody])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Compradores Frecuentes</h1>
          <Badge variant="outline" className="text-sm">
            {new Date().getFullYear()}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Análisis de los compradores más activos en el año actual
        </p>
      </div>

      {/* Content */}
      {content}
    </div>
  )
}

export default Content;