import { InstanceProps, create } from "react-modal-promise";
import { useAsyncList } from "@react-stately/data";
import ky from "ky";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Form } from "../form";
import { Separator } from "../ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { ComboboxFormField } from "../form/ComboboxField";
import { InputFormField } from "../form/InputFormField";
import { Button } from "../ui/button";

import { fileFormSchema } from "@/zodSchemas/FileForm";
import { Product } from "@/types/RepositoryTypes/Product";

export interface Props extends InstanceProps<any, any> {}

const FileManagerDialog = (props: Props) => {
  const { isOpen, onResolve } = props;

  const form = useForm<z.infer<typeof fileFormSchema>>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      awsFile: undefined,
      file: undefined,
    },
  });

  const { awsFile, fileFile, catalogueFile } = form.watch();

  useEffect(() => {
    if (awsFile) {
      form.setValue("fileFile", undefined);
      form.setValue("catalogueFile", undefined);
    }
  }, [awsFile]);

  useEffect(() => {
    if (fileFile) {
      form.setValue("awsFile", undefined);
      form.setValue("catalogueFile", undefined);
    }
  }, [fileFile]);

  useEffect(() => {
    if (catalogueFile) {
      form.setValue("awsFile", undefined);
      form.setValue("fileFile", undefined);
    }
  }, [catalogueFile]);

  let list = useAsyncList<Product>({
    async load({ signal, filterText }) {
      const resp = (await ky
        .get(`/api/products/search?q=${filterText}&limit=10`, { signal })
        .json()) as { data: { hits: Product[] } };

      return {
        items: resp.data.hits,
      };
    },
  });

  const handleCloseClick = () => {
    onResolve(undefined);
  };

  const onSubmit = form.handleSubmit(
    async (values: z.infer<typeof fileFormSchema>) => {
      onResolve(values);
    },
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open}>
      <AlertDialogContent className="w-[1000px] max-w-none">
        <AlertDialogTitle>
          {"Selecciona un archivo"}
          <Separator className="my-3" />
        </AlertDialogTitle>
        <Form {...form}>
          <form className="space-y-4">
            <ComboboxFormField
              className="border-white"
              controllerProps={{
                control: form.control,
                name: "awsFile",
              }}
              emptyLabel="No hay archivos"
              isLoading={list.isLoading}
              // items={list.items.map((item) => ({
              //   label: item.uniqId,
              //   value: item.image,
              // }))}
              items={[]}
              label="Selecciona un archivo de AWS"
              placeholder="Selecciona un modelo..."
              searchLabel="Buscar un archivo..."
              onInputChange={(text) => list.setFilterText(text)}
            />
            <ComboboxFormField
              className="border-white"
              controllerProps={{
                control: form.control,
                name: "catalogueFile",
              }}
              emptyLabel="No hay archivos"
              isLoading={list.isLoading}
              items={[
                {
                  label: "Mayoreo Invierno",
                  value:
                    "https://filos-develop.s3.us-west-1.amazonaws.com/catalogos/mayoreo.pdf",
                },
                {
                  label: "Menudeo Invierno",
                  value:
                    "https://filos-develop.s3.us-west-1.amazonaws.com/catalogos/menudeo.pdf",
                },
                {
                  label: "Sin precios Invierno",
                  value:
                    "https://filos-develop.s3.us-west-1.amazonaws.com/catalogos/sp.pdf",
                },
                {
                  label: "Mayoreo Otoño-Invierno",
                  value:
                    "https://filos-develop.s3.us-west-1.amazonaws.com/catalogos/mayoreo1.pdf",
                },
                {
                  label: "Menudeo Otoño-Invierno",
                  value:
                    "https://filos-develop.s3.us-west-1.amazonaws.com/catalogos/menudeo1.pdf",
                },
                {
                  label: "Sin precios Otoño-Invierno",
                  value:
                    "https://filos-develop.s3.us-west-1.amazonaws.com/catalogos/sp1.pdf",
                },
              ]}
              label="Selecciona un catalogo"
              placeholder="Selecciona un catalogo..."
              searchLabel="Buscar un catalogo..."
            />
            <InputFormField
              className="border-white"
              controllerProps={{
                control: form.control,
                name: "file",
              }}
              label="Selecciona un archivo de tu dispositivo"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];

                form.setValue("fileFile", file);
              }}
            />
          </form>
        </Form>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button onClick={handleCloseClick}>Cerrar</Button>
          </AlertDialogAction>
          <AlertDialogAction asChild>
            <Button onClick={onSubmit}>Mandar</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const FileManager = create(FileManagerDialog);
