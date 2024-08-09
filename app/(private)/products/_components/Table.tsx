import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner} from "@nextui-org/react";
import { Product } from "@/types/MongoTypes/Product";

const ProductsTable = ({ loading, products}: { loading: boolean, products: Product[] }) => {
  return (
    <Table
      aria-label="Example static collection table"
    >
      <TableHeader>
        <TableColumn>MODELO</TableColumn>
        <TableColumn>NOMBRE</TableColumn>
        <TableColumn>COLOR</TableColumn>
        <TableColumn>TALLA</TableColumn>
        <TableColumn>CANTIDAD</TableColumn>
        <TableColumn style={{ color: 'green' }}>PRECIO ESPECIAL</TableColumn>
        <TableColumn style={{ color: 'magenta' }}>PRECIO MAYOREO</TableColumn>
        <TableColumn style={{ color: 'yellow' }}>PRECIO SEMIMAYOREO</TableColumn>
        <TableColumn style={{ color: 'red' }}>PRECIO WEB</TableColumn>
      </TableHeader>
      <TableBody
        emptyContent="No se encontraron productos"
        loadingContent={<Spinner />}
        loadingState={loading ? "loading" : undefined}
      >
        {products.map((product) => (
          <TableRow key={product._id}>
            <TableCell>{product.uniqId}</TableCell>
            <TableCell>{product.name}</TableCell>
            <TableCell>{product.color}</TableCell>
            <TableCell>{product.size}</TableCell>
            <TableCell>{product.quantity}</TableCell>
            <TableCell>${product.specialPrice}</TableCell>
            <TableCell>${product.wholesalePrice}</TableCell>
            <TableCell>${product.retailPrice}</TableCell>
            <TableCell>${product.webPagePrice}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProductsTable;