import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { create, InstanceProps } from "react-modal-promise";
import moment from "moment";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import numeral from "numeral";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMutation, useQuery } from "@tanstack/react-query";
import ky from "ky";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { OrderBaseType } from "@/types/v2/Order/Base.type";
import { ProductBaseType } from "@/types/v2/Product/Base.type";

interface Props extends InstanceProps<any, any> {
  orderId: string;
}

const orderTypeTranslations = {
  retailPrice: "Semi-mayoreo",
  wholesalePrice: "Mayoreo",
  webPagePrice: "Pagina web",
  specialPrice: "Especial",
}

const OrderDetail = ({ orderId, onReject, onResolve, isOpen }: Props) => {
  const { localData, flags, store, methods } = useModule({ orderId });
  const { order } = localData;
  const { isLoading, isError, isRefetching } = flags;
  const { productsStore } = store;
  const { completeOrder, cancelOrder, payOrder, handleGeneratePDF } = methods;

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center w-full h-30">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <p className="text-sm font-normal text-red-500">Error al cargar la orden</p>
        </div>
      );
    }

    if (!order) {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <p className="text-sm font-normal text-muted-foreground">No se encontró la orden</p>
        </div>
      );
    }

    if (isRefetching) {
      return (
        <div className="flex items-center justify-center w-full h-30">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    return (
      <div className="flex gap-8">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-4">
            Productos
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.products.map((p) => (
                <TableRow key={p.product}>
                  <TableCell className="text-sm font-normal text-muted-foreground">
                    {`${productsStore?.[p.product]?.uniqId} - ${productsStore?.[p.product]?.name}` || "Producto no encontrado"}
                  </TableCell>
                  <TableCell className="text-sm font-normal text-muted-foreground">
                    {p.quantity}
                  </TableCell>
                  <TableCell className="text-sm font-normal text-muted-foreground">
                    {numeral(p.total).format("$0,0.00")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">
              Resumen de la orden
            </h3>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2"
              onClick={() => {
                navigator.clipboard.writeText(order._id.toString());
                toast.success("ID de orden copiado al portapapeles");
              }}
            >
              <Copy className="h-4 w-4 mr-1" />
              <span className="text-xs">Copiar ID</span>
            </Button>
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button variant="outline" onClick={completeOrder} className="w-full">
                Completar Orden
              </Button>
              <Button variant="outline" onClick={payOrder} className="w-full">
                Marcar como Pagada
              </Button>
              <Button variant="outline" onClick={() => handleGeneratePDF(order._id.toString())} className="w-full">
                Generar PDF
              </Button>
              <Button variant="outline" onClick={cancelOrder} className="w-full border-red-400 text-red-400 hover:bg-red-400 hover:text-white">
                Cancelar Orden
              </Button>
            </div>
          </div>

          <div className="bg-slate-700/20 rounded-lg p-4 mb-6">
            <h4 className="text-lg font-semibold mb-3 text-slate-200">Resumen Financiero</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Subtotal:</span>
                <span className="font-semibold">{numeral(order.totalAmount || 0).format("$0,0.00")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Flete:</span>
                <span className="font-semibold">{numeral(order.freightPrice || 0).format("$0,0.00")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Adelanto:</span>
                <span className="font-semibold text-green-400">-{numeral(order.advancedPayment || 0).format("$0,0.00")}</span>
              </div>
              <div className="border-t border-slate-600 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold">Total Final:</span>
                  <span className="text-lg font-bold text-blue-400">{numeral(order.finalAmount || 0).format("$0,0.00")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-700/20 rounded-lg p-4">
              <h4 className="text-lg font-semibold mb-3 text-slate-200">Estado de la Orden</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Estado:</p>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'Completado' ? 'bg-green-100 text-green-800' :
                    order.status === 'Cancelado' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status || 'Pendiente'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Pagado:</p>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    order.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {order.paid ? 'Sí' : 'No'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Tipo de Orden:</p>
                  <p className="text-sm font-medium">{orderTypeTranslations[order.orderType] || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Estado PDF:</p>
                  <p className="text-sm font-medium">{order.pdfStatus || 'No generado'}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/20 rounded-lg p-4">
              <h4 className="text-lg font-semibold mb-3 text-slate-200">Resumen de Productos</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Total de Productos:</p>
                  <p className="text-lg font-bold">{order.products?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Cantidad Total:</p>
                  <p className="text-lg font-bold">
                    {order.products?.reduce((total, product) => total + (product.quantity || 0), 0) || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/20 rounded-lg p-4">
              <h4 className="text-lg font-semibold mb-3 text-slate-200">Fechas Importantes</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Fecha de Solicitud:</p>
                  <p className="text-sm font-medium">{moment(order.requestDate).format("DD/MM/YYYY HH:mm")}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Fecha Estimada:</p>
                  <p className="text-sm font-medium">{moment(order.dueDate).format("DD/MM/YYYY HH:mm")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }, [order, isLoading, isError, isRefetching, productsStore]);

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onResolve(order)}>
      <AlertDialogContent className="max-w-6xl max-h-[90vh]">
        <ScrollArea className="max-h-[calc(90vh-140px)] w-full">
          <div className="p-6">
            {content}
          </div>
        </ScrollArea>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onResolve(order)}>Cerrar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>

    </AlertDialog>
  );
};

export const OrderDetailModal = create(OrderDetail);

const useModule = ({ orderId }: { orderId: string }) => {
  const [productsStore, setProductsStore] = useState<Record<string, ProductBaseType>>({});

  const orderQuery = useQuery<OrderBaseType>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const resp = await ky.get(`/api/v2/orders/${orderId}`).json<OrderBaseType>();
      return resp;
    },
    enabled: !!orderId,
  })

  const productsQuery = useQuery<ProductBaseType[]>({
    queryKey: ["products", orderQuery.data?.products],
    queryFn: async () => {
      const resp = await ky.post("/api/v2/products/search", {
        json: {
          _id: {
            $in: orderQuery.data?.products.map((p) => p.product),
          },
        },
      }).json<ProductBaseType[]>();
      return resp;
    },
    enabled: !!orderQuery.data,
  })

  const editOrderMutation = useMutation({
    mutationKey: ["editOrder"],
    mutationFn: async (data: Partial<OrderBaseType>) => {
      const resp = await ky.put(`/api/v2/orders/status`, { json: { _id: orderId, ...data } }).json<OrderBaseType>();
      return resp;
    }
  })

  useEffect(() => {
    if (productsQuery.data) {
      const productsMap = productsQuery.data.reduce((acc, product) => {
        acc[product._id?.toString()!] = product;
        return acc;
      }, {} as Record<string, ProductBaseType>);
      setProductsStore(productsMap);
    }
  }, [productsQuery.data]);

  const completeOrder = async () => {
    await toast.promise(
      editOrderMutation.mutateAsync({ status: "Completado", paid: true }),
      {
        loading: "Marcando como completado...",
        success: "Orden marcada como completada",
        error: "Error al marcar la orden como completada",
      },
    );
    orderQuery.refetch();
  }

  const cancelOrder = async () => {
    await toast.promise(
      editOrderMutation.mutateAsync({ status: "Cancelado" }),
      {
        loading: "Marcando como cancelada...",
        success: "Orden marcada como cancelada",
        error: "Error al marcar la orden como cancelada",
      },
    );
    orderQuery.refetch();
  }

  const payOrder = async () => {
    await toast.promise(
      editOrderMutation.mutateAsync({ paid: true }),
      {
        loading: "Marcando como pagada...",
        success: "Orden marcada como pagada",
        error: "Error al marcar la orden como pagada",
      },
    );
    orderQuery.refetch();
  }

  const handleGeneratePDF = async (orderId: string) => {
    try {
      await toast.promise(
        ky.post(`/api/v2/orders/generatePDF`, {
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

            return "PDF generado";
          },
          error: "Ha ocurrido un error al generar el PDF",
        },
      );
      orderQuery.refetch();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);

        return;
      }
      toast.error("An error occurred");
    }
  };

  return {
    localData: {
      order: orderQuery.data || ({} as OrderBaseType),
    },
    store: {
      productsStore,
    },
    methods: {
      completeOrder,
      cancelOrder,
      payOrder,
      handleGeneratePDF,
    },
    flags: {
      isLoading: orderQuery.isLoading || productsQuery.isLoading,
      isError: orderQuery.isError || productsQuery.isError,
      isRefetching: orderQuery.isRefetching || productsQuery.isRefetching,
    }
  }
}
