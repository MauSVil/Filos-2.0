import { socket } from "@/app/(private)/chat/_socket";
import { Product } from "@/types/MongoTypes/Product";
import { Autocomplete, AutocompleteItem, Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { Key, useMemo, useState } from "react";

interface Props {
  fileManagerOpen: boolean;
  setFileManagerOpen: (value: boolean) => void;
  selectedChat: string;
}

const FileManager = (props: Props) => {
  const { fileManagerOpen, setFileManagerOpen, selectedChat } = props;
  const [url, setUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const productsQuery = useQuery<Product[]>({
    enabled: fileManagerOpen,
    queryKey: ['products'],
    queryFn: async () => {
      const resp = await ky.post('/api/products/search', { json: {} }).json() as { data: Product[] };
      return resp.data;
    }
  })

  const productsParsed = useMemo(() => {
    return (productsQuery.data || []).map((product) => {
      return {
        label: product.uniqId,
        value: product.image
      }
    });
  }, [productsQuery.data])

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
    setFileManagerOpen(false);
  }

  return (
    <Modal isOpen={fileManagerOpen} onClose={() => setFileManagerOpen(false)}>
      <ModalContent>
        <ModalHeader>File Manager</ModalHeader>
        <ModalBody>
          <div className="flex gap-4 flex-col">
            <Autocomplete
              labelPlacement="outside"
              label="Producto"
              variant="bordered"
              defaultItems={productsParsed}
              placeholder="Busca un producto..."
              selectedKey={url}
              onSelectionChange={handleSelectionChange}
            >
              {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
            </Autocomplete>
            <Input
              type="file"
              onChange={handleInputChange}
              label="Escoge un archivo externo"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={handleSendFile}
            color="primary"
            isDisabled={!url && !file}
          >
            Mandar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default FileManager;