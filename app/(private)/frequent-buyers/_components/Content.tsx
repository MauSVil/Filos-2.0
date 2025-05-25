'use client';

import { useMemo } from "react";
import { useModule } from "../_modules/useModule";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Content = () => {
  const { localData, flags, methods } = useModule();
  const { buyers, page } = localData;
  const { setPage } = methods;

  const content = useMemo(() => {
    if (flags.isLoading) return <div>Cargando...</div>;
    if (flags.isError) return <div>Error al cargar los datos</div>;
    if (!buyers || Object.keys(buyers).length === 0) return <div>No hay compradores frecuentes</div>;

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-4 justify-end">
          <Button
            disabled={page === 1}
            size={"sm"}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="text-sm">
            {`${page} / ${Math.ceil((Object.keys(localData.buyers ?? {}).length || 0) / 10)}`}
          </span>
          <Button
            disabled={Math.ceil((Object.keys(localData.buyers ?? {}).length || 0) / 10) <= page}
            form=""
            size={"sm"}
            onClick={() => setPage((prev) => prev + 1)}
          >
            <ChevronRight size={14} />
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">Comprador</TableHead>
              <TableHead className="w-1/4">Órdenes</TableHead>
              <TableHead className="w-1/4">Productos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(buyers)
              .sort(([, a], [, b]) => b.orders - a.orders)
              .slice((page - 1) * 10, page * 10)
              .map(([name, data]) => (
                <TableRow key={name}>
                  <TableCell className="font-medium">{name}</TableCell>
                  <TableCell>{data.orders}</TableCell>
                  <TableCell>{data.products}</TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </div>
    )
  }, [flags.isLoading, flags.isError, page])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end">
        <h1 className="text-2xl font-bold">
          Compradores frecuentes
        </h1>
        <span className="ml-2 text-sm text-muted-foreground">
          (Año actual)
        </span>
      </div>
      {content}
    </div>
  )
}

export default Content;