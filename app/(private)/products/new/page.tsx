"use client";

import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Content from "./_components/Content";

const NewProductPage = () => {
  return (
    <>
      <div className="mb-2">
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Regresar
          </Link>
        </Button>
      </div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800">
          <Package className="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Crear Nuevo Producto</h1>
          <p className="text-sm text-gray-500">Agrega un nuevo producto al inventario</p>
        </div>
      </div>

      <Content />
    </>
  );
};

export default NewProductPage;
