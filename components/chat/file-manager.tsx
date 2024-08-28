import { InstanceProps, create, createModal } from 'react-modal-promise';

import { socket } from "@/app/(private)/chat/_socket";
import { Product } from "@/types/MongoTypes/Product";
import { Autocomplete, AutocompleteItem, Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { useAsyncList } from "@react-stately/data";
import ky from "ky";
import { Key, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogFooter, AlertDialogTitle } from "../ui/alert-dialog";
import { Separator } from "../ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

export interface Props extends InstanceProps<any, any> {
  selectedChat: string;
}

const FileManagerDialog = (props: Props) => {
  const { isOpen, onReject, onResolve, selectedChat } = props;

  const [url, setUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  let list = useAsyncList<Product>({
    async load({signal, filterText}) {
      const resp = await ky.get(`/api/products/search?q=${filterText}`, { signal }).json() as { data: { hits: Product[]} };
      return {
        items: resp.data.hits,
      };
    },
  });

  const handleSelectionChange = (value: Key | null) => {
    setUrl(value?.toString() || null);
    setFile(null);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setUrl(null);
    }
  }

  const handleSendFile = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        socket.emit('send_message', { phone_id: selectedChat, message: 'Imagen enviada', type: 'image', metadata: { base64, type: file.type, name: file.name }  });
        socket.emit('update_contact', { phone_id: selectedChat, aiEnabled: false });
      };
      reader.readAsDataURL(file);
    }
    if (url) {
      socket.emit('send_message', { phone_id: selectedChat, message: 'Imagen enviada', type: 'image', metadata: { url }  });
      socket.emit('update_contact', { phone_id: selectedChat, aiEnabled: false });
    }
    onResolve();
  }

  const handleCloseClick = () => {
    onResolve();
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open}>
      <AlertDialogContent className='w-[1000px] max-w-none'>
        <AlertDialogTitle>
          {'Resumen de modificacion de salarios de empleados'}
          <Separator className='my-3' />
        </AlertDialogTitle>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleCloseClick}>
            {'Cerrar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog >
  )
}

export const FileManager = create(FileManagerDialog);