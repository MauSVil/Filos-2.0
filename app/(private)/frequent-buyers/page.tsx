import { Metadata } from "next";
import Content from './_components/Content';

export const metadata: Metadata = {
  title: "Compradores frecuentes",
  description: "Lista de compradores frecuentes",
};

const BuyersPage = () => {
  return <Content />;
};

export default BuyersPage;
