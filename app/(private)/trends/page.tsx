import { Metadata } from "next";
import Content from './_components/Content';

export const metadata: Metadata = {
  title: "Tendencias de Moda",
  description: "Descubrimiento de tendencias en suéteres",
};

const TrendsPage = () => {
  return <Content />;
};

export default TrendsPage;
