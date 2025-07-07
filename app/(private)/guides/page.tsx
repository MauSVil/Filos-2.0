"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  FedexShipmentForm, 
  FedexShipmentFormSchema,
  PICKUP_TYPE_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  PACKAGING_TYPE_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
  WEIGHT_UNITS_OPTIONS,
  DIMENSION_UNITS_OPTIONS,
  LABEL_FORMAT_OPTIONS,
  IMAGE_TYPE_OPTIONS,
  LABEL_STOCK_OPTIONS
} from "@/zodSchemas/fedexShipmentForm";
import { useMutation, useQuery } from "@tanstack/react-query";
import ky from "ky";
import _ from "lodash";
import { BuyerBaseType } from "@/types/v2/Buyer/Base.type";
import { OrderBaseType } from "@/types/v2/Order/Base.type";

type OrderOption = {
  label: string;
  value: string;
  searchTerm: string;
};

const GuidesPage = () => {
  const {
    localData,
    store,
    methods,
    flags
  } = useModule();

  const { form, watchedOrders, selectedOrder, selectedBuyer } = localData;
  const { orders } = store;
  const { options } = orders;
  const { isMethodLoading } = flags;

  const isFormDisabled = watchedOrders.length === 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Crear Guía de Envío FedEx</h1>
        <p className="text-muted-foreground">
          Selecciona una orden para generar una guía de envío con FedEx
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => methods.generateFedexShipment(data))} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selección de Orden</CardTitle>
              <CardDescription>
                Selecciona la orden para la cual deseas crear la guía de envío
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="selectedOrders"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Orden</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value?.[0] && "text-muted-foreground"
                            )}
                          >
                            {field.value?.[0]
                              ? options.find(
                                  (option: OrderOption) => option.value === field.value[0]
                                )?.label
                              : "Selecciona una orden"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Buscar orden..." />
                          <CommandList>
                            <CommandEmpty>No se encontró ninguna orden.</CommandEmpty>
                            <CommandGroup>
                              {options.slice(0, 100).map((option: OrderOption) => (
                                <CommandItem
                                  value={option.label}
                                  key={option.value}
                                  onSelect={() => {
                                    field.onChange([option.value]);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      option.value === field.value?.[0]
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {option.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedOrder && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Información de la Orden</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Orden:</span> {selectedOrder.name}
                    </div>
                    <div>
                      <span className="font-medium">Productos:</span> {selectedOrder.products.length}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Remitente</CardTitle>
              <CardDescription>
                Datos de quien envía el paquete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shipper.personName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del remitente" {...field} disabled={isFormDisabled} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shipper.phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="Número de teléfono" {...field} disabled={isFormDisabled} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="shipper.address.streetLines.0"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input placeholder="Calle y número" {...field} disabled={isFormDisabled} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="shipper.address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                          <Input placeholder="Ciudad" {...field} disabled={isFormDisabled} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shipper.address.stateOrProvinceCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado/Provincia</FormLabel>
                        <FormControl>
                          <Input placeholder="Estado" {...field} disabled={isFormDisabled} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shipper.address.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código Postal</FormLabel>
                        <FormControl>
                          <Input placeholder="CP" {...field} disabled={isFormDisabled} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="shipper.address.countryCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de País</FormLabel>
                      <FormControl>
                        <Input placeholder="US" {...field} disabled={isFormDisabled} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {selectedBuyer && (
            <Card>
              <CardHeader>
                <CardTitle>Información del Destinatario</CardTitle>
                <CardDescription>
                  Datos del cliente (prellenados automáticamente)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="recipient.personName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del destinatario" {...field} disabled={isFormDisabled} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="recipient.phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="Número de teléfono" {...field} disabled={isFormDisabled} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="recipient.address.streetLines.0"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input placeholder="Calle y número" {...field} disabled={isFormDisabled} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="recipient.address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ciudad</FormLabel>
                          <FormControl>
                            <Input placeholder="Ciudad" {...field} disabled={isFormDisabled} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="recipient.address.stateOrProvinceCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado/Provincia</FormLabel>
                          <FormControl>
                            <Input placeholder="Estado" {...field} disabled={isFormDisabled} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="recipient.address.postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código Postal</FormLabel>
                          <FormControl>
                            <Input placeholder="CP" {...field} disabled={isFormDisabled} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="recipient.address.countryCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código de País</FormLabel>
                        <FormControl>
                          <Input placeholder="MX" {...field} disabled={isFormDisabled} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Opciones de Envío</CardTitle>
              <CardDescription>
                Configura los detalles del envío
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="pickupType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Recogida</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFormDisabled}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo de recogida" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PICKUP_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Servicio</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFormDisabled}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el servicio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SERVICE_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="packagingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Empaque</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFormDisabled}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el empaque" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PACKAGING_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="paymentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Pago</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFormDisabled}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Quién paga el envío" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles del Paquete</CardTitle>
              <CardDescription>
                Especifica las dimensiones y peso del paquete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="packageDetails.weight.value"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Peso</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="0" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            disabled={isFormDisabled} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="packageDetails.weight.units"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidad</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFormDisabled}>
                          <FormControl>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {WEIGHT_UNITS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="packageDetails.dimensions.units"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidad de Dimensiones</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFormDisabled}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DIMENSION_UNITS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="packageDetails.dimensions.length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Largo</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          disabled={isFormDisabled} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="packageDetails.dimensions.width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ancho</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          disabled={isFormDisabled} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="packageDetails.dimensions.height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alto</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          disabled={isFormDisabled} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opciones de Etiqueta</CardTitle>
              <CardDescription>
                Configura el formato de la etiqueta de envío
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="labelOptions.labelFormatType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formato de Etiqueta</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFormDisabled}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Formato" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LABEL_FORMAT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="labelOptions.imageType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Imagen</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFormDisabled}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {IMAGE_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="labelOptions.labelStockType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tamaño de Etiqueta</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFormDisabled}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Tamaño" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LABEL_STOCK_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isMethodLoading || isFormDisabled}
              className="min-w-[200px]"
            >
              {isMethodLoading ? "Creando guía..." : "Crear Guía de Envío"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default GuidesPage;


const useModule = () => {
  const [selectedOrder, setSelectedOrder] = useState<OrderBaseType | null>(null);
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerBaseType | null>(null);

  const downloadLabelPDF = (encodedLabel: string, trackingNumber: string) => {
    try {
      const byteCharacters = atob(encodedLabel);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fedex_label_${trackingNumber}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Etiqueta descargada exitosamente");
    } catch (error) {
      console.error('Error downloading label:', error);
      toast.error("Error al descargar la etiqueta");
    }
  };

  const form = useForm<FedexShipmentForm>({
    resolver: zodResolver(FedexShipmentFormSchema),
    defaultValues: {
      selectedOrders: [],
      shipper: {
        personName: "Mauricio Sanchez Rodriguez",
        phoneNumber: "5535209307",
        address: {
          streetLines: ["Circuito Novelistas #24"],
          city: "Ciudad Satelite",
          stateOrProvinceCode: "MEX",
          postalCode: "53100",
          countryCode: "MX",
        },
      },
      pickupType: "DROPOFF_AT_FEDEX_LOCATION",
      serviceType: "FEDEX_EXPRESS_SAVER",
      packagingType: "YOUR_PACKAGING",
      packageDetails: {
        weight: {
          value: 5,
          units: "KG",
        },
        dimensions: {
          length: 10,
          width: 8,
          height: 6,
          units: "CM",
        },
      },
      paymentType: "SENDER",
      labelOptions: {
        labelFormatType: "COMMON2D",
        imageType: "PDF",
        labelStockType: "PAPER_4X6",
      },
    },
  });

  const watchedOrders = form.watch("selectedOrders");

  const generateFedexMutation = useMutation({
    mutationKey: ["generateFedexShipment"],
    mutationFn: async (data: FedexShipmentForm) => {
      const resp = await ky.post("/api/orders/sendFedex", {
        json: data
      }).json();
      return resp;
    },
    onError: (error) => {
      toast.error("Error al crear la guía de envío. Por favor, intenta nuevamente.");
    },
    onSuccess: (resp: any) => {
      console.log({ resp });
      
      // Extract the label data from the response
      if (resp.output?.transactionShipments?.[0]?.pieceResponses?.[0]?.packageDocuments?.[0]?.encodedLabel) {
        const encodedLabel = resp.output.transactionShipments[0].pieceResponses[0].packageDocuments[0].encodedLabel;
        const trackingNumber = resp.output.transactionShipments[0].masterTrackingNumber;
        
        // Create and download the PDF
        downloadLabelPDF(encodedLabel, trackingNumber);
        
        toast.success(`Guía de envío creada exitosamente. Número de seguimiento: ${trackingNumber}`);
      } else {
        toast.success("Guía de envío creada exitosamente.");
      }
      
      form.reset();
    }
  })

  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const resp = await ky.post("/api/v2/orders/search", { json: { }}).json<{ orders: OrderBaseType[] }>();
      return resp.orders;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const buyersQuery = useQuery({
    queryKey: ["buyers"],
    queryFn: async () => {
      const resp = await ky.post("/api/v2/buyers/search", { json: {} }).json<BuyerBaseType[]>();
      return resp;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  
  const orderOptions = useMemo((): OrderOption[] => {
    if (!ordersQuery.data) return [];
    
    return ordersQuery.data
      .filter((order: OrderBaseType) => order.name && order.buyer)
      .map((order: OrderBaseType): OrderOption => ({
        label: `${order.name} - ${order.buyer} (${order._id})`,
        value: order._id,
        searchTerm: `${order.name} ${order.buyer}`.toLowerCase(),
      }))
      .sort((a: OrderOption, b: OrderOption) => a.label.localeCompare(b.label));
  }, [ordersQuery.data]);

  const mappedOrders = useMemo(() => {
    return ordersQuery.data ? _.keyBy(ordersQuery.data, "_id") : {};
  }, [ordersQuery.data]);

  const mappedBuyers = useMemo(() => {
    return buyersQuery.data ? _.keyBy(buyersQuery.data, "_id") : {};
  }, [buyersQuery.data]);

  useEffect(() => {
    if (!watchedOrders || watchedOrders.length === 0) return;
    const selectedOrderId = watchedOrders[0];
    const selectedOrder = mappedOrders[selectedOrderId];
    setSelectedOrder(selectedOrder || null);

    const selectedBuyerId = selectedOrder?.buyer;
    const selectedBuyer = selectedBuyerId ? mappedBuyers[selectedBuyerId] : null;
    setSelectedBuyer(selectedBuyer || null);

    form.setValue("recipient.personName", selectedBuyer?.name || "");
    form.setValue("recipient.phoneNumber", selectedBuyer?.phone || "");

  }, [watchedOrders]);
  
  return {
    localData: {
      form,
      watchedOrders,
      orders: ordersQuery.data || [],
      selectedOrder,
      selectedBuyer,
    },
    store: {
      orders: {
        mapped: mappedOrders,
        options: orderOptions,
      }
    },
    flags: {
      isLoading: ordersQuery.isLoading,
      isMethodLoading: generateFedexMutation.isPending,
    },
    methods: {
      generateFedexShipment: generateFedexMutation.mutateAsync,
      downloadLabelPDF,
    }
  }
}