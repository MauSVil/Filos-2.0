import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { create, InstanceProps } from "react-modal-promise";
import Image from "next/image";

export interface Props extends InstanceProps<any, any> {
  image: string;
}

const ImageComponent = (props: Props) => {
  const { isOpen, onResolve } = props;
  
  const handleCloseClick = () => {
    onResolve(undefined);
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open}>
      <AlertDialogContent>
        <AlertDialogTitle>
          {'Imagen de producto'}
          <Separator className='my-3' />
        </AlertDialogTitle>
        <Image
          width={500}
          height={500}
          className="rounded-medium"
          src={props.image}
          alt="image"
        />
        <AlertDialogFooter className="gap-2">
          <AlertDialogAction asChild>
            <Button onClick={handleCloseClick}>Cerrar</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog >
  );
}

export const ImageModal = create(ImageComponent);