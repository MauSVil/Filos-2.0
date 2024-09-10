'use client';

import { useBuyers } from "../_hooks/useBuyers";
import { useEffect, useMemo, useState } from "react";
import { Button, Listbox, ListboxItem, Pagination, Skeleton } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { Buyer } from "@/types/MongoTypes/Buyer";
import DataTableColumnHeader from "@/components/DataTableHeader";

const BuyersContent = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'uniqId', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')

  const buyersQuery = useBuyers({});
  const buyers = useMemo(() => buyersQuery.data || [], [buyersQuery.data]);

  const columns: ColumnDef<Buyer>[] = useMemo(
    () =>
      [
        {
          id: 'Comprador',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Comprador" />
          ),
          accessorKey: 'name',
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: 'Email',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
          ),
          accessorKey: 'email',
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: 'Telefono',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Telefono" />
          ),
          accessorKey: 'phone',
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
      ] satisfies ColumnDef<Buyer>[],
    []
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
  })

  return (
    <div className="flex flex-col w-full items-center py-4 gap-3">
      <DataTable
        className="w-full"
        table={table}
        isLoading={buyersQuery.isLoading}
        columns={columns}
      />
    </div>
  );
};

export default BuyersContent;