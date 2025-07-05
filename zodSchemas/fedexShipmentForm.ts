import { z } from "zod";

export const FedexShipmentFormSchema = z.object({
  selectedOrders: z.array(z.string()).min(1, "Debe seleccionar al menos una orden"),

  shipper: z.object({
    personName: z.string().min(1, "Nombre del remitente es requerido"),
    phoneNumber: z.string().min(1, "Teléfono del remitente es requerido"),
    address: z.object({
      streetLines: z.array(z.string()).min(1, "Dirección es requerida"),
      city: z.string().min(1, "Ciudad es requerida"),
      stateOrProvinceCode: z.string().min(1, "Estado/Provincia es requerido"),
      postalCode: z.string().min(1, "Código postal es requerido"),
      countryCode: z.string().min(1, "Código de país es requerido"),
    }),
  }),

  recipient: z.object({
    personName: z.string().min(1, "Nombre del destinatario es requerido"),
    phoneNumber: z.string().min(1, "Teléfono del destinatario es requerido"),
    address: z.object({
      streetLines: z.array(z.string()).min(1, "Dirección es requerida"),
      city: z.string().min(1, "Ciudad es requerida"),
      stateOrProvinceCode: z.string().min(1, "Estado/Provincia es requerido"),
      postalCode: z.string().min(1, "Código postal es requerido"),
      countryCode: z.string().min(1, "Código de país es requerido"),
    }),
  }),

  pickupType: z.enum(["DROPOFF_AT_FEDEX_LOCATION", "CONTACT_FEDEX_TO_SCHEDULE", "USE_SCHEDULED_PICKUP"], {
    required_error: "Tipo de recogida es requerido"
  }),
  serviceType: z.enum([
    "FEDEX_GROUND", "FEDEX_EXPRESS_SAVER", "FEDEX_2_DAY",
    "STANDARD_OVERNIGHT", "PRIORITY_OVERNIGHT", "FIRST_OVERNIGHT",
    "FEDEX_NEXT_DAY_FREIGHT", "FEDEX_3_DAY_FREIGHT", "INTERNATIONAL_ECONOMY",
    "INTERNATIONAL_PRIORITY", "EUROPE_FIRST_INTERNATIONAL_PRIORITY"
  ], {
    required_error: "Tipo de servicio es requerido"
  }),
  packagingType: z.enum([
    "YOUR_PACKAGING", "FEDEX_ENVELOPE", "FEDEX_PAK", "FEDEX_BOX",
    "FEDEX_10KG_BOX", "FEDEX_25KG_BOX", "FEDEX_TUBE",
    "FEDEX_SMALL_BOX", "FEDEX_MEDIUM_BOX", "FEDEX_LARGE_BOX"
  ], {
    required_error: "Tipo de empaque es requerido"
  }),

  packageDetails: z.object({
    weight: z.object({
      value: z.number().min(0.1, "Peso debe ser mayor a 0"),
      units: z.enum(["LB", "KG"]),
    }),
    dimensions: z.object({
      length: z.number().min(1, "Largo debe ser mayor a 0"),
      width: z.number().min(1, "Ancho debe ser mayor a 0"),
      height: z.number().min(1, "Alto debe ser mayor a 0"),
      units: z.enum(["IN", "CM"]),
    }),
  }),

  paymentType: z.enum(["SENDER", "RECIPIENT", "THIRD_PARTY"], {
    required_error: "Tipo de pago es requerido"
  }),

  labelOptions: z.object({
    labelFormatType: z.enum(["COMMON2D", "LABEL_DATA_ONLY"]),
    imageType: z.enum(["PDF", "PNG", "DPL", "EPL2", "ZPLII"]),
    labelStockType: z.enum(["PAPER_4X6", "PAPER_4X8", "PAPER_8.5X11", "STOCK_4X6"]),
  }),
});

export type FedexShipmentForm = z.infer<typeof FedexShipmentFormSchema>;

// Options for select fields
export const PICKUP_TYPE_OPTIONS = [
  { label: "Dejar en ubicación FedEx", value: "DROPOFF_AT_FEDEX_LOCATION" },
  { label: "Contactar FedEx para programar", value: "CONTACT_FEDEX_TO_SCHEDULE" },
  { label: "Usar recogida programada", value: "USE_SCHEDULED_PICKUP" },
];

export const SERVICE_TYPE_OPTIONS = [
  { label: "FedEx Ground", value: "FEDEX_GROUND" },
  { label: "FedEx Express Saver", value: "FEDEX_EXPRESS_SAVER" },
  { label: "FedEx 2 Day", value: "FEDEX_2_DAY" },
  { label: "Standard Overnight", value: "STANDARD_OVERNIGHT" },
  { label: "Priority Overnight", value: "PRIORITY_OVERNIGHT" },
  { label: "First Overnight", value: "FIRST_OVERNIGHT" },
  { label: "FedEx Next Day Freight", value: "FEDEX_NEXT_DAY_FREIGHT" },
  { label: "FedEx 3 Day Freight", value: "FEDEX_3_DAY_FREIGHT" },
  { label: "International Economy", value: "INTERNATIONAL_ECONOMY" },
  { label: "International Priority", value: "INTERNATIONAL_PRIORITY" },
  { label: "Europe First International Priority", value: "EUROPE_FIRST_INTERNATIONAL_PRIORITY" },
];

export const PACKAGING_TYPE_OPTIONS = [
  { label: "Mi empaque", value: "YOUR_PACKAGING" },
  { label: "Sobre FedEx", value: "FEDEX_ENVELOPE" },
  { label: "Pak FedEx", value: "FEDEX_PAK" },
  { label: "Caja FedEx", value: "FEDEX_BOX" },
  { label: "Caja FedEx pequeña", value: "FEDEX_SMALL_BOX" },
  { label: "Caja FedEx mediana", value: "FEDEX_MEDIUM_BOX" },
  { label: "Caja FedEx grande", value: "FEDEX_LARGE_BOX" },
  { label: "Caja FedEx 10kg", value: "FEDEX_10KG_BOX" },
  { label: "Caja FedEx 25kg", value: "FEDEX_25KG_BOX" },
  { label: "Tubo FedEx", value: "FEDEX_TUBE" },
];

export const PAYMENT_TYPE_OPTIONS = [
  { label: "Remitente", value: "SENDER" },
  { label: "Destinatario", value: "RECIPIENT" },
  { label: "Tercero", value: "THIRD_PARTY" },
];

export const WEIGHT_UNITS_OPTIONS = [
  { label: "Libras (LB)", value: "LB" },
  { label: "Kilogramos (KG)", value: "KG" },
];

export const DIMENSION_UNITS_OPTIONS = [
  { label: "Pulgadas (IN)", value: "IN" },
  { label: "Centímetros (CM)", value: "CM" },
];

export const LABEL_FORMAT_OPTIONS = [
  { label: "Formato común 2D", value: "COMMON2D" },
  { label: "Solo datos de etiqueta", value: "LABEL_DATA_ONLY" },
];

export const IMAGE_TYPE_OPTIONS = [
  { label: "PDF", value: "PDF" },
  { label: "PNG", value: "PNG" },
  { label: "DPL", value: "DPL" },
  { label: "EPL2", value: "EPL2" },
  { label: "ZPLII", value: "ZPLII" },
];

export const LABEL_STOCK_OPTIONS = [
  { label: "Papel 4x6", value: "PAPER_4X6" },
  { label: "Papel 4x8", value: "PAPER_4X8" },
  { label: "Papel 8.5x11", value: "PAPER_8.5X11" },
  { label: "Stock 4x6", value: "STOCK_4X6" },
];
