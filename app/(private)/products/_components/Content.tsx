"use client";

import { useMemo } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import numeral from "numeral";
import Image from "next/image";
import { ChevronDown, Edit, MinusIcon, Plus, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTableColumnHeader from "@/components/DataTableHeader";
import { DataTable } from "@/components/DataTable";
import { Product } from "@/types/RepositoryTypes/Product";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useModule } from "../_module/useModule";

const ProductsContent = () => {
  const { methods, localData, flags } = useModule();
  const { handleImageClick, handleNewCatalogClick, handleUpdateProductsClick, setPagination, setColumnVisibility, setColumnFilters, setGlobalFilter, setSorting, setRowSelection, setProductsToUpdate } = methods;
  const { products, sorting, columnFilters, columnVisibility, pagination, rowSelection, productsToUpdate, total } = localData;

  const router = useRouter();

  const columns: ColumnDef<Product>[] = useMemo(
    () =>
      [
        {
          id: "select",
          header: ({ table }) => (
            <Checkbox
              {...{
                checked: table.getIsSomeRowsSelected()
                  ? "indeterminate"
                  : table.getIsAllRowsSelected(),
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
          id: "Imagen",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Imagen" />
          ),
          accessorKey: "image",
          cell: (cellData) => {
            return (
              <Image
                alt="image"
                className="rounded-medium cursor-pointer"
                height={50}
                src={cellData.row.original.image!}
                width={50}
                onClick={() => handleImageClick(cellData.row.original.image!)}
              />
            );
          },
        },
        {
          id: "Modelo",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Modelo" />
          ),
          accessorKey: "uniqId",
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
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
          id: "Color",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Color" />
          ),
          accessorKey: "color",
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Talla",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Talla" />
          ),
          accessorKey: "size",
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Disponibilidad",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Disponibilidad" />
          ),
          accessorKey: "quantity",
          cell: (cellData) => {
            return (
              <div className="flex items-center gap-2">
                <Button
                  className="h-6 w-6"
                  size="icon"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    setProductsToUpdate((prevState) => {
                      return {
                        ...prevState,
                        [cellData.row.original._id]: {
                          ...cellData.row.original,
                          quantity:
                            (productsToUpdate[cellData.row.original._id]
                              ?.quantity ||
                              cellData.row.original.quantity ||
                              0) - 1,
                        },
                      };
                    });
                  }}
                >
                  <MinusIcon className="h-3.5 w-3.5" />
                </Button>
                <p
                  className={cn("text-base text-gray-500", {
                    "text-red-200":
                      (productsToUpdate[cellData.row.original._id]?.quantity ||
                        cellData.row.original.quantity ||
                        0) < 0,
                  })}
                >
                  {productsToUpdate[cellData.row.original._id]?.quantity ||
                    cellData.row.original.quantity ||
                    0}
                </p>
                <Button
                  className="h-6 w-6"
                  size="icon"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setProductsToUpdate((prevState) => {
                      return {
                        ...prevState,
                        [cellData.row.original._id]: {
                          ...cellData.row.original,
                          quantity:
                            (productsToUpdate[cellData.row.original._id]
                              ?.quantity ||
                              cellData.row.original.quantity ||
                              0) + 1,
                        },
                      };
                    });
                  }}
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  <span className="sr-only">More</span>
                </Button>
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
          id: "Precio especial",
          header: ({ column }) => (
            <DataTableColumnHeader
              className="text-green-400"
              column={column}
              title="Precio especial"
            />
          ),
          accessorKey: "specialPrice",
          accessorFn: ({ specialPrice }) =>
            numeral(specialPrice).format("$0,0.00"),
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Precio mayoreo",
          header: ({ column }) => (
            <DataTableColumnHeader
              className="text-purple-400"
              column={column}
              title="Precio mayoreo"
            />
          ),
          accessorKey: "wholesalePrice",
          accessorFn: ({ wholesalePrice }) =>
            numeral(wholesalePrice).format("$0,0.00"),
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Precio semi-mayoreo",
          header: ({ column }) => (
            <DataTableColumnHeader
              className="text-yellow-400"
              column={column}
              title="Precio semi-mayoreo"
            />
          ),
          accessorKey: "retailPrice",
          accessorFn: ({ retailPrice }) =>
            numeral(retailPrice).format("$0,0.00"),
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Precio pagina web",
          header: ({ column }) => (
            <DataTableColumnHeader
              className="text-red-400"
              column={column}
              title="Precio pagina web"
            />
          ),
          accessorKey: "webPagePrice",
          accessorFn: ({ webPagePrice }) =>
            numeral(webPagePrice).format("$0,0.00"),
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Acciones",
          header: "Acciones",
          cell: (cellData) => (
            <div className="flex items-center gap-2">
              <Button
                className="h-6 w-6"
                size="icon"
                variant="outline"
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
    [productsToUpdate],
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
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    manualFiltering: true,
    onSortingChange: setSorting,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: "auto",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
      rowSelection,
    },
  });

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center gap-2">
          <Button
            disabled={!Object.keys(productsToUpdate).length}
            onClick={handleUpdateProductsClick}
          >
            Actualizar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="default"
              >
                Acciones
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => {
                  router.push("/products/new");
                }}
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Crear producto
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!table.getSelectedRowModel().rows.length}
                onClick={handleNewCatalogClick}
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Crear catalogo
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <DataTable
        className="mb-4"
        columns={columns}
        isLoading={flags.isLoading}
        table={table}
        totalHits={total}
      />
    </>
  );
};

export default ProductsContent;
