"use client";

import {
  ChevronRight,
  DownloadIcon,
  Edit,
  File,
  ListFilter,
} from "lucide-react";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import _ from "lodash";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import numeral from "numeral";
import moment from "moment-timezone";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/DataTable";
import DataTableColumnHeader from "@/components/DataTableHeader";
import { useModule } from "../_modules/useModule";
import { OrderClientType } from "@/types/v2/Order/Client.type";

export const statusTranslations: { [key: string]: string } = {
  retailPrice: "Semi-mayoreo",
  wholesalePrice: "Mayoreo",
  webPagePrice: "Pagina web",
  specialPrice: "Especial",
};

const OrdersContent = () => {
  const { localData, methods, flags, store } = useModule();
  const { total, pagination, orders, q, status, orderStatuses } = localData;
  const { setQ, setPagination, setStatus, setDownloadClick, openOrderDetail } = methods;
  const { buyers } = store;

  const router = useRouter();

  const columns: ColumnDef<OrderClientType>[] = useMemo(
    () =>
      [
        {
          id: "Comprador",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Comprador" />
          ),
          accessorKey: "buyer",
          cell: (cellData) => {
            console.log({ buyers, buyer: cellData.row.original.buyer });
            return (
              <div className="flex flex-col gap-1">
                <span>{buyers[cellData.row.original.buyer]?.name || 'N/A'}</span>
                <span className="text-xs text-muted-foreground">
                  {`Fecha compromiso: ${moment(cellData.row.original.dueDate).tz("America/Mexico_City").format("DD/MM/YYYY")}`}
                </span>
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
          id: "Tipo de orden",
          accessorKey: "orderType",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Tipo de orden" />
          ),
          accessorFn: ({ orderType }) => statusTranslations[orderType],
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Pagado",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Pagado" />
          ),
          accessorKey: "paid",
          cell: (cellData) => {
            return cellData.row.original.paid ? (
              <Badge variant="default">Si</Badge>
            ) : (
              <Badge variant="destructive">No</Badge>
            );
          },
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Productos",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Productos" />
          ),
          accessorFn: ({ products }) => _.sumBy(products, "quantity"),
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Total",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Total" />
          ),
          accessorFn: ({ finalAmount }) =>
            numeral(finalAmount).format("$0,0.00"),
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Acciones",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Acciones" />
          ),
          cell: (cellData) => (
            <div className="flex items-center gap-2">
              <Button
                className="h-6 w-6"
                disabled={!cellData.row.original.documents?.order}
                size="icon"
                variant="outline"
                onClick={() =>
                  setDownloadClick(cellData.row.original.documents?.order)
                }
              >
                <DownloadIcon className="h-3.5 w-3.5" />
                <span className="sr-only">Download</span>
              </Button>
              <Button
                className="h-6 w-6"
                disabled={
                  cellData.row.original.status !== "Pendiente" ||
                  cellData.row.original.paid
                }
                size="icon"
                variant="outline"
                onClick={() =>
                  router.push(`/orders/${cellData.row.original._id}`)
                }
              >
                <Edit className="h-3.5 w-3.5" />
                <span className="sr-only">Editar</span>
              </Button>
              <Button
                className="h-6 w-6"
                size="icon"
                variant="outline"
                onClick={() => openOrderDetail(cellData.row.original)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="sr-only">More</span>
              </Button>
            </div>
          ),
        },
      ] satisfies ColumnDef<OrderClientType>[],
    [buyers],
  );
  const table = useReactTable({
    data: orders,
    columns,
    getRowId(originalRow) {
      return originalRow._id?.toString();
    },
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setQ,
    manualFiltering: true,
    onPaginationChange: setPagination,
    globalFilterFn: "auto",
    state: {
      globalFilter: q,
      pagination,
    },
  });

  return (
    <div className="flex-1 items-start p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="h-7 gap-1 text-sm"
                  size="sm"
                  variant="outline"
                >
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">Filtrar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filrar por:</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {orderStatuses.map((statusLabel) => {
                  return (
                    <DropdownMenuCheckboxItem
                      checked={status === statusLabel}
                      onCheckedChange={() => setStatus(statusLabel)}
                    >
                      {statusLabel}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="h-7 gap-1 text-sm" size="sm" variant="outline">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Exportar</span>
            </Button>
          </div>
        </div>
        <DataTable
          className="mb-4"
          columns={columns}
          isLoading={flags.isLoading || flags.isRefetching}
          table={table}
        />
      </div>
    </div>
  );
};

export default OrdersContent;
