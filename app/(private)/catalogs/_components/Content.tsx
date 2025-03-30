"use client";

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
import { useMemo, useState } from "react";
import { DownloadIcon, EyeIcon } from "lucide-react";

import { useCatalogs } from "../_hooks/useCatalogs";

import { DataTable } from "@/components/DataTable";
import DataTableColumnHeader from "@/components/DataTableHeader";
import { Button } from "@/components/ui/button";
import { Catalog } from "@/types/RepositoryTypes/Catalog";

const CataloguesContent = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const catalogsQuery = useCatalogs();
  const catalogues = useMemo(
    () => catalogsQuery.data || [],
    [catalogsQuery.data],
  );

  const columns: ColumnDef<Catalog>[] = useMemo(
    () =>
      [
        {
          id: "Nombre",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nombre" />
          ),
          accessorKey: "name",
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
                disabled={!cellData.row.original.pdf}
                size="icon"
                variant="outline"
                onClick={() =>
                  window.open(
                    `${window.location.origin}/catalog/${cellData.row.original._id}`,
                    "_blank",
                  )
                }
              >
                <EyeIcon className="h-3.5 w-3.5" />
                <span className="sr-only">Ver</span>
              </Button>
              <Button
                className="h-6 w-6"
                size="icon"
                variant="outline"
                onClick={() => window.open(cellData.row.original.pdf, "_blank")}
              >
                <DownloadIcon className="h-3.5 w-3.5" />
                <span className="sr-only">Descargar</span>
              </Button>
            </div>
          ),
        },
      ] satisfies ColumnDef<Catalog>[],
    [],
  );

  const table = useReactTable({
    data: catalogues,
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
    <div className="flex flex-col w-full items-center py-4 gap-3">
      <DataTable
        className="w-full"
        columns={columns}
        isLoading={catalogsQuery.isLoading}
        table={table}
      />
    </div>
  );
};

export default CataloguesContent;
