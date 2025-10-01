import { Metadata } from "next";
import ProspectsContent from "./_components/Content";

export const metadata: Metadata = {
  title: "Prospectos",
  description: "Prospects page",
};

const ProspectsPage = () => {
  return <ProspectsContent />;
};

export default ProspectsPage;
