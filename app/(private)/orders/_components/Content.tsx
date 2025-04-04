"use client";

import {
  ChevronRight,
  Copy,
  DownloadIcon,
  Edit,
  File,
  ListFilter,
  MoreVertical,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import _ from "lodash";
import { toast } from "sonner";
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
import numeral from "numeral";
import ky from "ky";
import moment from "moment-timezone";

import { useOrders } from "../_hooks/useOrders";
import { useBuyers } from "../../buyers/_hooks/useBuyers";
import { useContact } from "../_hooks/useContact";
import { useProducts } from "../_hooks/useProducts";
import { useUpdateOrder } from "../_hooks/useUpdateOrder";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils/cn";
import { DataTable } from "@/components/DataTable";
import DataTableColumnHeader from "@/components/DataTableHeader";
import { useSocket } from "@/contexts/socketContext";
import { calculateChangePorcentage } from "@/lib/utils";
import { Order } from "@/types/RepositoryTypes/Order";

export const statusTranslations: { [key: string]: string } = {
  retailPrice: "Semi-mayoreo",
  wholesalePrice: "Mayoreo",
  webPagePrice: "Pagina web",
  specialPrice: "Especial",
};

const orderStatuses = ["Pendiente", "Completado", "Cancelado"];

const OrdersContent = () => {
  const { socket } = useSocket();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<Order>({} as Order);
  const [status, setStatus] = useState(orderStatuses[0]);
  const ordersQuery = useOrders({ status });

  const updateOrder = useUpdateOrder();

  const buyersArray = useMemo(() => {
    return ordersQuery.data?.data?.map((order) => order.buyer) || [];
  }, [ordersQuery.data?.data]);

  const buyersQuery = useBuyers({ buyers: buyersArray });

  const router = useRouter();
  const orders = useMemo(
    () => ordersQuery.data?.data || [],
    [ordersQuery.data?.data],
  );

  const mappedOrders = useMemo(() => {
    return _.keyBy(orders, "_id");
  }, [orders]);

  const mappedBuyers = useMemo(() => {
    return _.keyBy(buyersQuery.data, "_id");
  }, [buyersQuery.data]);

  const contactQuery = useContact({
    phone_id: mappedBuyers?.[selectedOrder?.buyer]?.phone,
  });
  const productsQuery = useProducts({
    products: (selectedOrder?.products || []).map((product) => product.product),
  });

  const mappedProducts = useMemo(() => {
    return _.keyBy(productsQuery.data || [], "_id");
  }, [productsQuery.data]);

  const handleNewOrder = () => {
    router.push("/orders/new");
  };

  const setDownloadClick = (url?: string) => {
    window.open(url, "_blank");
  };

  const columns: ColumnDef<Order>[] = useMemo(
    () =>
      [
        {
          id: "Comprador",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Comprador" />
          ),
          accessorKey: "buyer",
          cell: (cellData) => {
            return (
              <div className="flex flex-col gap-1">
                <span>{mappedBuyers[cellData.row.original.buyer]?.name}</span>
                <span className="text-xs text-muted-foreground">
                  {`Fecha compromiso: ${moment(cellData.row.original.dueDate).tz("America/Mexico_City").format("DD/MM/YYYY")}`}
                </span>
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
          id: "Tipo de orden",
          accessorKey: "orderType",
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
          id: "Pagado",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Pagado" />
          ),
          accessorKey: "paid",
          cell: (cellData) => {
            return cellData.row.original.paid ? (
              <Badge variant="default">Si</Badge>
            ) : (
              <Badge variant="destructive">No</Badge>
            );
          },
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Productos",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Productos" />
          ),
          accessorFn: ({ products }) => _.sumBy(products, "quantity"),
          enableGlobalFilter: true,
          enableSorting: true,
          filterFn: "auto",
          enableColumnFilter: true,
          sortingFn: "textCaseSensitive",
        },
        {
          id: "Total",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Total" />
          ),
          accessorFn: ({ finalAmount }) =>
            numeral(finalAmount).format("$0,0.00"),
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
                disabled={!cellData.row.original.documents?.order}
                size="icon"
                variant="outline"
                onClick={() =>
                  setDownloadClick(cellData.row.original.documents.order)
                }
              >
                <DownloadIcon className="h-3.5 w-3.5" />
                <span className="sr-only">Download</span>
              </Button>
              <Button
                className="h-6 w-6"
                disabled={
                  cellData.row.original.status !== "Pendiente" ||
                  cellData.row.original.paid
                }
                size="icon"
                variant="outline"
                onClick={() =>
                  router.push(`/orders/${cellData.row.original._id}`)
                }
              >
                <Edit className="h-3.5 w-3.5" />
                <span className="sr-only">Editar</span>
              </Button>
              <Button
                className="h-6 w-6"
                size="icon"
                variant="outline"
                onClick={() =>
                  setSelectedOrder(mappedOrders[cellData.row.original._id])
                }
              >
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="sr-only">More</span>
              </Button>
            </div>
          ),
        },
      ] satisfies ColumnDef<Order>[],
    [mappedOrders, mappedBuyers],
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
  });

  const handleSendOrder = async (orderInput: Order) => {
    try {
      const resp = await contactQuery.refetch();

      if (resp.isSuccess) {
        const contactData = resp.data;
        const selectedChat = mappedBuyers[orderInput.buyer]?.phone;

        if (Number(selectedChat) !== Number(contactData?.phone_id)) {
          throw new Error("No se encontro el contacto del comprador");
        }

        const lastMessageSent = moment(contactData?.lastMessageSent);
        const now = moment();
        const diff = now.diff(lastMessageSent, "hours");

        if (diff > 24) {
          throw new Error("No puedes enviar mensajes despues de 24 horas");
        }

        socket.emit("send_message", {
          phone_id: selectedChat,
          message: "Imagen enviada",
          type: "pdf",
          metadata: {
            url: orderInput?.documents?.order,
            mimeType: "pdf",
            name: "Orden de compra",
          },
        });
        socket.emit("update_contact", {
          phone_id: selectedChat,
          aiEnabled: false,
        });

        toast.success("Orden enviada exitosamente");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);

        return;
      }
      toast.error("An error occurred");
    }
  };

  const handleGeneratePDF = async (orderId: string) => {
    try {
      await toast.promise(
        ky.post(`/api/orders/generatePDF`, {
          json: { id: orderId },
          timeout: false,
        }),
        {
          loading: "Generando PDF...",
          success: async (res) => {
            const buffer = await res.arrayBuffer();
            const blob = new Blob([buffer], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `orden.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            ordersQuery.refetch();

            return "PDF generado";
          },
          error: "Ha ocurrido un error al generar el PDF",
        },
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);

        return;
      }
      toast.error("An error occurred");
    }
  };

  const salesThisWeek = useMemo(() => {
    return orders
      .filter((order) => {
        const startOfWeek = moment().tz("America/Mexico_City").startOf("week");
        const endOfWeek = moment().tz("America/Mexico_City").endOf("week");
        const orderDate = moment(order?.requestDate).tz("America/Mexico_City");

        return orderDate.isBetween(startOfWeek, endOfWeek);
      })
      .filter((order) => order.paid)
      .reduce((acc, order) => {
        return acc + (order?.totalAmount + order?.freightPrice || 0);
      }, 0);
  }, [orders]);

  const salesLastWeek = useMemo(() => {
    return orders
      .filter((order) => {
        const startOfWeek = moment()
          .tz("America/Mexico_City")
          .subtract(1, "week")
          .startOf("week");
        const endOfWeek = moment()
          .tz("America/Mexico_City")
          .subtract(1, "week")
          .endOf("week");
        const orderDate = moment(order?.requestDate).tz("America/Mexico_City");

        return orderDate.isBetween(startOfWeek, endOfWeek);
      })
      .filter((order) => order.paid)
      .reduce((acc, order) => {
        return acc + (order?.totalAmount + order?.freightPrice || 0);
      }, 0);
  }, [orders]);

  const salesThisMonth = useMemo(() => {
    return orders
      .filter((order) => {
        const startOfMonth = moment().startOf("month");
        const endOfMonth = moment().endOf("month");
        const orderDate = moment.utc(order?.requestDate);

        return orderDate.isBetween(startOfMonth, endOfMonth);
      })
      .filter((order) => order.paid)
      .reduce((acc, order) => {
        return acc + (order?.totalAmount + order?.freightPrice || 0);
      }, 0);
  }, [orders]);

  const salesLastMonth = useMemo(() => {
    return orders
      .filter((order) => {
        const startOfMonth = moment().subtract(1, "month").startOf("month");
        const endOfMonth = moment().subtract(1, "month").endOf("month");
        const orderDate = moment.utc(order?.requestDate);

        return orderDate.isBetween(startOfMonth, endOfMonth);
      })
      .filter((order) => order.paid)
      .reduce((acc, order) => {
        return acc + (order?.totalAmount + order?.freightPrice || 0);
      }, 0);
  }, [orders]);

  const handlePaidStatus = async (id: string) => {
    await updateOrder.mutateAsync({ _id: id, paid: true });
    ordersQuery.refetch();
  };

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <div
        className={cn("grid auto-rows-max items-start gap-4 md:gap-8", {
          "col-span-3": !selectedOrder?._id,
          "col-span-2": selectedOrder?._id,
        })}
      >
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
            <CardHeader className="pb-3">
              <CardTitle>Tus ordenes</CardTitle>
              <CardDescription className="max-w-lg text-balance leading-relaxed">
                Aquí podrás ver todas las ordenes que has realizado en nuestra
                plataforma.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={handleNewOrder}>Crear nueva orden</Button>
            </CardFooter>
          </Card>
          <Card x-chunk="dashboard-05-chunk-1">
            <CardHeader className="pb-2">
              <CardDescription>Esta semana</CardDescription>
              <CardTitle className="text-4xl">
                {numeral(salesThisWeek).format("$0,0.00")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {`${calculateChangePorcentage(salesLastWeek, salesThisWeek)}% desde la semana pasada`}
              </div>
            </CardContent>
            <CardFooter>
              <Progress aria-label="25% increase" value={25} />
            </CardFooter>
          </Card>
          <Card x-chunk="dashboard-05-chunk-2">
            <CardHeader className="pb-2">
              <CardDescription>Este mes</CardDescription>
              <CardTitle className="text-4xl">
                {numeral(salesThisMonth).format("$0,0.00")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {`${calculateChangePorcentage(salesLastMonth, salesThisMonth)}% desde el mes pasado`}
              </div>
            </CardContent>
            <CardFooter>
              <Progress aria-label="12% increase" value={12} />
            </CardFooter>
          </Card>
        </div>
        <div className="flex flex-col gap-2">
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
                  {orderStatuses.map((statusLabel) => {
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
              <Button className="h-7 gap-1 text-sm" size="sm" variant="outline">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Exportar</span>
              </Button>
            </div>
          </div>
          <Card x-chunk="dashboard-05-chunk-3">
            <CardHeader className="px-7 flex flex-row justify-between">
              <div className="flex-1">
                <CardTitle>Ordenes</CardTitle>
                <CardDescription>Las ordenes mas recientes</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                className="mb-4"
                columns={columns}
                enableInput={false}
                isLoading={ordersQuery.isLoading || buyersQuery.isLoading}
                table={table}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      {selectedOrder?._id && (
        <div>
          <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
            <CardHeader className="flex flex-row items-start bg-muted/50">
              <div className="grid gap-0.5">
                <CardTitle className="group flex items-center gap-2 text-lg">
                  {`Orden ${selectedOrder?._id}`}
                  <Button
                    className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      navigator.clipboard.writeText(selectedOrder?._id)
                    }
                  >
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copiar ID</span>
                  </Button>
                </CardTitle>
                <CardDescription>
                  {`Fecha de compromiso: ${moment(selectedOrder?.dueDate).tz("America/Mexico_City").format("DD/MM/YYYY")}`}
                </CardDescription>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-8 w-8" size="icon" variant="outline">
                      <MoreVertical className="h-3.5 w-3.5" />
                      <span className="sr-only">More</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      disabled={selectedOrder?.status !== "Pendiente"}
                      onClick={async () => {
                        await updateOrder.mutateAsync({
                          _id: selectedOrder?._id,
                          status: "Completado",
                        });
                        await handlePaidStatus(selectedOrder?._id);
                      }}
                    >
                      Marcar como completado
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={
                        selectedOrder?.status !== "Pendiente" ||
                        selectedOrder?.paid
                      }
                      onClick={() => handlePaidStatus(selectedOrder?._id)}
                    >
                      Marcar como pagado
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={
                        selectedOrder?.status !== "Pendiente" ||
                        selectedOrder?.paid
                      }
                      onClick={async () => {
                        await updateOrder.mutateAsync({
                          _id: selectedOrder?._id,
                          status: "Cancelado",
                        });
                        ordersQuery.refetch();
                      }}
                    >
                      Marcar como cancelado
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => handleSendOrder(selectedOrder)}
                    >
                      Mandar orden al contacto
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleGeneratePDF(selectedOrder?._id)}
                    >
                      Generar PDF
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem>Export</DropdownMenuItem> */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      disabled
                      onClick={() => console.log(selectedOrder?._id)}
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-6 text-sm">
              <div className="grid gap-3">
                <div className="font-semibold">Detalles de la orden</div>
                <ul className="grid gap-3">
                  {selectedOrder?.products?.slice(0, 5).map((product) => {
                    return (
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          {`${mappedProducts[product.product]?.name} (${mappedProducts[product.product]?.uniqId})` ||
                            product.product}{" "}
                          x <span>{product.quantity}</span>
                        </span>
                        <span>{`$${product.total}`}</span>
                      </li>
                    );
                  })}
                </ul>
                {selectedOrder?.products?.length > 5 && (
                  <Button className="h-8 w-full" size="sm" variant="outline">
                    Ver todos los productos
                  </Button>
                )}
                <Separator className="my-2" />
                <ul className="grid gap-3">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Total Productos
                    </span>
                    <span>{`$${selectedOrder?.totalAmount || 0}`}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Flete</span>
                    <span>{`$${selectedOrder?.freightPrice || 0}`}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Adelanto</span>
                    <span>{`$${selectedOrder?.advancedPayment || 0}`}</span>
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
                    <dd>{mappedBuyers[selectedOrder?.buyer]?.name}</dd>
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
                    <dd>{selectedOrder?.paid ? "Si" : "No"}</dd>
                  </div>
                </dl>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrdersContent;
