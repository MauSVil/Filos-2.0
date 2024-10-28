import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { create, InstanceProps } from "react-modal-promise";
import Image from "next/image";
import { Product } from "@/types/MongoTypes/Product";
import { useMemo } from "react";
import _ from "lodash";
import { toast } from "sonner";
import ky from "ky";

export interface Props extends InstanceProps<any, any> {
  products: Product[];
  productsToUpdate: { [key: string]: Product };
}

const EditProductComponent = (props: Props) => {
  const { isOpen, onResolve } = props;

  const productsMapped = useMemo(() => {
    return _.keyBy(props.products, '_id');
  }, [props.products]);
  
  const handleCloseClick = () => {
    onResolve(undefined);
  }

  const updateProducts = async (productsToUpdate: { [key: string]: Product }) => {
    return new Promise(async (resolve, reject) => {
      try {
        for (const productId in productsToUpdate) {
          const product = productsToUpdate[productId];
          await ky.put('/api/products', { json: product });
        }
        onResolve('ok');
        resolve(true);
      } catch (error) {
        console.log(error, 'error');
        reject(error);
      }
    });
  };

  const handleUpdateClick = async () => {
    toast.promise(updateProducts(props.productsToUpdate), {
      loading: 'Actualizando productos...',
      success: 'Productos actualizados exitosamente',
      error: 'Error al actualizar productos',
    }) 
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open}>
      <AlertDialogContent>
        <AlertDialogTitle>
          {'Imagen de producto'}
          <Separator className='my-3' />
        </AlertDialogTitle>
        <div className="flex flex-col gap-4">
          {
            Object.keys(props.productsToUpdate).map((productId) => {
              const originalProduct = productsMapped[productId];
              const productToUpdate = props.productsToUpdate[productId];
              return (
                <div key={productId} className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">
                    {originalProduct.uniqId}:
                  </p>
                  <div className="flex items-center gap-2">
                    <p>{originalProduct.quantity}</p>
                    <p>{"->"}</p>
                    <p>{productToUpdate.quantity}</p>
                  </div>
                  <Separator />
                </div>
              )
            })
          }
        </div>
        <AlertDialogFooter className="gap-2">
          <AlertDialogAction asChild>
              <Button onClick={handleCloseClick}>Cancelar</Button>
          </AlertDialogAction>
          <AlertDialogAction asChild>
              <Button onClick={handleUpdateClick}>Actualizar</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog >
  );
}

export const EditProductModal = create(EditProductComponent);