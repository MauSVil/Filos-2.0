import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { CreateFormValues } from "../../schemas/CreateFormValues";
import { statusTranslations } from "../../../_components/Content";

const Step2 = () => {
  const form = useFormContext();
  const values = form.getValues();
  const { products, name, orderType, freightPrice, advancedPayment, description } = values as CreateFormValues;

  console.log(orderType, 'orderType');

  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Confirmar orden</h3>
      <Card
        className="overflow-hidden" x-chunk="dashboard-05-chunk-4"
      >
        <CardHeader>
          <CardTitle>{name}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p>Tipo de orden: {statusTranslations[orderType]}</p>
          <p>Precio de flete: ${freightPrice || 0}</p>
          <p>Anticipo: ${advancedPayment || 0}</p>
          <p>Descripcion: {description}</p>
          <p>Productos:</p>
          <ul>
            {Object.entries(products || {}).map(([productId, product]) => (
              <li key={productId}>
                <p>{product.quantity} x {product.image}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default Step2;