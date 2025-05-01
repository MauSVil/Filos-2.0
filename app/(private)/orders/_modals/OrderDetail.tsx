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
import { Accordion, AccordionContent, AccordionTrigger } from "@/components/ui/accordion";
import { AccordionItem } from "@radix-ui/react-accordion";
import { useMutation, useQuery } from "@tanstack/react-query";
import ky from "ky";
import { useEffect, useMemo, useState } from "react";
import { Product } from "@/types/v2/Product.type";
import { toast } from "sonner";
import { OrderBaseType } from "@/types/v2/Order/Base.type";

interface Props extends InstanceProps<any, any> {
  orderId: string;
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
      <ScrollArea className="h-[300px] w-full flex flex-col gap-2 mt-4">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4 pr-4">
            <Button variant={"outline"} className="col-span-1" onClick={completeOrder}>
              Completar
            </Button>
            <Button variant={"outline"} className="col-span-1" onClick={payOrder}>
              Pagar
            </Button>
            <Button variant={"outline"} className="col-span-1 border-red-400" onClick={cancelOrder}>
              Cancelar
            </Button>
            <Button variant={"outline"} className="col-span-3" onClick={() => handleGeneratePDF(order._id.toString())}>
              Generar PDF
            </Button>
          </div>
          <div className="flex flex-col pr-4">
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger>
                  <h4 className="text-xl font-semibold mb-2">
                    Detalles de la orden
                  </h4>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <p className="text-base font-semibold">Precio total:</p>
                      <p className="text-sm font-normal text-muted-foreground">{numeral(order.totalAmount).format("$0,0.00")}</p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-base font-semibold">Flete:</p>
                      <p className="text-sm font-normal text-muted-foreground">{numeral(order.freightPrice).format("$0,0.00")}</p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-base font-semibold">Adelanto:</p>
                      <p className="text-sm font-normal text-muted-foreground">{numeral(order.advancedPayment).format("$0,0.00")}</p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-base font-semibold">Precio final:</p>
                      <p className="text-sm font-normal text-muted-foreground">{numeral(order.finalAmount).format("$0,0.00")}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
          
              <AccordionItem value="status">
                <AccordionTrigger>
                  <h4 className="text-xl font-semibold mb-2">
                    Estatus
                  </h4>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <p className="text-base font-semibold">Estatus:</p>
                      <p className="text-sm font-normal text-muted-foreground">{order.status ?? '-'}</p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-base font-semibold">Pagada:</p>
                      <p className="text-sm font-normal text-muted-foreground">{order.paid ? "Sí" : "No"}</p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-base font-semibold">Tipo de orden:</p>
                      <p className="text-sm font-normal text-muted-foreground">{order.orderType ?? '-'}</p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-base font-semibold">PDF:</p>
                      <p className="text-sm font-normal text-muted-foreground">{order.pdfStatus ?? '-'}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="products">
                <AccordionTrigger>
                  <h4 className="text-xl font-semibold mb-2">
                    Productos
                  </h4>
                </AccordionTrigger>
                <AccordionContent>
                  <Table className="w-full">
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </ScrollArea>
    )
  }, [order, isLoading, isError, isRefetching, productsStore]);

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open}>
      <AlertDialogContent className="max-w-4xl py-8 px-10">
        <div className="w-full h-full flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold m-0 p-0">
              Orden
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-sm font-normal m-0 p-0">{order?._id?.toString()}</p>
              <Button size={"icon"} variant="ghost" className="h-6 w-6">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-normal text-muted-foreground">
              Creada el {moment(order?.requestDate).format("DD/MM/YYYY HH:mm")}
            </p>
            <p className="text-sm font-normal text-muted-foreground">
              La fecha estimada es {moment(order?.dueDate).format("DD/MM/YYYY HH:mm")}
            </p>
          </div>
          {content}
        </div>

        <AlertDialogFooter className="mt-6">
          <AlertDialogAction onClick={() => onResolve(order)}>Cerrar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const OrderDetailModal = create(OrderDetail);

const useModule = ({ orderId }: { orderId: string }) => {
  const [productsStore, setProductsStore] = useState<Record<string, Product>>({});

  const orderQuery = useQuery<OrderBaseType>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const resp = await ky.get(`/api/v2/orders/${orderId}`).json<OrderBaseType>();
      return resp;
    },
    enabled: !!orderId,
  })

  const productsQuery = useQuery<Product[]>({
    queryKey: ["products", orderQuery.data?.products],
    queryFn: async () => {
      const resp = await ky.post("/api/v2/products/search", {
        json: {
          _id: {
            $in: orderQuery.data?.products.map((p) => p.product),
          },
        },
      }).json<Product[]>();
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
      }, {} as Record<string, Product>);
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