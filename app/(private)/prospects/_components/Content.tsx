"use client";

import { useMemo } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Calculator, PlusCircle, Eye, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import DataTableColumnHeader from "@/components/DataTableHeader";
import { DataTable } from "@/components/DataTable";
import { Prospect } from "@/types/RepositoryTypes/Prospect";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useModule } from "../_module/useModule";

const ProspectsContent = () => {
  const { methods, localData, flags } = useModule();
  const { setSorting } = methods;
  const { prospects, sorting } = localData;
  const { isLoading } = flags;
  const router = useRouter();

  const columns: ColumnDef<Prospect>[] = useMemo(
    () => [
      {
        id: "Nombre",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Nombre" />
        ),
        accessorKey: "name",
        cell: (cellData) => {
          const prospect = cellData.row.original;
          return (
            <div className="font-medium">{prospect.name}</div>
          );
        },
      },
      {
        id: "Suéteres",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Cantidad Total" />
        ),
        accessorKey: "sweaters",
        cell: (cellData) => {
          const totalQuantity = cellData.row.original.sweaters.reduce((sum, sweater) => {
            return sum + (sweater.quantity || 0);
          }, 0);
          return (
            <div className="text-center font-medium">
              {totalQuantity} {totalQuantity === 1 ? "suéter" : "suéteres"}
            </div>
          );
        },
      },
      {
        id: "Conceptos",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Conceptos de Costo" />
        ),
        accessorKey: "costConcepts",
        cell: (cellData) => {
          const count = cellData.row.original.costConcepts.length;
          return (
            <div className="text-center">
              {count} {count === 1 ? "concepto" : "conceptos"}
            </div>
          );
        },
      },
      {
        id: "Precio Hilo",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Precio Hilo/Kg" />
        ),
        accessorKey: "settings.threadPricePerKg",
        cell: (cellData) => {
          const price = cellData.row.original.settings.threadPricePerKg;
          return (
            <div className="font-mono text-green-400">
              ${price.toFixed(2)}
            </div>
          );
        },
      },
      {
        id: "Costo Total",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Costo Mínimo" />
        ),
        cell: (cellData) => {
          const prospect = cellData.row.original;
          // Calculate total minimum cost from all sweaters
          const totalCost = prospect.sweaters.reduce((sum, sweater) => {
            return sum + (sweater.calculatedCosts?.totalCost || 0);
          }, 0);
          return (
            <div className="font-mono text-green-400 font-semibold">
              ${totalCost.toFixed(2)}
            </div>
          );
        },
      },
      {
        id: "Creado",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Fecha de Creación" />
        ),
        accessorKey: "created_at",
        cell: (cellData) => {
          const date = new Date(cellData.row.original.created_at);
          return (
            <div className="text-sm">
              {format(date, "dd/MM/yyyy", { locale: es })}
            </div>
          );
        },
      },
      {
        id: "Acciones",
        header: "Acciones",
        cell: (cellData) => {
          const prospect = cellData.row.original;
          return (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push(`/prospects/${prospect._id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalles
            </Button>
          );
        },
      },
    ],
    [router],
  );

  const table = useReactTable({
    data: prospects,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Prospectos
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl font-bold tracking-tight">Análisis de Costos</h1>
          <p className="text-muted-foreground">
            Calcula el costo mínimo de venta para tus suéteres
          </p>
        </div>
        <Button onClick={() => router.push("/prospects/new")}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nuevo Prospecto
        </Button>
      </div>

      {/* Prospects Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-gray-400" />
            Todos los Prospectos
          </CardTitle>
          <CardDescription>
            Gestiona y analiza los costos de tus productos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            table={table}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No hay prospectos registrados"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProspectsContent;
