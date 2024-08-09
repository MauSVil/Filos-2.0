'use client';

import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Spinner, Select, SelectItem, Input} from "@nextui-org/react";
import { useProducts } from "../_hooks/useProducts";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";

const ProductsTable = () => {
  const [total, setTotal] = useState(0)
  const [tempQ, setTempQ] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1)
  const productsQuery = useProducts({ page, q });

  const products = useMemo(() => {
    return productsQuery.data?.data || [];
  }, [productsQuery.data?.data]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setPage(1);
      setQ(tempQ);
    }
  }

  useEffect(() => {
    setTotal((prev) => {
      if (productsQuery.data?.count) {
        return productsQuery.data.count;
      }
      return prev;
    })
  }, [productsQuery.data?.count])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-center gap-3 md:flex-row w-full justify-end">
        <Input
          placeholder="Buscar producto"
          className="max-w-xs"
          classNames={{
            inputWrapper: "h-full"
          }}
          onKeyDown={handleKeyDown}
          endContent={<Icon icon="carbon:search" />}
          value={tempQ}
          onChange={(e) => setTempQ(e.currentTarget.value)}
        />
        {/* <Select
          label="Disponibilidad"
          className="max-w-xs"
          size="sm"
          isDisabled
        >
          <SelectItem key="1">Todos</SelectItem>
          <SelectItem key="2">No hay stock</SelectItem>
          <SelectItem key="3">Limitado</SelectItem>
          <SelectItem key="4">En stock</SelectItem>
        </Select> */}
      </div>
      <Table
        aria-label="Example static collection table"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={Math.ceil(total / 10)}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
      >
        <TableHeader>
          <TableColumn>NOMBRE</TableColumn>
          <TableColumn>MODELO</TableColumn>
          <TableColumn>CANTIDAD</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent="No se encontraron productos"
          loadingContent={<Spinner />}
          loadingState={productsQuery.isLoading ? "loading" : undefined}
        >
          {products.map((product) => (
            <TableRow key={product._id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.uniqId}</TableCell>
              <TableCell>{product.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsTable;