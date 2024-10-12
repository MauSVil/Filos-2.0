'use client';

import { useMemo, useState } from 'react';
import { useProducts } from '../_hooks/useProducts';
import { DataTable } from '@/components/DataTable';
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from '@tanstack/react-table';
import { Product } from '@/types/MongoTypes/Product';
import DataTableColumnHeader from '@/components/DataTableHeader';
import numeral from 'numeral';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';
import { toast } from 'sonner';
import { ImageModal } from './ImageModal';

const ProductsContent = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'uniqId', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')

  const productsQuery = useProducts();

  const products = useMemo(() => {
    return productsQuery.data?.data || [];
  }, [productsQuery.data?.data]);

  const handleImageClick = async (image: string) => {
    try {
      await ImageModal({ image });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        return;
      }
      toast.error('An error occurred');
    }
  };

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
                className="rounded-medium cursor-pointer"
                src={cellData.row.original.image}
                alt="image"
                onClick={() => handleImageClick(cellData.row.original.image)}
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
        },
        {
          id: 'Nombre',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nombre" />
          ),
          accessorKey: 'name',
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
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
          id: 'Talla',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Talla" />
          ),
          accessorKey: 'size',
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: 'Disponibilidad',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Disponibilidad" />
          ),
          accessorKey: 'quantity',
          cell: ({ row: { original: { quantity }} }) => {
            if (quantity <= 0) {
              return (
                <div className="flex items-center gap-4">
                  <p>{quantity} -</p>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="destructive">No disponible</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{quantity}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              );
            }

            if (quantity <= 5) {
              return (
                <div className="flex items-center gap-4">
                  <p>{quantity} -</p>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="warning">Pocas unidades</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{quantity}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              );
            }

            return (
              <div className="flex items-center gap-4">
                <p>{quantity} -</p>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="default">Disponible</Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{quantity}</p>
                  </TooltipContent>
                </Tooltip>              
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
          id: 'Precio especial',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Precio especial" className='text-green-400' />
          ),
          accessorKey: 'specialPrice',
          accessorFn: ({ specialPrice }) => numeral(specialPrice).format('$0,0.00'),
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: 'Precio mayoreo',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Precio mayoreo" className='text-purple-400' />
          ),
          accessorKey: 'wholesalePrice',
          accessorFn: ({ wholesalePrice }) => numeral(wholesalePrice).format('$0,0.00'),
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: 'Precio semi-mayoreo',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Precio semi-mayoreo" className='text-yellow-400' />
          ),
          accessorKey: 'retailPrice',
          accessorFn: ({ retailPrice }) => numeral(retailPrice).format('$0,0.00'),
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: 'Precio pagina web',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Precio pagina web" className='text-red-400' />
          ),
          accessorKey: 'webPagePrice',
          accessorFn: ({ webPagePrice }) => numeral(webPagePrice).format('$0,0.00'),
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
      ] satisfies ColumnDef<Product>[],
    []
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
    <>
      <DataTable
        table={table}
        isLoading={productsQuery.isLoading}
        columns={columns}
        className='mb-4'
      />
    </>
  )
}

export default ProductsContent;