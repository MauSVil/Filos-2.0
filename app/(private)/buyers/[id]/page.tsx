import { Metadata } from "next";
import EditBuyerContent from "./_components/Content";

export const metadata: Metadata = {
  title: "Editar Comprador",
  description: "Edit buyer page",
};

interface EditBuyerPageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditBuyerPage = async ({ params }: EditBuyerPageProps) => {
  const { id } = await params;
  return <EditBuyerContent id={id} />;
};

export default EditBuyerPage;
