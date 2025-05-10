import { Metadata } from "next";
import Content from './_components/Content';

export const metadata: Metadata = {
  title: "Productos vendidos",
  description: "Products sold page",
};

const ProductsPage = () => {
  return <Content />;
};

export default ProductsPage;
