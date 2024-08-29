'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [selectedOrder, setSelectedOrder] = useState<Order>({} as Order);
  const [status, setStatus] = useState(orderStatuses[0])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const ordersQuery = useOrders({ page, status });

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

  useEffect(() => {
    setTotal((prev) => {
      if (ordersQuery.data?.count) {
        return ordersQuery.data.count;
      }
      return prev;
    })
  }, [ordersQuery.data?.count])
  
  const handleNewOrder = () => {
    router.push("/orders/new")
  }

  const setDownloadClick = (url: string) => {
    window.open(url, '_blank');
  }

  const handlePrevious = () => {
    if (page === 1) {
      toast.error('No puedes ir a una página menor a 1');
      return;
    }
    setPage((prev) => prev - 1);
  }

  const handleNext = () => {
    if (page === Math.ceil(total / 10)) {
      toast.error('No puedes ir a una página mayor a la última');
      return;
    }
    setPage((prev) => prev + 1);
  }

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <div className={cn("grid auto-rows-max items-start gap-4 md:gap-8", {
        'col-span-3': !selectedOrder._id,
        'col-span-2': selectedOrder._id
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
              <Pagination className="m-0 w-fit">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className="cursor-pointer" 
                      onClick={handlePrevious}
                      isDisabled={page === 1}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="text-xs text-muted-foreground">
                      {`${page} de ${Math.ceil(total / 10)}`}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      className="cursor-pointer"
                      onClick={handleNext}
                      isDisabled={page === Math.ceil(total / 10)}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Comprador</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Tipo de orden
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Pagado
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Productos
                    </TableHead>
                    <TableHead className="text-right">
                      Total
                    </TableHead>
                    <TableHead className="text-right">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {
                    ordersQuery.isLoading || buyersQuery.isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="flex items-center justify-center gap-2">
                            <span>Cargando...</span>
                            <Progress
                              value={
                                ordersQuery.isLoading && buyersQuery.isLoading
                                  ? 50
                                  : ordersQuery.isLoading
                                  ? 75
                                  : 100
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {
                          orders.map((order) => {
                            return (
                              <TableRow className="bg-accent">
                                <TableCell>
                                  <div className="font-medium">
                                    {order.buyer}
                                  </div>
                                  <div className="hidden text-sm text-muted-foreground md:inline">
                                    {`Fecha compromiso: ${moment(order.dueDate).format('DD/MM/YYYY')}`}
                                  </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  {statusTranslations[order.orderType] || order.orderType}
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  <Badge className="text-xs" variant={order.paid ? 'default' : 'secondary'}>
                                    {order.paid ? 'Pagado' : 'Pendiente'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {order.products.length}
                                </TableCell>
                                <TableCell className="text-right">
                                  {`$${order.totalAmount}`}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button size={"icon"} variant={"outline"} className="h-6 w-6" onClick={() => setDownloadClick(order.documents.order)}>
                                      <DownloadIcon className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      size={"icon"}
                                      variant={"outline"}
                                      className="h-6 w-6"
                                      onClick={() => setSelectedOrder(mappedOrders[order._id])}
                                    >
                                      <ChevronRight className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        }
                      </>
                    )
                  }
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      {
        selectedOrder._id && (
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