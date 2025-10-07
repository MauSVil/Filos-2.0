"use client";

import { useEffect } from "react";
import { useForm, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ky from "ky";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Users, Save, X, Building2, User } from "lucide-react";

import { InputFormField } from "@/components/form/InputFormField";
import { Form } from "@/components/form";
import { Button } from "@/components/ui/button";
import { SwitchFormField } from "@/components/form/SwitchFormField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { BuyerBaseType } from "@/types/v2/Buyer/Base.type";
import { BuyerInputSchema, BuyerInputType } from "@/types/v2/Buyer/ClientSafeSchema";
import { SerializedError } from "@/types/Chat";

interface EditBuyerContentProps {
  id: string;
}

const EditBuyerContent = ({ id }: EditBuyerContentProps) => {
  const { localData, methods, flags } = useModule(id);
  const { form, control, buyer } = localData;
  const { handleSubmit, onSubmit, handleCancel } = methods;
  const { isLoading, isUpdating } = flags;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mb-4">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="mb-8">
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/buyers">Compradores</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Editar</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Editar Comprador
            </h1>
            <p className="text-muted-foreground text-lg">
              {buyer?.name || "Cargando..."}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-6"
        >
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <InputFormField
                controllerProps={{
                  control,
                  name: "name",
                }}
                label="Nombre del Comprador"
                name="name"
                placeholder="Ej. Juan Pérez"
                disabled={isUpdating}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputFormField
                  controllerProps={{
                    control,
                    name: "email",
                  }}
                  label="Correo Electrónico"
                  name="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  disabled={isUpdating}
                />

                <InputFormField
                  controllerProps={{
                    control,
                    name: "phone",
                  }}
                  label="Teléfono"
                  name="phone"
                  placeholder="Ej. 5512345678"
                  disabled={isUpdating}
                />
              </div>

              <InputFormField
                controllerProps={{
                  control,
                  name: "address",
                }}
                label="Dirección"
                name="address"
                placeholder="Ej. Calle Principal #123, Col. Centro"
                disabled={isUpdating}
              />
            </CardContent>
          </Card>

          {/* Business Type Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Tipo de Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">
                    ¿Es un cliente de cadena?
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Activa esta opción si el comprador es una cadena comercial
                  </p>
                </div>
                <SwitchFormField
                  controllerProps={{
                    control,
                    name: "isChain",
                  }}
                  name="isChain"
                  disabled={isUpdating}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bottom Action Buttons */}
          <div className="flex justify-end gap-3 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isUpdating ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditBuyerContent;

const defaultValues: BuyerInputType = {
  name: "",
  email: "",
  phone: "",
  address: "",
  isChain: false,
};

const useModule = (id: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Query to fetch buyer data
  const buyerQuery = useQuery<BuyerBaseType>({
    queryKey: ["buyer", id],
    retry: 0,
    enabled: !!id,
    queryFn: async () => {
      try {
        const resp = (await ky
          .get(`/api/v2/buyers/${id}`)
          .json()) as BuyerBaseType;

        return resp;
      } catch (error) {
        toast.error("Error al cargar el comprador");
        throw new Error("Error al cargar el comprador");
      }
    },
  });

  // Form setup
  const form = useForm<BuyerInputType>({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(BuyerInputSchema),
  });

  const { handleSubmit, reset } = form;
  const control = form.control as any as Control<BuyerInputType>;

  // Update form when buyer data is loaded
  useEffect(() => {
    if (buyerQuery.data) {
      reset({
        name: buyerQuery.data.name,
        email: buyerQuery.data.email,
        phone: buyerQuery.data.phone,
        address: buyerQuery.data.address,
        isChain: buyerQuery.data.isChain,
      });
    }
  }, [buyerQuery.data, reset]);

  // Mutation to update buyer
  const updateMutation = useMutation<{}, SerializedError, FormData>({
    mutationFn: async (requestData: FormData) => {
      const response = await ky.put(`/api/v2/buyers/${id}`, { body: requestData });
      const result = (await response.json()) as any;

      return result;
    },
    onSuccess: () => {
      toast.success("Comprador actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["buyer", id] });
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      router.push("/buyers");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Submit handler
  const onSubmit = (values: BuyerInputType) => {
    const formdata = new FormData();
    formdata.append("data", JSON.stringify(values));
    updateMutation.mutate(formdata);
  };

  // Cancel handler
  const handleCancel = () => {
    router.push("/buyers");
  };

  return {
    localData: {
      buyer: buyerQuery.data,
      form,
      control,
    },
    methods: {
      handleSubmit,
      onSubmit,
      handleCancel,
    },
    flags: {
      isLoading: buyerQuery.isLoading,
      isError: buyerQuery.isError,
      isUpdating: updateMutation.isPending,
    },
  };
};
