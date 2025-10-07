"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Users, PlusCircle, Edit, TrendingUp, Building2, User, Mail, Phone, Eye } from "lucide-react";

import { useBuyers } from "../_hooks/useBuyers";

import { DataTable } from "@/components/DataTable";
import DataTableColumnHeader from "@/components/DataTableHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { BuyerBaseType } from "@/types/v2/Buyer/Base.type";

const BuyersContent = () => {
  const router = useRouter();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "uniqId", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const buyersQuery = useBuyers({});
  const buyers = useMemo(() => buyersQuery.data || [], [buyersQuery.data]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: buyers.length,
      chains: buyers.filter(b => b.isChain).length,
      individuals: buyers.filter(b => !b.isChain).length,
    };
  }, [buyers]);

  const columns: ColumnDef<BuyerBaseType>[] = useMemo(
    () =>
      [
        {
          id: "Acciones",
          header: "Acciones",
          cell: (cellData) => (
            <div className="flex items-center gap-1">
              <Button
                className="h-7 w-7 cursor-pointer"
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/buyers/${cellData.row.original._id}/statistics`);
                }}
                title="Ver estadísticas"
              >
                <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
              </Button>
              <Button
                className="h-7 w-7 cursor-pointer"
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/buyers/${cellData.row.original._id}`);
                }}
                title="Editar comprador"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </div>
          ),
        },
        {
          id: "Comprador",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Comprador" />
          ),
          accessorKey: "name",
          cell: (cellData) => {
            const buyer = cellData.row.original;
            return (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                  {buyer.isChain ? (
                    <Building2 className="h-5 w-5 text-primary" />
                  ) : (
                    <User className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{buyer.name}</span>
                  {buyer.isChain && (
                    <Badge variant="secondary" className="w-fit text-xs">
                      Cadena
                    </Badge>
                  )}
                </div>
              </div>
            );
          },
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Email",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
          ),
          accessorKey: "email",
          cell: (cellData) => {
            const email = cellData.row.original.email;
            return email ? (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{email}</span>
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">Sin email</span>
            );
          },
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Telefono",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Teléfono" />
          ),
          accessorKey: "phone",
          cell: (cellData) => {
            const phone = cellData.row.original.phone;
            return phone ? (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{phone}</span>
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">Sin teléfono</span>
            );
          },
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Dirección",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Dirección" />
          ),
          accessorKey: "address",
          cell: (cellData) => {
            const address = cellData.row.original.address;
            return address ? (
              <span className="text-sm max-w-xs truncate block" title={address}>
                {address}
              </span>
            ) : (
              <span className="text-muted-foreground text-sm">Sin dirección</span>
            );
          },
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
      ] satisfies ColumnDef<BuyerBaseType>[],
    [router],
  );

  const table = useReactTable({
    data: buyers,
    columns,
    getRowId(originalRow) {
      return originalRow._id;
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    globalFilterFn: "auto",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination,
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Compradores</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Gestión de Compradores</h1>
              <p className="text-muted-foreground text-lg">
                Administra tu cartera de clientes y consulta sus estadísticas de compra
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.push("/buyers/new")}
            size="default"
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Nuevo Comprador
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Compradores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Clientes registrados en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cadenas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.chains}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Compradores de tipo cadena
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Individuales</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.individuals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Compradores individuales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        isLoading={buyersQuery.isLoading}
        table={table}
      />
    </div>
  );
};

export default BuyersContent;
