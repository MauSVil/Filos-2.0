'use client';

import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Spinner} from "@nextui-org/react";
import { useProducts } from "../_hooks/useProducts";
import { useMemo, useState } from "react";
import { Product } from "@/types/MongoTypes/Product";

const ProductsTable = () => {
  const [page, setPage] = useState(1)
  const productsQuery = useProducts({ page });

  const products = useMemo(() => {
    return productsQuery.data?.data || [];
  }, [productsQuery.data]);

  return (
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
            total={10}
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
  );
};

export default ProductsTable;