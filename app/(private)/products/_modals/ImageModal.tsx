import { create, InstanceProps } from "react-modal-promise";
import Image from "next/image";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface Props extends InstanceProps<any, any> {
  image: string;
}

const ImageComponent = (props: Props) => {
  const { isOpen, onResolve } = props;

  const handleCloseClick = () => {
    onResolve(undefined);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open}>
      <AlertDialogContent>
        <AlertDialogTitle>
          {"Imagen de producto"}
          <Separator className="my-3" />
        </AlertDialogTitle>
        <div className="h-72 relative">
          <Image
            fill
            alt="image"
            className="rounded-medium"
            src={props.image}
            style={{ objectFit: "contain" }}
          />
        </div>
        <AlertDialogFooter className="gap-2">
          <AlertDialogAction asChild>
            <Button onClick={handleCloseClick}>Cerrar</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const ImageModal = create(ImageComponent);
