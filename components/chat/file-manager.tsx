import { InstanceProps, create, createModal } from 'react-modal-promise';

import { socket } from "@/app/(private)/chat/_socket";
import { Product } from "@/types/MongoTypes/Product";
import { Autocomplete, AutocompleteItem, Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { useAsyncList } from "@react-stately/data";
import ky from "ky";
import { Key, useEffect, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogFooter, AlertDialogTitle } from "../ui/alert-dialog";
import { Separator } from "../ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Form } from '../form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fileFormSchema } from '@/zodSchemas/FileForm';
import { z } from 'zod';
import { ComboboxFormField } from '../form/ComboboxField';
import { FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import { Popover, PopoverTrigger } from '../ui/popover';
import { InputFormField } from '../form/InputFormField';

export interface Props extends InstanceProps<any, any> {
  selectedChat: string;
}

const languages = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese", value: "zh" },
]

const FileManagerDialog = (props: Props) => {
  const { isOpen, onReject, onResolve, selectedChat } = props;

  const form = useForm<z.infer<typeof fileFormSchema>>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      awsFile: undefined,
      file: undefined,
    }
  })

  const { awsFile, file } = form.watch();

  console.log(typeof file);

  useEffect(() => {
    if (awsFile) {
      form.setValue('file', undefined);
    }
  }, [awsFile])

  useEffect(() => {
    if (file) {
      form.setValue('awsFile', undefined);
    }
  }, [file])

  let list = useAsyncList<Product>({
    async load({signal, filterText}) {
      const resp = await ky.get(`/api/products/search?q=${filterText}`, { signal }).json() as { data: { hits: Product[]} };
      return {
        items: resp.data.hits,
      };
    },
  });

  // const handleSendFile = () => {
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       const base64 = reader.result as string;
  //       socket.emit('send_message', { phone_id: selectedChat, message: 'Imagen enviada', type: 'image', metadata: { base64, type: file.type, name: file.name }  });
  //       socket.emit('update_contact', { phone_id: selectedChat, aiEnabled: false });
  //     };
  //     reader.readAsDataURL(file);
  //   }
  //   if (url) {
  //     socket.emit('send_message', { phone_id: selectedChat, message: 'Imagen enviada', type: 'image', metadata: { url }  });
  //     socket.emit('update_contact', { phone_id: selectedChat, aiEnabled: false });
  //   }
  //   onResolve();
  // }

  const handleCloseClick = () => {
    onResolve();
  }

  const onSubmit = form.handleSubmit(async (values: z.infer<typeof fileFormSchema>) => {
    console.log(values);
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open}>
      <AlertDialogContent className='w-[1000px] max-w-none'>
        <AlertDialogTitle>
          {'Selecciona un archivo'}
          <Separator className='my-3' />
        </AlertDialogTitle>
          <Form {...form}>
            <form className="space-y-4">
              <ComboboxFormField
                items={list.items.map((item) => ({ label: item.uniqId, value: item.image }))}
                controllerProps={{
                  control: form.control,
                  name: 'awsFile'
                }}
                label='Selecciona un archivo de AWS'
                placeholder='Selecciona un modelo...'
                emptyLabel='No hay archivos'
                searchLabel='Buscar un archivo...'
              />
              <InputFormField
                controllerProps={{
                  control: form.control,
                  name: 'file'
                }}
                type='file'
                label='Selecciona un archivo de tu dispositivo'
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
    </AlertDialog >
  )
}

export const FileManager = create(FileManagerDialog);