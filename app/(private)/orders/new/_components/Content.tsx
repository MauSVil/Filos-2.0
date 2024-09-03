"use client";

import Layout from "@/components/layout/layout";
import HorizontalSteps from "@/components/nextuipro/Stepper";
import { Icon } from "@iconify/react";
import { Button } from "@nextui-org/button";
import { useMemo, useState } from "react";
import Step0 from "./Steps/Step0";
import Step1 from "./Steps/Step1";
import Step2 from "./Steps/Step2";
import { Control, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateFormValues } from "../schemas/CreateFormValues";
import { InputFormField } from "@/components/form/InputFormField";
import { Progress } from "@/components/ui/progress";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

const defaultValues = {
}

const NewOrdersContent = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleBackStep = () => {
    if (currentStep === 0) return;
    setCurrentStep((prev) => prev - 1);
  }

  const handleNextStep = () => {
    if (currentStep === 2) return;
    setCurrentStep((prev) => prev + 1);
  }

  const form = useForm<CreateFormValues>({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(CreateFormValues),
  });

  const { handleSubmit } = form;

  const ContentComponent = useMemo(() => {
    switch (currentStep) {
      case 0:
        return <Step0 />;
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      default:
        return <div>No hay informacion</div>;
    }
  }, [currentStep]);

  const onSubmit = handleSubmit((data) => {
    console.log("Form Data:", data);
  });

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="flex flex-col w-full mb-5 gap-4">
        <div className="w-full flex justify-between items-center gap-2">
          <p>Inicio</p>
          <p>Final</p>
        </div>
        <Progress value={33} />
      </div>
      <Separator className="mb-5" />
      <div className="w-full flex-1 bg-blue">
        <Form {...form}>
          <form noValidate className="w-full mt-3 flex flex-col gap-8">
            {ContentComponent}
            <Button
                size="sm"
                color="primary"
                type="submit"
                onClick={onSubmit}
              >
                Guardar
              </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default NewOrdersContent;