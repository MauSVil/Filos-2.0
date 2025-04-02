import { Metadata } from "next";
import ProductsContent from "./_components/Content";

export const metadata: Metadata = {
  title: "Productos",
  description: "Products page",
};

const ProductsPage = () => {
  return <ProductsContent />;
};

export default ProductsPage;
