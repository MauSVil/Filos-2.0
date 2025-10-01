"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Calculator, ArrowLeft, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProspectInput, ProspectInputModel } from "@/types/RepositoryTypes/Prospect";
import ProspectForm from "../[id]/_components/ProspectForm";

const NewProspectPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProspectInput>({
    resolver: zodResolver(ProspectInputModel),
    defaultValues: {
      name: "",
      costConcepts: [],
      settings: {
        threadPricePerKg: 0,
      },
      sweaters: [],
    },
  });

  // Fetch latest thread price from settings
  useEffect(() => {
    const fetchLatestThreadPrice = async () => {
      try {
        const response = await fetch("/api/thread-prices/latest");
        if (response.ok) {
          const data = await response.json();
          form.setValue("settings.threadPricePerKg", data.pricePerKg);
        }
      } catch (error) {
        console.error("Error fetching latest thread price:", error);
      }
    };

    fetchLatestThreadPrice();
  }, [form]);

  const onSubmit = async (data: ProspectInput) => {
    try {
      setIsLoading(true);

      // Add IDs to sweaters and concepts if not present
      const payload = {
        ...data,
        sweaters: data.sweaters.map((s) => ({
          ...s,
          id: s.id || uuidv4(),
        })),
        costConcepts: data.costConcepts.map((c) => ({
          ...c,
          id: c.id || uuidv4(),
        })),
      };

      const response = await fetch("/api/prospects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create prospect");
      }

      const prospect = await response.json();
      router.push(`/prospects/${prospect._id}`);
    } catch (error) {
      console.error("Error creating prospect:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Prospecto</h1>
          <p className="text-muted-foreground">
            Crea un análisis de costos para tus suéteres
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/prospects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Guardando..." : "Guardar Prospecto"}
          </Button>
        </div>
      </div>

      {/* Form */}
      <ProspectForm form={form} isLoading={isLoading} />
    </div>
  );
};

export default NewProspectPage;
