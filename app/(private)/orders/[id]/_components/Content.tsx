"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useOrder } from "../_hooks/useOrder";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Step0 from "../../new/_components/Steps/Step0";
import Step1 from "../../new/_components/Steps/Step1";
import Step2 from "../../new/_components/Steps/Step2";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { TempOrder, TempOrderInput } from "../../new/schemas/CreateFormValues";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import ky, { HTTPError } from "ky";
import { Order } from "@/types/MongoTypes/Order";
import _ from "lodash";

const Content = ({ id }: { id: string }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const orderQuery = useOrder({ id });
  const order = useMemo(() => orderQuery?.data || {}, [orderQuery.data]) as Order;

  const ContentComponent = useMemo(() => {
    switch (currentStep) {
      case 0:
        return <Step0 />;
      case 1:
        return <Step1 order={order} />;
      case 2:
        return <Step2 label="Actualizando orden..." success={success} successLabel="Orden actualizada correctamente" error={error} />;
      default:
        return <div>No hay informacion</div>;
    }
  }, [currentStep, success, error]);

  const handleBackStep = () => {
    if (currentStep === 0) return;
    setCurrentStep((prev) => prev - 1);
    setError(undefined);
  }

  const form = useForm<TempOrder>({
    defaultValues: {},
    mode: "onChange",
    resolver: zodResolver(TempOrderInput),
  });

  const { handleSubmit } = form;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await TempOrderInput.parse(data);
      setLoading(true);
    } catch (err) {
      console.error(err);
      toast.error("Faltan productos por agregar");
      setError("Faltan productos por agregar");
      return;
    }

    try {
      setCurrentStep((prev) => prev + 1);

      await ky.put('/api/orders', { json: {
        _id: id,
        ...data,
      } }).json();

      setLoading(false);
      setSuccess(true);
    } catch (error) {
      console.error(error);
      setLoading(false);
  
      if (error instanceof HTTPError) {
        const errorData = await error.response.json() as { error: string };
        toast.error(errorData.error || "Hubo un error al editar la orden");
        setError("Hubo un error al editar la orden");
      } else if (error instanceof Error) {
        toast.error(error.message || "Hubo un error al editar la orden");
        setError("Hubo un error al editar la orden");
      } else {
        toast.error("Hubo un error desconocido al editar la orden");
        setError("Hubo un error desconocido al editar la orden");
      }
    }
  });

  const handleNextStep = () => {
    if (currentStep === 1) {
      onSubmit();
      return;
    };

    if (currentStep === 2) {
      orderQuery.refetch();
      router.push("/orders");
      return;
    }
  
    form.trigger().then((isValid) => {
      if (isValid) {
        setCurrentStep((prev) => prev + 1);
      }
    })
  }

  useEffect(() => {
    if (orderQuery.isPending) return;
    const {
      name,
      buyer,
      dueDate,
      orderType,
      freightPrice,
      advancedPayment,
      description,
    } = order;

    form.setValue('name', name);
    form.setValue('buyer', buyer);
    form.setValue('dueDate', dueDate);
    form.setValue('orderType', orderType);
    form.setValue('freightPrice', freightPrice);
    form.setValue('advancedPayment', advancedPayment);
    form.setValue('description', description);

  }, [orderQuery.isPending]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="flex flex-col w-full mb-5 gap-4">
        {
          (currentStep === 0 || currentStep === 1) && (
            <Progress value={(currentStep + 1) * 100 / 4} />
          )
        }
      </div>
      <Separator className="mb-5" />
      <div className="mb-5 w-full flex-1 bg-blue">
        <Form {...form}>
          <form noValidate className="w-full mt-3 flex flex-col gap-8">
            {ContentComponent}
          </form>
        </Form>
      </div>
      <div className="w-full flex justify-between items-center gap-4 mt-5">
        <Button
          className="w-1/2"
          onClick={handleBackStep}
          color="secondary"
          disabled={loading || currentStep === 0 || success}
        >
          Atras
        </Button>
        <Button
          className={cn("w-1/2")}
          onClick={handleNextStep}
          variant={currentStep === 1 ? "success" : "default" }
          disabled={loading || !!error}
        >
          {currentStep === 0 && "Siguiente"}
          {currentStep === 1 && "Actualizar"}
          {currentStep === 2 && "Finalizar"}
        </Button>
      </div>
    </div>
  )
};

export default Content;