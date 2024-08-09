
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Spinner, Chip, ChipProps} from "@nextui-org/react";
import { Key, useCallback, useMemo } from "react";
import moment from "moment";
import { Order } from "@/types/MongoTypes/Order";

const statusColorMap: Record<string, ChipProps["color"]>  = {
  Completado: "success",
  // paused: "danger",
  Pendiente: "warning",
};

const OrdersTable = ({ isLoading, orders }: { isLoading: boolean, orders: Order[] }) => {
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
      isHeaderSticky
      classNames={{
        base: "max-h-[500px] overflowy-scroll",
        table: "min-h-[400px]",
      }}
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
        loadingState={isLoading ? "loading" : undefined}
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