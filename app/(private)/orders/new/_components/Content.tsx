"use client";

import { useMemo, useState } from "react";
import Step0 from "./Steps/Step0";
import Step1 from "./Steps/Step1";
import Step2 from "./Steps/Step2";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { validateProductsStep } from "../schemas/CreateFormValues";
import { Progress } from "@/components/ui/progress";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { OrderInput, OrderInputModel } from "@/types/RepositoryTypes/Order";

const defaultValues = {
}

const NewOrdersContent = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [orderGenerationStep, setOrderGenerationStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleBackStep = () => {
    if (currentStep === 0) return;
    setCurrentStep((prev) => prev - 1);
  }

  const form = useForm<OrderInput>({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(OrderInputModel),
  });

  const { handleSubmit } = form;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await validateProductsStep.parse(data);
      setLoading(true);
      setCurrentStep((prev) => prev + 1);
  
      await new Promise((resolve) => {
        setTimeout(() => {
          setOrderGenerationStep((prev) => prev + 1);
          resolve('');
        }, 2000);
      });
  
      await new Promise((resolve) => {
        setTimeout(() => {
          setOrderGenerationStep((prev) => prev + 1);
          resolve('');
        }, 2000);
      });
  
      await new Promise((resolve) => {
        setTimeout(() => {
          // setOrderGenerationStep((prev) => prev + 1);
          resolve('');
        }, 2000);
  
        setLoading(false);
      });
    } catch (err) {
      toast.error("Faltan productos por agregar");
    }
  });

  const handleNextStep = () => {
    if (currentStep === 1) {
      onSubmit();
      return;
    };

    if (currentStep === 2) {
      router.push("/orders");
      return;
    }
    form.trigger().then((isValid) => {
      if (isValid) {
        setCurrentStep((prev) => prev + 1);
      }
    });
  }

  const ContentComponent = useMemo(() => {
    switch (currentStep) {
      case 0:
        return <Step0 />;
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 orderGenerationStep={orderGenerationStep} />;
      default:
        return <div>No hay informacion</div>;
    }
  }, [currentStep, orderGenerationStep]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="flex flex-col w-full mb-5 gap-4">
        {
          currentStep === 0 || currentStep === 1 && (
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
          disabled={loading || currentStep === 0 || currentStep === 2}
        >
          Atras
        </Button>
        <Button
          className={cn("w-1/2")}
          onClick={handleNextStep}
          variant={currentStep === 1 ? "success" : "default" }
          disabled={loading}
        >
          {currentStep === 0 && "Siguiente"}
          {currentStep === 1 && "Generar orden"}
          {currentStep === 2 && "Finalizar"}
        </Button>
      </div>
    </div>
  )
}

export default NewOrdersContent;