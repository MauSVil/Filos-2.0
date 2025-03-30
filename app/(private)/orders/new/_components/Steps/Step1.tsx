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
import _ from "lodash";
import { ListFilter, MinusIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { ImageModal } from "@/app/(private)/products/_components/ImageModal";
import { useProducts } from "@/app/(private)/products/_hooks/useProducts";
import { DataTable } from "@/components/DataTable";
import DataTableColumnHeader from "@/components/DataTableHeader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Product } from "@/types/RepositoryTypes/Product";
import { Order } from "@/types/RepositoryTypes/Order";

const productOrderStatuses = ["Todos", "Con cantidad", "Sin cantidad"];

const Step1 = ({ order, type }: { order?: Order; type: "new" | "edit" }) => {
  const form = useFormContext();
  const [status, setStatus] = useState(productOrderStatuses[0]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "uniqId", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const productsQuery = useProducts();

  const productsFromOrder = useMemo(() => {
    if (!order) return [];

    return order.products || [];
  }, [order]);

  const products = useMemo(() => {
    const productsFromOrderMapped = _.keyBy(productsFromOrder, "product");

    return (productsQuery.data?.data || []).filter((product) => {
      if (status === "Todos") return true;
      if (
        status === "Con cantidad" &&
        productsFromOrderMapped[product._id!]?.quantity > 0
      )
        return true;
      if (
        status === "Sin cantidad" &&
        (productsFromOrderMapped[product._id!]?.quantity <= 0 ||
          productsFromOrderMapped[product._id]?.quantity === undefined)
      )
        return true;

      return false;
    });
  }, [productsQuery.data, status, productsFromOrder]);

  const { watch } = form;
  const productsForm = watch("products", {});

  const handleImageClick = async (image: string) => {
    try {
      await ImageModal({ image });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);

        return;
      }
      toast.error("An error occurred");
    }
  };

  const columns: ColumnDef<Product>[] = useMemo(
    () =>
      [
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
          maxSize: 10,
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
          id: "Acciones",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Acciones" />
          ),
          cell: (cellData) => (
            <div className="flex items-center gap-2">
              <Button
                className="h-6 w-6"
                size="icon"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  form.setValue("products", {
                    ...productsForm,
                    [cellData.row.original._id]: {
                      ...productsForm[cellData.row.original._id],
                      product: cellData.row.original._id,
                      quantity:
                        (productsForm[cellData.row.original._id]?.quantity ||
                          0) - 1,
                    },
                  });
                }}
              >
                <MinusIcon className="h-3.5 w-3.5" />
                <span className="sr-only">Download</span>
              </Button>
              <p className="text-base text-gray-500">
                {productsForm[cellData.row.original._id]?.quantity || 0}
              </p>
              <Button
                className="h-6 w-6"
                size="icon"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  form.setValue("products", {
                    ...productsForm,
                    [cellData.row.original._id]: {
                      ...productsForm[cellData.row.original._id],
                      product: cellData.row.original._id,
                      quantity:
                        (productsForm[cellData.row.original._id]?.quantity ||
                          0) + 1,
                    },
                  });
                }}
              >
                <PlusIcon className="h-3.5 w-3.5" />
                <span className="sr-only">More</span>
              </Button>
            </div>
          ),
        },
      ] satisfies ColumnDef<Product>[],
    [productsForm],
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
  });

  useEffect(() => {
    if (!order || Object.keys(productsForm || {}).length > 0) return;
    const { products } = order;
    const productsMapped = _.keyBy(products, "product");

    form.setValue("products", productsMapped);
  }, [order, productsForm]);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Productos</h3>
      {type === "edit" && (
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
                {productOrderStatuses.map((statusLabel) => {
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
          </div>
        </div>
      )}
      <DataTable
        className="mb-4"
        columns={columns}
        isLoading={productsQuery.isLoading}
        table={table}
      />
    </div>
  );
};

export default Step1;
