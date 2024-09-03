"use client";

import { useMemo, useState } from "react";
import Step0 from "./Steps/Step0";
import Step1 from "./Steps/Step1";
import Step2 from "./Steps/Step2";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateFormValues } from "../schemas/CreateFormValues";
import { Progress } from "@/components/ui/progress";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const defaultValues = {
}

const NewOrdersContent = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleBackStep = () => {
    if (currentStep === 0) return;
    setCurrentStep((prev) => prev - 1);
  }

  const handleNextStep = () => {
    if (currentStep === 2) return;
    form.trigger().then((isValid) => {
      if (isValid) {
        setCurrentStep((prev) => prev + 1);
      }
    });
  }

  const form = useForm<CreateFormValues>({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(CreateFormValues),
  });

  const { handleSubmit } = form;

  const onSubmit = handleSubmit((data) => {
    console.log("Form Data:", data);
  });

  const ContentComponent = useMemo(() => {
    switch (currentStep) {
      case 0:
        return <Step0 />;
      case 1:
        return <Step1 onSubmit={onSubmit} />;
      case 2:
        return <Step2 />;
      default:
        return <div>No hay informacion</div>;
    }
  }, [currentStep]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="flex flex-col w-full mb-5 gap-4">
        <div className="w-full flex justify-between items-center gap-2">
          <p>Inicio</p>
          <p>Final</p>
        </div>
        <Progress value={(currentStep + 1) * 100 / 3} />
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
        >
          Atras
        </Button>
        <Button
          className="w-1/2"
          onClick={handleNextStep}
          color="default"
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}

export default NewOrdersContent;