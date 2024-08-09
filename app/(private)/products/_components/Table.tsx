import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner} from "@nextui-org/react";
import { Product } from "@/types/MongoTypes/Product";

const ProductsTable = ({ loading, products}: { loading: boolean, products: Product[] }) => {
  return (
    <Table
      aria-label="Example static collection table"
    >
      <TableHeader>
        <TableColumn>NOMBRE</TableColumn>
        <TableColumn>MODELO</TableColumn>
        <TableColumn>CANTIDAD</TableColumn>
      </TableHeader>
      <TableBody
        emptyContent="No se encontraron productos"
        loadingContent={<Spinner />}
        loadingState={loading ? "loading" : undefined}
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