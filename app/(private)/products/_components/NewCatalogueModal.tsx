import { create, InstanceProps } from "react-modal-promise";
import { useState } from "react";
import ky from "ky";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface Props extends InstanceProps<any, any> {
  productIds: string[];
}

const NewCatalogComponent = (props: Props) => {
  const { isOpen, onResolve } = props;
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCloseClick = () => {
    onResolve(undefined);
  };

  const handleCreateClick = async () => {
    setLoading(true);
    toast.promise(
      ky.post("/api/catalogs/new", {
        json: { pdfIds: props.productIds, name: value },
      }),
      {
        loading: "Creando catalogo...",
        success: async (res) => {
          const { data } = (await res.json()) as { data: string };

          window.open(data, "_blank");
          onResolve(undefined);

          return "Catalogo creado exitosamente";
        },
        error: "Hubo un error al crear el catalogo",
        finally: () => setLoading(false),
      },
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open}>
      <AlertDialogContent>
        <AlertDialogTitle>
          {"Imagen de producto"}
          <Separator className="my-3" />
        </AlertDialogTitle>
        <Input
          placeholder="Escriba un nombre para el catalogo..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <AlertDialogFooter className="gap-2">
          <AlertDialogAction asChild>
            <Button onClick={handleCloseClick}>Cancelar</Button>
          </AlertDialogAction>
          <AlertDialogAction asChild>
            <Button
              disabled={loading}
              variant="outline"
              onClick={handleCreateClick}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const NewCatalogModal = create(NewCatalogComponent);
