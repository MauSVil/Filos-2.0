
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Spinner, Chip, ChipProps, Button} from "@nextui-org/react";
import { Key, useCallback, useMemo } from "react";
import moment from "moment";
import { Order } from "@/types/MongoTypes/Order";
import { Icon } from "@iconify/react";

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
      { uid: "paid", name: "PAGADO" },
      { uid: "products", name: "PRODUCTOS" },
      { uid: "freightPrice", name: "FLETE" },
      { uid: "totalPrice", name: "TOTAL" },
      { uid: "actions", name: "ACCIONES" },
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
      case "paid":
        return (
          <Chip className="capitalize" color={item.paid ? "success" : "danger"} size="sm" variant="flat">
            {item.paid ? "Si" : "No"}
          </Chip>
        )
      case "products":
        return item.products.length;
      case "freightPrice":
        return `$${item.freightPrice}`;
      case "totalPrice":
        return `$${item.totalAmount}`;
      case "actions":
        return (
          <Button isIconOnly color="primary" onClick={() => window.open(item.documents.order, '_blank') }>
            <Icon icon="solar:download-outline" />
          </Button>
        )
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