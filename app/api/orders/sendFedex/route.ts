import { NextRequest, NextResponse } from "next/server";

import { FedexShipmentForm, FedexShipmentFormSchema } from "@/zodSchemas/fedexShipmentForm";

const fedexCredentials = {
  apiKey: "l7f77a66bccf2f4d1b84de97e111f1f35f",
  apiSecret: "ad0d331dc8a24dba88b0abcf17c4e296",
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

  return data.access_token;
};

const createShipment = async (accessToken: string, body: FedexShipmentForm) => {
  const bodyParsed = await FedexShipmentFormSchema.parseAsync(body);

  const payload = {
    labelResponseOptions: "LABEL",
    requestedShipment: {
      shipDatestamp: new Date().toISOString().split("T")[0],
      shipper: {
        contact: {
          personName: bodyParsed.shipper.personName,
          phoneNumber: bodyParsed.shipper.phoneNumber,
        },
        address: {
          streetLines: bodyParsed.shipper.address.streetLines,
          city: bodyParsed.shipper.address.city,
          stateOrProvinceCode: bodyParsed.shipper.address.stateOrProvinceCode,
          postalCode: bodyParsed.shipper.address.postalCode,
          countryCode: bodyParsed.shipper.address.countryCode,
        },
      },
      recipients: [{
        contact: {
          personName: bodyParsed.recipient.personName,
          phoneNumber: bodyParsed.recipient.phoneNumber,
        },
        address: {
          streetLines: bodyParsed.recipient.address.streetLines,
          city: bodyParsed.recipient.address.city,
          stateOrProvinceCode: bodyParsed.recipient.address.stateOrProvinceCode,
          postalCode: bodyParsed.recipient.address.postalCode,
          countryCode: bodyParsed.recipient.address.countryCode,
        },
      }],
      pickupType: bodyParsed.pickupType,
      serviceType: bodyParsed.serviceType,
      packagingType: bodyParsed.packagingType,
      shippingChargesPayment: {
        paymentType: bodyParsed.paymentType,
      },
      labelSpecification: {
        labelFormatType: bodyParsed.labelOptions.labelFormatType,
        imageType: bodyParsed.labelOptions.imageType,
        labelStockType: bodyParsed.labelOptions.labelStockType,
      },
      requestedPackageLineItems: [{
        groupPackageCount: 1,
        weight: {
          units: bodyParsed.packageDetails.weight.units,
          value: bodyParsed.packageDetails.weight.value,
        },
        dimensions: {
          length: bodyParsed.packageDetails.dimensions.length,
          width: bodyParsed.packageDetails.dimensions.width,
          height: bodyParsed.packageDetails.dimensions.height,
          units: bodyParsed.packageDetails.dimensions.units,
        },
      }],
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

  const trackingNumber =
    data.output.transactionShipments[0].masterTrackingNumber;

  console.log("Número de seguimiento:", trackingNumber);

  return data;

  // const encodedLabel = data.output.transactionShipments[0].pieceResponses[0].packageDocuments[0].encodedLabel;

  // const buffer = Buffer.from(encodedLabel, "base64");
  // fs.writeFileSync("shipment_label.pdf", buffer);
  // console.log("Etiqueta guardada como shipment_label.pdf");
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const accessToken = await getAccessToken();
    const shipmentResp = await createShipment(accessToken, body);

    return NextResponse.json(shipmentResp);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
