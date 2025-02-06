'use client';

import { useMemo, useState } from 'react';
import { useProducts } from '../_hooks/useProducts';
import { DataTable } from '@/components/DataTable';
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from '@tanstack/react-table';
import { Product } from '@/types/MongoTypes/Product';
import DataTableColumnHeader from '@/components/DataTableHeader';
import numeral from 'numeral';
import Image from 'next/image';
import { toast } from 'sonner';
import { ImageModal } from './ImageModal';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { NewCatalogModal } from './NewCatalogueModal';
import { Edit, MinusIcon, PlusIcon } from 'lucide-react';
import _ from 'lodash';
import { EditProductModal } from './EditProductModal';
import { useRouter } from 'next/navigation';

const ProductsContent = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'uniqId', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})

  const [productsToUpdate, setProductsToUpdate] = useState<{[key: string]: Product}>({});

  const productsQuery = useProducts();

  const router = useRouter();

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
          id: 'select',
          header: ({ table }) => (
            <Checkbox
              {...{
                checked: table.getIsSomeRowsSelected() ? 'indeterminate' : table.getIsAllRowsSelected(),
                // onCheckedChange: table.getToggleAllRowsSelectedHandler(),
              }}
            />
          ),
          cell: ({ row }) => (
            <div className="px-1">
              <Checkbox
                {...{
                  checked: row.getIsSelected(),
                  disabled: !row.getCanSelect(),
                  onCheckedChange: row.getToggleSelectedHandler(),
                }}
              />
            </div>
          ),
        },
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
          cell: (cellData) => {
            return (
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    setProductsToUpdate((prevState) => {
                      return {
                        ...prevState,
                        [cellData.row.original._id]: {
                          ...cellData.row.original,
                          quantity: (productsToUpdate[cellData.row.original._id]?.quantity || cellData.row.original.quantity || 0) - 1,
                        },
                      }
                    })
                  }}
                >
                  <MinusIcon className="h-3.5 w-3.5" />
                </Button>
                <p className="text-base text-gray-500">
                  {productsToUpdate[cellData.row.original._id]?.quantity || cellData.row.original.quantity || 0}
                </p>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setProductsToUpdate((prevState) => {
                      return {
                        ...prevState,
                        [cellData.row.original._id]: {
                          ...cellData.row.original,
                          quantity: (productsToUpdate[cellData.row.original._id]?.quantity || cellData.row.original.quantity || 0) + 1,
                        },
                      }
                    })
                  }}
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  <span className="sr-only">More</span>
                </Button>
              </div>
            )
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
        {
          id: 'Acciones',
          header: 'Acciones',
          cell: (cellData) => (
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6"
                onClick={() => {
                  router.push(`/products/${cellData.row.original._id}`);
                }}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </div>
          ),
        },
      ] satisfies ColumnDef<Product>[],
    [productsToUpdate]
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
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: "auto",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination,
      rowSelection
    },
  })

  const handleNewCatalogClick = async () => {
    try {
      const productIds = Object.keys(rowSelection);
      await NewCatalogModal({productIds});
      setRowSelection({});
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        return;
      }
      toast.error('An error occurred');
    }
  };

  const handleUpdateProductsClick = async () => {
    try {
      const resp = await EditProductModal({ products, productsToUpdate });
      productsQuery.refetch();
      if (resp === 'ok') {
        setProductsToUpdate({});
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        return;
      }
      toast.error('An error occurred');
    }
  }

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center gap-2">
          <Button
            className="ml-auto"
            disabled={!table.getSelectedRowModel().rows.length}
            onClick={handleNewCatalogClick}
          >
            Crear catalogo
          </Button>
          <Button
            disabled={!Object.keys(productsToUpdate).length}
            onClick={handleUpdateProductsClick}
          >
            Actualizar
          </Button>
        </div>
      </div>
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