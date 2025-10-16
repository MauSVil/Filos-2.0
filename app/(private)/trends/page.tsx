import { Metadata } from "next";
import Content from './_components/Content';

export const metadata: Metadata = {
  title: "Tendencias de Suéteres",
  description: "Análisis de tendencias de suéteres en México",
};

const TrendsPage = () => {
  return <Content />;
};

export default TrendsPage;
