"use client";

import React, { useState } from "react";
import ky from "ky";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/zodSchemas/login";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { InputFormField } from "@/components/form/InputFormField";
import { Loader2 } from "lucide-react";

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
      await toast.promise(
        ky.post("/api/sign-in", { json: values }),
        {
          pending: 'Iniciando sesion...',
          success: 'Sesión iniciada correctamente 🎉',
          error: 'Error al iniciar sesión 😢'
        }
      )
      router.push("/products");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">
          Bienvenido
        </CardTitle>
        <CardDescription>
          Haz login para continuar
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InputFormField
              controllerProps={{
                control: form.control,
                name: 'email'
              }}
              placeholder="Escribe tu email..."
              name="email"
              type="email"
            />
            <InputFormField
              controllerProps={{
                control: form.control,
                name: 'password'
              }}
              placeholder="Escribe tu contraseña..."
              name="password"
              type="password"
            />
            <Button
              className="w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : null}
              Iniciar sesión
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
      </CardFooter>
    </Card>
    </div>
  );
}
