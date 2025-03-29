import { NextRequest, NextResponse } from "next/server";

import { OrdersRepository } from "@/repositories/orders.repository";
import { Order } from "@/types/MongoTypes/Order";

const fedexCredentials = {
  apiKey: "l7f77a66bccf2f4d1b84de97e111f1f35f", // Reemplaza con tu clave API
  apiSecret: "ad0d331dc8a24dba88b0abcf17c4e296", // Reemplaza con tu secreto API
  accessTokenUrl: "https://apis-sandbox.fedex.com/oauth/token",
  shipmentUrl: "https://apis-sandbox.fedex.com/ship/v1/shipments",
};

const getAccessToken = async () => {
  const response = await fetch(fedexCredentials.accessTokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: fedexCredentials.apiKey,
      client_secret: fedexCredentials.apiSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error obteniendo access token: ${response.statusText}`);
  }

  const data = await response.json();

  // console.log("Access token obtenido:", data.access_token);
  return data.access_token;
};

const createShipment = async (accessToken: string, ordersFound: Order[]) => {
  console.log(ordersFound, ordersFound.length);

  const payload = {
    labelResponseOptions: "LABEL",
    requestedShipment: {
      shipper: {
        contact: {
          personName: "Mauricio Sanchez",
          phoneNumber: "1234567890",
        },
        address: {
          streetLines: ["123 Main Street"],
          city: "Memphis",
          stateOrProvinceCode: "TN",
          postalCode: "38116",
          countryCode: "US",
        },
      },
      recipients: ordersFound.map((order) => ({
        contact: {
          personName: "Jane Smith",
          phoneNumber: "0987654321",
        },
        address: {
          streetLines: ["456 Oak Avenue"],
          city: "Atlanta",
          stateOrProvinceCode: "GA",
          postalCode: "30301",
          countryCode: "US",
        },
      })),
      pickupType: "DROPOFF_AT_FEDEX_LOCATION",
      serviceType: "FEDEX_GROUND",
      packagingType: "YOUR_PACKAGING",
      shippingChargesPayment: {
        paymentType: "SENDER",
      },
      labelSpecification: {
        labelFormatType: "COMMON2D",
        imageType: "PDF",
        labelStockType: "PAPER_4X6",
      },
      requestedPackageLineItems: ordersFound.map((order) => ({
        groupPackageCount: 1,
        weight: {
          units: "LB",
          value: 5, // Ajusta dinámicamente el peso si es necesario.
        },
        dimensions: {
          length: 10,
          width: 8,
          height: 6,
          units: "IN",
        },
      })),
    },
    accountNumber: {
      value: "740561073",
    },
  };

  const response = await fetch(fedexCredentials.shipmentUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorDetails = await response.json();

    console.error("Error en detalles:", errorDetails);
    throw new Error(`Error creando shipment: ${response.statusText}`);
  }

  const data = await response.json();

  console.log(JSON.stringify(data, null, 2));

  const trackingNumber =
    data.output.transactionShipments[0].masterTrackingNumber;

  console.log("Número de seguimiento:", trackingNumber);

  // const encodedLabel = data.output.transactionShipments[0].pieceResponses[0].packageDocuments[0].encodedLabel;

  // const buffer = Buffer.from(encodedLabel, "base64");
  // fs.writeFileSync("shipment_label.pdf", buffer);
  // console.log("Etiqueta guardada como shipment_label.pdf");
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { orders } = body;

    const ordersFound = await OrdersRepository.find({ ids: orders });

    const accessToken = await getAccessToken();

    await createShipment(accessToken, ordersFound);

    return NextResponse.json({ message: "Orders sent to Fedex" });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
