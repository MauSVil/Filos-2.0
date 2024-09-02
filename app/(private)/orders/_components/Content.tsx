'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Copy, CreditCard, DownloadIcon, File, FileIcon, ListFilter, MoreVertical, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useOrders } from "../_hooks/useOrders";
import { useRouter } from "next/navigation";
import moment from "moment";
import { useBuyers } from "../../buyers/_hooks/useBuyers";
import _ from "lodash";
import { Order } from "@/types/MongoTypes/Order";
import { cn } from "@/utils/cn";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import DataTableColumnHeader from "@/components/DataTableHeader";

const statusTranslations: { [key: string]: string } = {
  retailPrice: 'Mayoreo',
  wholesalePrice: 'Menudeo',
  webPagePrice: 'Pagina web',
}

const orderStatuses = [
  'Pendiente',
  'Completado',
  'Cancelado',
]

const OrdersContent = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'uniqId', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')

  const [selectedOrder, setSelectedOrder] = useState<Order>({} as Order);
  const [status, setStatus] = useState(orderStatuses[0])
  const ordersQuery = useOrders({ status });

  const buyersArray = useMemo(() => {
    return ordersQuery.data?.data?.map((order) => order.buyer) || [];
  }, [ordersQuery.data?.data]);

  const buyersQuery = useBuyers({ buyers: buyersArray });

  const router = useRouter();
  const orders = useMemo(() => {
    return (ordersQuery.data?.data || []).map((order) => {
      const mappedBuyers = _.keyBy(buyersQuery?.data?.data || [], '_id');
      return {
        ...order,
        buyer: mappedBuyers[order.buyer]?.name,
      }
    })
  }, [ordersQuery.data?.data, buyersQuery.data?.data]);

  const mappedOrders = useMemo(() => {
    return _.keyBy(orders, '_id');
  }, [orders]);
  
  const handleNewOrder = () => {
    router.push("/orders/new")
  }

  const setDownloadClick = (url: string) => {
    window.open(url, '_blank');
  }

  const columns: ColumnDef<Order>[] = useMemo(
    () =>
      [
        {
          id: 'Comprador',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Comprador" />
          ),
          accessorKey: 'buyer',
          cell: (cellData) => {
            return (
              <div className="flex flex-col gap-1">
                <span>{cellData.row.original.buyer}</span>
                <span className="text-xs text-muted-foreground">
                  {`Fecha compromiso: ${moment(cellData.row.original.dueDate).format('DD/MM/YYYY')}`}
                </span>
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
          id: 'Tipo de orden',
          accessorKey: 'orderType',
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
          id: 'Pagado',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Pagado" />
          ),
          accessorKey: 'paid',
          cell: (cellData) => {
            return cellData.row.original.paid ? (
              <Badge variant="default">Si</Badge>
            ) : (
              <Badge variant="destructive">No</Badge>
            )
          },
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: 'Productos',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Productos" />
          ),
          accessorFn: ({ products }) => products.length,
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: 'Total',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Total" />
          ),
          accessorFn: ({ finalAmount }) => `$${finalAmount}`,
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
                onClick={() => setDownloadClick(cellData.row.original.documents.order)}
              >
                <DownloadIcon className="h-3.5 w-3.5" />
                <span className="sr-only">Download</span>
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6"
                onClick={() => setSelectedOrder(mappedOrders[cellData.row.original._id])}
              >
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="sr-only">More</span>
              </Button>
            </div>
          ),
        },
      ] satisfies ColumnDef<Order>[],
    [mappedOrders]
  );

  const table = useReactTable({
    data: orders,
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
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <div className={cn("grid auto-rows-max items-start gap-4 md:gap-8", {
        'col-span-3': !selectedOrder?._id,
        'col-span-2': selectedOrder?._id
      })}>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          <Card
            className="sm:col-span-2" x-chunk="dashboard-05-chunk-0"
          >
            <CardHeader className="pb-3">
              <CardTitle>Tus ordenes</CardTitle>
              <CardDescription className="max-w-lg text-balance leading-relaxed">
                Aquí podrás ver todas las ordenes que has realizado en nuestra plataforma.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={handleNewOrder}>Create nueva orden</Button>
            </CardFooter>
          </Card>
          <Card x-chunk="dashboard-05-chunk-1">
            <CardHeader className="pb-2">
              <CardDescription>Esta semana</CardDescription>
              <CardTitle className="text-4xl">$1,329</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                +25% from last week
              </div>
            </CardContent>
            <CardFooter>
              <Progress value={25} aria-label="25% increase" />
            </CardFooter>
          </Card>
          <Card x-chunk="dashboard-05-chunk-2">
            <CardHeader className="pb-2">
              <CardDescription>Este mes</CardDescription>
              <CardTitle className="text-4xl">$5,329</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                +10% from last month
              </div>
            </CardContent>
            <CardFooter>
              <Progress value={12} aria-label="12% increase" />
            </CardFooter>
          </Card>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-sm"
                  >
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only">Filtrar</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filrar por:</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {
                    orderStatuses.map((statusLabel) => {
                      return (
                        <DropdownMenuCheckboxItem
                          checked={status === statusLabel}
                          onCheckedChange={() => setStatus(statusLabel)}
                        >
                          {statusLabel}
                        </DropdownMenuCheckboxItem>
                      )
                    })
                  }
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-sm"
              >
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Exportar</span>
              </Button>
            </div>
          </div>
          <Card x-chunk="dashboard-05-chunk-3">
            <CardHeader className="px-7 flex flex-row justify-between">
              <div className="flex-1">
                <CardTitle>Ordenes</CardTitle>
                <CardDescription>
                  Las ordenes mas recientes
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                table={table}
                isLoading={ordersQuery.isLoading || buyersQuery.isLoading}
                columns={columns}
                className='mb-4'
              />
            </CardContent>
          </Card>
        </div>
      </div>
      {
        selectedOrder?._id && (
          <div>
            <Card
              className="overflow-hidden" x-chunk="dashboard-05-chunk-4"
            >
              <CardHeader className="flex flex-row items-start bg-muted/50">
                <div className="grid gap-0.5">
                  <CardTitle className="group flex items-center gap-2 text-lg">
                    {`Orden ${selectedOrder?._id}`}
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => navigator.clipboard.writeText(selectedOrder?._id)}
                    >
                      <Copy className="h-3 w-3" />
                      <span className="sr-only">Copiar ID</span>
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {`Fecha de compromiso: ${moment(selectedOrder?.dueDate).format('DD/MM/YYYY')}`}
                  </CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="outline" className="h-8 w-8">
                        <MoreVertical className="h-3.5 w-3.5" />
                        <span className="sr-only">More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Export</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Trash</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-6 text-sm">
                <div className="grid gap-3">
                  <div className="font-semibold">Detalles de la orden</div>
                  <ul className="grid gap-3">
                    {
                      selectedOrder?.products?.slice(0, 5).map((product) => {
                        return (
                          <li className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              {product.product} x <span>{product.quantity}</span>
                            </span>
                            <span>{`$${product.total}`}</span>
                          </li>
                        )
                      })
                    }
                  </ul>
                  {
                    selectedOrder?.products?.length > 5 && (
                      <Button size="sm" variant="outline" className="h-8 w-full">
                        Ver todos los productos
                      </Button>
                    )
                  }
                  <Separator className="my-2" />
                  <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Adelanto</span>
                      <span>{`$${selectedOrder?.advancedPayment || 0}`}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Flete</span>
                      <span>{`$${selectedOrder?.freightPrice || 0}`}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span>{`$${selectedOrder?.totalAmount || 0}`}</span>
                    </li>
                    <li className="flex items-center justify-between font-semibold">
                      <span className="text-muted-foreground">Final</span>
                      <span>{`$${selectedOrder?.finalAmount || 0}`}</span>
                    </li>
                  </ul>
                </div>
                <Separator className="my-4" />
                <div className="grid gap-3">
                  <div className="font-semibold">Información del cliente</div>
                  <dl className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Nombre</dt>
                      <dd>{selectedOrder?.buyer}</dd>
                    </div>
                  </dl>
                </div>
                <Separator className="my-4" />
                <div className="grid gap-3">
                  <div className="font-semibold">Banderas</div>
                  <dl className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Estatus</dt>
                      <dd>{selectedOrder?.status}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Pagado</dt>
                      <dd>{selectedOrder?.paid ? 'Si' : 'No'}</dd>
                    </div>
                  </dl>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }
    </div>
  )
}

export default OrdersContent;