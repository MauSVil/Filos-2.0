"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import ky, { HTTPError } from "ky";

import Step0 from "../../new/_components/Steps/Step0";
import Step1 from "../../new/_components/Steps/Step1";
import Step2 from "../../new/_components/Steps/Step2";
import { TempOrder, TempOrderInput } from "../../new/schemas/CreateFormValues";

import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useModule } from "../_modules/useModule";

const Content = ({ id }: { id: string }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const { localData, flags, methods } = useModule({ id });
  const { order } = localData;
  const { refetch } = methods;

  const ContentComponent = useMemo(() => {
    switch (currentStep) {
      case 0:
        return <Step0 />;
      case 1:
        return <Step1 order={order} type="edit" />;
      case 2:
        return (
          <Step2
            error={error}
            label="Actualizando orden..."
            success={success}
            successLabel="Orden actualizada correctamente"
          />
        );
      default:
        return <div>No hay informacion</div>;
    }
  }, [currentStep, success, error]);

  const handleBackStep = () => {
    if (currentStep === 0) return;
    setCurrentStep((prev) => prev - 1);
    setError(undefined);
  };

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

      await ky.post(`/api/v2/orders/${id}`, { json: { ...data } }).json();

      setLoading(false);
      setSuccess(true);
    } catch (error) {
      console.error(error);
      setLoading(false);

      if (error instanceof HTTPError) {
        const errorData = (await error.response.json()) as { error: string };

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
    }

    if (currentStep === 2) {
      refetch();
      router.push("/orders");

      return;
    }

    form.trigger().then((isValid) => {
      if (isValid) {
        setCurrentStep((prev) => prev + 1);
      }
    });
  };

  useEffect(() => {
    if (flags.isLoading) return;
    const {
      name,
      buyer,
      dueDate,
      orderType,
      freightPrice,
      advancedPayment,
      description,
    } = order;

    form.setValue("name", name);
    form.setValue("buyer", buyer);
    form.setValue("dueDate", dueDate);
    form.setValue("orderType", orderType);
    form.setValue("freightPrice", freightPrice);
    form.setValue("advancedPayment", advancedPayment);
    form.setValue("description", description);
  }, [flags.isLoading]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="flex flex-col w-full mb-5 gap-4">
        {(currentStep === 0 || currentStep === 1) && (
          <Progress value={((currentStep + 1) * 100) / 4} />
        )}
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
          color="secondary"
          disabled={loading || currentStep === 0 || success}
          onClick={handleBackStep}
        >
          Atras
        </Button>
        <Button
          className={cn("w-1/2")}
          disabled={loading || !!error}
          variant={currentStep === 1 ? "default" : "default"}
          onClick={handleNextStep}
        >
          {currentStep === 0 && "Siguiente"}
          {currentStep === 1 && "Actualizar"}
          {currentStep === 2 && "Finalizar"}
        </Button>
      </div>
    </div>
  );
};

export default Content;
