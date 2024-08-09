'use client';

import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Spinner, Chip, ChipProps} from "@nextui-org/react";
import { useOrders } from "../_hooks/useOrders";
import { Key, useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";
import { Order } from "@/types/MongoTypes/Order";

const statusColorMap: Record<string, ChipProps["color"]>  = {
  Completado: "success",
  // paused: "danger",
  Pendiente: "warning",
};

const OrdersTable = () => {
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const ordersQuery = useOrders({ page });

  const orders = useMemo(() => {
    return ordersQuery.data?.data || [];
  }, [ordersQuery.data?.data]);

  useEffect(() => {
    setTotal((prev) => {
      if (ordersQuery.data?.count) {
        return ordersQuery.data.count;
      }
      return prev;
    })
  }, [ordersQuery.data?.count])

  const columns = useMemo(() => {
    return [
      { uid: "name", name: "NOMBRE" },
      { uid: "dueDate", name: "FECHA COMPROMISO" },
      { uid: "status", name: "ESTATUS" },
    ];
  }, []);

  const renderCell = useCallback((item: Order , columnKey: Key) => {
    switch (columnKey) {
      case "name":
        return item.name;
      case "dueDate":
        return moment(item.dueDate).format("DD/MM/YYYY");
      case "status":
        return (
          <Chip className="capitalize" color={statusColorMap[item.status]} size="sm" variant="flat">
            {item.status}
          </Chip>
        );
      default:
        return null
    }
  }, []);

  return (
    <Table
      aria-label="Example static collection table"
      bottomContent={
        <div className="flex w-full justify-center">
          <Pagination
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
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.uid}>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        emptyContent="No se encontraron productos"
        loadingContent={<Spinner />}
        loadingState={ordersQuery.isLoading ? "loading" : undefined}
      >
        {orders.map((order) => (
          <TableRow key={order._id}>
            {(columnKey) => <TableCell>{renderCell(order, columnKey)}</TableCell>}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default OrdersTable;