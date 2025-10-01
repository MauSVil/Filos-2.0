"use client";

import { ArrowLeft, Calculator } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import Content from "./_components/Content";

const CalculatorPage = () => {
  return (
    <>
      <div className="mb-2">
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Regresar
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800">
          <Calculator className="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Calculadora de Costos</h1>
          <p className="text-sm text-gray-500">Calcula el costo de producción por suéter</p>
        </div>
      </div>

      <Content />
    </>
  );
};

export default CalculatorPage;