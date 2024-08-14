import Layout from "@/components/layout/layout";
import { Button } from "@nextui-org/button";

const NewBuyersContent = () => {
  return (
    <Layout
      title="Nuevo Comprador"
      breadcrumbs={["Compradores", "Nuevo"]}
      actions={
        <div className="flex gap-3">
          <Button
            size="sm"
            color="primary"
          >
              Guardar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 h-full">
        <h2 className="text-xl font-semibold">New Buyers</h2>
        <p>
          Add new buyers to your store. You can add multiple buyers at once by
          uploading a CSV file.
        </p>
      </div>
    </Layout>
  )
}

export default NewBuyersContent;