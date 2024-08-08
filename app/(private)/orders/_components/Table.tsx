'use client';

import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Spinner} from "@nextui-org/react";
import { useOrders } from "../_hooks/useOrders";
import { useMemo, useState } from "react";
import moment from "moment";

const OrdersTable = () => {
  const [page, setPage] = useState(1)
  const ordersQuery = useOrders({ page });

  const orders = useMemo(() => {
    return ordersQuery.data?.data || [];
  }, [ordersQuery.data]);

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
        <TableColumn>FECHA COMPROMISO</TableColumn>
        <TableColumn>ESTATUS</TableColumn>
      </TableHeader>
      <TableBody
        emptyContent="No se encontraron productos"
        loadingContent={<Spinner />}
        loadingState={ordersQuery.isLoading ? "loading" : undefined}
      >
        {orders.map((order) => (
          <TableRow key={order._id}>
            <TableCell>{order.name}</TableCell>
            <TableCell>{moment(order.dueDate).format('YYYY-DD-MM')}</TableCell>
            <TableCell>{order.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default OrdersTable;