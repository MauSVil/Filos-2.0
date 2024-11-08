'use client'

import { useMemo, useState } from "react";
import { useDashboard } from "../_hooks/useDashboard";
import { ColumnDef, getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import { Product } from "@/types/MongoTypes/Product";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DownloadIcon, SaveIcon } from "lucide-react";
import ky from "ky";
import { toast } from "sonner";

const ProductsOutOfStock = () => {
  const [changes, setChanges] = useState<{ [key: string]: { quantity: number } }>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 3,
  });

  const columns: ColumnDef<Product>[] = useMemo(
    () =>
      [
        {
          id: 'Nombre',
          header: 'Nombre',
          accessorKey: 'uniqId',
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: 'Cantidad',
          header: 'Cantidad',
          accessorKey: 'quantity',
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
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setChanges((prevState) => {
                    return {
                      ...prevState,
                      [cellData.row.original._id]: {
                        quantity: (changes[cellData.row.original._id]?.quantity || 0) - 1,
                      },
                    }
                  })
                }}
              >
                -
              </Button>
              <p className="text-base text-gray-500">
                {changes[cellData.row.original._id]?.quantity || 0}
              </p>
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setChanges((prevState) => {
                    return {
                      ...prevState,
                      [cellData.row.original._id]: {
                        quantity: (changes[cellData.row.original._id]?.quantity || 0) + 1,
                      },
                    }
                  })
                }}
              >
                +
              </Button>
            </div>
          ),
        }
      ] satisfies ColumnDef<Product>[],
    [changes]
  );
  const dashboardQuery = useDashboard();
  const productsOutOfStock = useMemo(() => dashboardQuery.data || {}, [dashboardQuery.data]);
  const data = useMemo(() => Object.keys(productsOutOfStock).map((productId) => {
    return {
      ...productsOutOfStock[productId],
    };
  }), [productsOutOfStock]);

  const table = useReactTable({
    data,
    columns,
    getRowId(originalRow) {
      return originalRow._id;
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  })

  const handleUpdateProductsClick = async () => {
    try {
      await ky.post('/api/products/edit-from-dashboard', { json: { products: changes } }).json();
      setChanges({});
      dashboardQuery.refetch();
      toast.success('Productos actualizados exitosamente');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        return;
      }
      toast.error('An error occurred');
    }
  }

  return (
    <Card className="lg:max-w-md" x-chunk="charts-01-chunk-0">
      <CardHeader className="space-y-0 pb-2 mb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-2xl tabular-nums">
          Productos pendientes
        </CardTitle>
        <div className="flex gap-2">
          <Button size={'icon'} variant={'outline'} className="h-6 w-6">
            <DownloadIcon className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={Object.values(changes).length > 0 ? 'success' : 'outline'}
            size={"icon"}
            className="h-6 w-6"
            disabled={!Object.values(changes).length}
            onClick={handleUpdateProductsClick}
          >
            <SaveIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable table={table} isLoading={dashboardQuery.isLoading} columns={columns} enableInput={false} enableShowColumns={false} />
      </CardContent>
      <CardFooter className="flex-col items-start gap-1">
        <CardDescription>
          La cantidad mostrada es la <strong className="font-bold text-primary">cantidad total </strong>del producto.
        </CardDescription>
      </CardFooter>
    </Card>
  )
}

export default ProductsOutOfStock