"use client";

import { useMemo, useState } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Settings, PlusCircle, DollarSign, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { Button } from "@/components/ui/button";
import DataTableColumnHeader from "@/components/DataTableHeader";
import { DataTable } from "@/components/DataTable";
import { ThreadPrice } from "@/types/RepositoryTypes/ThreadPrice";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useModule } from "../_module/useModule";
import ThreadPriceDialog from "./ThreadPriceDialog";

const SettingsContent = () => {
  const { methods, localData, flags } = useModule();
  const { setSorting, setDialogOpen } = methods;
  const { threadPrices, sorting, dialogOpen } = localData;
  const { isLoading } = flags;

  const columns: ColumnDef<ThreadPrice>[] = useMemo(
    () => [
      {
        id: "Fecha",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Fecha" />
        ),
        accessorKey: "date",
        cell: (cellData) => {
          const date = new Date(cellData.row.original.date);
          return (
            <div className="font-medium">
              {format(date, "dd 'de' MMMM, yyyy", { locale: es })}
            </div>
          );
        },
      },
      {
        id: "Precio por Kg",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Precio por Kg" />
        ),
        accessorKey: "pricePerKg",
        cell: (cellData) => {
          const price = cellData.row.original.pricePerKg;
          return (
            <div className="font-mono text-green-400">
              ${price.toFixed(2)} MXN
            </div>
          );
        },
      },
      {
        id: "Año",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Año" />
        ),
        accessorKey: "date",
        cell: (cellData) => {
          const date = new Date(cellData.row.original.date);
          return (
            <div className="text-muted-foreground">
              {date.getFullYear()}
            </div>
          );
        },
      },
      {
        id: "Creado",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Creado" />
        ),
        accessorKey: "created_at",
        cell: (cellData) => {
          const date = new Date(cellData.row.original.created_at);
          return (
            <div className="text-sm text-muted-foreground">
              {format(date, "dd/MM/yyyy HH:mm")}
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: threadPrices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  // Prepare chart data
  const chartData = useMemo(() => {
    return [...threadPrices]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((price) => ({
        date: format(new Date(price.date), "MMM yyyy", { locale: es }),
        fullDate: format(new Date(price.date), "dd/MM/yyyy"),
        price: price.pricePerKg,
      }));
  }, [threadPrices]);

  // Calculate stats
  const latestPrice = threadPrices.length > 0 ? threadPrices[0]?.pricePerKg : 0;
  const avgPrice = threadPrices.length > 0
    ? threadPrices.reduce((sum, p) => sum + p.pricePerKg, 0) / threadPrices.length
    : 0;
  const priceChange = threadPrices.length >= 2
    ? ((threadPrices[0]?.pricePerKg - threadPrices[1]?.pricePerKg) / threadPrices[1]?.pricePerKg) * 100
    : 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuración
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
          <p className="text-muted-foreground">
            Gestiona los precios del hilo y otros ajustes de la plataforma
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Agregar Precio
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Precio Actual</CardDescription>
            <CardTitle className="text-3xl font-mono text-green-400">
              ${latestPrice.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">MXN por kilogramo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Precio Promedio</CardDescription>
            <CardTitle className="text-3xl font-mono">
              ${avgPrice.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Histórico registrado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cambio Reciente</CardDescription>
            <CardTitle className={`text-3xl font-mono flex items-center gap-2 ${priceChange >= 0 ? 'text-red-400' : 'text-green-400'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
              <TrendingUp className={`h-5 w-5 ${priceChange >= 0 ? 'rotate-0' : 'rotate-180'}`} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Vs. precio anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-400" />
              Tendencia de Precios
            </CardTitle>
            <CardDescription>
              Evolución del precio del hilo a lo largo del tiempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                    formatter={(value: any) => [`$${value.toFixed(2)} MXN`, "Precio"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No hay datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-400" />
              Historial de Precios
            </CardTitle>
            <CardDescription>
              Registro detallado de todos los precios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              table={table}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="No hay precios registrados"
              enableShowColumns={false}
              enableInput={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Thread Price Dialog */}
      <ThreadPriceDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default SettingsContent;
