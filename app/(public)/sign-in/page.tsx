"use client";

import React from "react";
import {Button, Input} from "@nextui-org/react";
import {Icon} from "@iconify/react";

import {AcmeIcon} from "@/components/icon";
import { Formik } from "formik";
import ky from "ky";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function Component() {
  const [isVisible, setIsVisible] = React.useState(false);
  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large">
        <div className="flex flex-col items-center pb-6">
          <AcmeIcon size={45} />
          <p className="text-xl font-medium">Bienvenido</p>
          <p className="text-small text-default-500">Haz login para continuar</p>
        </div>

        <Formik
          initialValues={{ email: '', password: '' }}
          validate={values => {
            const errors: { email?: string; } = {};
            if (!values.email) {
              errors.email = 'Este campo es requerido';
            } else if (
              !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
            ) {
              errors.email = 'Correo inválido';
            }
            return errors;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await toast.promise(
                ky.post("/api/sign-in", { json: values }),
                {
                  pending: 'Iniciando sesion...',
                  success: 'Sesión iniciada correctamente 🎉',
                  error: 'Error al iniciar sesión 😢'
                }
              )
              router.push("/products");
              setSubmitting(false);
            } catch (error) {
              setSubmitting(false);
            }
          }}
        >
          {({
            values,
            errors,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <div className="flex flex-col mb-3">
                <Input
                  classNames={{
                    base: "-mb-[2px]",
                    inputWrapper:
                      "rounded-b-none data-[hover=true]:z-10 group-data-[focus-visible=true]:z-10",
                  }}
                  label="Correo Electrónico"
                  name="email"
                  placeholder="Ingresa tu correo..."
                  type="email"
                  variant="bordered"
                  isInvalid={!!errors.email}
                  value={values.email}
                  isDisabled={isSubmitting}
                  errorMessage={errors.email}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
                <Input
                  classNames={{
                    inputWrapper: "rounded-t-none",
                  }}
                  endContent={
                    <button type="button" onClick={toggleVisibility}>
                      {isVisible ? (
                        <Icon
                          className="pointer-events-none text-2xl text-default-400"
                          icon="solar:eye-closed-linear"
                        />
                      ) : (
                        <Icon
                          className="pointer-events-none text-2xl text-default-400"
                          icon="solar:eye-bold"
                        />
                      )}
                    </button>
                  }
                  label="Contraseña"
                  name="password"
                  placeholder="Ingresa tu contraseña..."
                  type={isVisible ? "text" : "password"}
                  variant="bordered"
                  isInvalid={!!errors.password}
                  value={values.password}
                  isDisabled={isSubmitting}
                  errorMessage={errors.password}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
              </div>
              <Button color="primary" type="submit" isLoading={isSubmitting}>
                Iniciar Sesión
              </Button>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
}
