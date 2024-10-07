import { useProducts } from "@/app/(private)/products/_hooks/useProducts";
import { DataTable } from "@/components/DataTable";
import DataTableColumnHeader from "@/components/DataTableHeader";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/MongoTypes/Product";
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { MinusIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

const Step1 = () => {
  const form = useFormContext();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'uniqId', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')

  const productsQuery = useProducts();
  const products = useMemo(() => productsQuery.data?.data || [], [productsQuery.data]);

  const { watch } = form
  const productsForm = watch('products', {});

  const columns: ColumnDef<Product>[] = useMemo(
    () =>
      [
        {
          id: 'Imagen',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Imagen" />
          ),
          accessorKey: 'image',
          cell: (cellData) => {
            return (
              <Image
                width={50}
                height={50}
                className="rounded-medium"
                src={cellData.row.original.image}
                alt="image"
              />
            );
          },
        },
        {
          id: 'Modelo',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Modelo" />
          ),
          accessorKey: 'uniqId',
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
          maxSize: 10
        },
        {
          id: 'Color',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Color" />
          ),
          accessorKey: 'color',
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: 'Acciones',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Acciones" />
          ),
          cell: (cellData) => (
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  form.setValue('products', {
                    ...productsForm,
                    [cellData.row.original._id]: {
                      ...productsForm[cellData.row.original._id],
                      product: cellData.row.original._id,
                      quantity: (productsForm[cellData.row.original._id]?.quantity || 0) - 1,
                    },
                  })
                }}
              >
                <MinusIcon className="h-3.5 w-3.5" />
                <span className="sr-only">Download</span>
              </Button>
              <p className="text-base text-gray-500">
                {productsForm[cellData.row.original._id]?.quantity || 0}
              </p>
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  form.setValue('products', {
                    ...productsForm,
                    [cellData.row.original._id]: {
                      ...productsForm[cellData.row.original._id],
                      product: cellData.row.original._id,
                      quantity: (productsForm[cellData.row.original._id]?.quantity || 0) + 1,
                    },
                  })
                }}
              >
                <PlusIcon className="h-3.5 w-3.5" />
                <span className="sr-only">More</span>
              </Button>
            </div>
          ),
        },
      ] satisfies ColumnDef<Product>[],
    [productsForm]
  );

  const table = useReactTable({
    data: products,
    columns,
    getRowId(originalRow) {
      return originalRow._id;
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
    },
  })

  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Productos</h3>
      <DataTable
        table={table}
        isLoading={productsQuery.isLoading}
        columns={columns}
        className='mb-4'
      />
    </div>
  )
}

export default Step1;