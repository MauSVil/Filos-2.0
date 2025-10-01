"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProspectInput, ProspectInputModel } from "@/types/RepositoryTypes/Prospect";
import ProspectForm from "./_components/ProspectForm";

const ProspectDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

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

  // Fetch prospect data
  useEffect(() => {
    const fetchProspect = async () => {
      try {
        setIsFetching(true);
        const response = await fetch(`/api/prospects/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch prospect");
        }
        const data = await response.json();

        // Set form values
        form.reset({
          name: data.name,
          costConcepts: data.costConcepts || [],
          settings: data.settings,
          sweaters: data.sweaters || [],
        });
      } catch (error) {
        console.error("Error fetching prospect:", error);
      } finally {
        setIsFetching(false);
      }
    };

    if (id) {
      fetchProspect();
    }
  }, [id, form]);

  const onSubmit = async (data: ProspectInput) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/prospects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update prospect");
      }

      router.push("/prospects");
    } catch (error) {
      console.error("Error updating prospect:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este prospecto?")) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/prospects/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete prospect");
      }

      router.push("/prospects");
    } catch (error) {
      console.error("Error deleting prospect:", error);
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando prospecto...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Editar Prospecto</h1>
          <p className="text-muted-foreground">
            Actualiza el análisis de costos
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/prospects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>

      {/* Form */}
      <ProspectForm form={form} isLoading={isLoading} />
    </div>
  );
};

export default ProspectDetailPage;
