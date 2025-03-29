"use client";

import React, { useState } from "react";
import ky from "ky";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loginSchema } from "@/zodSchemas/login";
import { Form } from "@/components/ui/form";
import { InputFormField } from "@/components/form/InputFormField";

const defaultValues = {
  email: "",
  password: "",
};

export default function Component() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof loginSchema>>({
    defaultValues,
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setLoading(true);
      const asd = await toast.promise(
        ky.post("/api/sign-in", { json: values }),
        {
          loading: "Iniciado sesion...",
          success: "Sesion iniciada correctamente",
          error: "Error al iniciar sesion",
        },
      );

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Bienvenido</CardTitle>
          <CardDescription>Haz login para continuar</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <InputFormField
                controllerProps={{
                  control: form.control,
                  name: "email",
                }}
                name="email"
                placeholder="Escribe tu email..."
                type="email"
              />
              <InputFormField
                controllerProps={{
                  control: form.control,
                  name: "password",
                }}
                name="password"
                placeholder="Escribe tu contraseña..."
                type="password"
              />
              <Button className="w-full" disabled={loading} type="submit">
                {loading ? <Loader2 className="animate-spin" /> : null}
                Iniciar sesión
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  );
}
