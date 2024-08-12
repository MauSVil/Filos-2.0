import { Avatar, Badge, Chip, Listbox, ListboxItem, ScrollShadow } from "@nextui-org/react";
import { Key, useMemo, useRef } from "react";
import { Contact } from "../page";

interface ContactsProps {
  selectedChat: string;
  handleSelectionChange: (val: Set<Key> | "all") => void;
  contacts: { [key: string]: Contact };
}

const Contacts = (props: ContactsProps) => {
  const { selectedChat, handleSelectionChange, contacts } = props;

  return (
    <ScrollShadow className="w-1/4 max-w-[200px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100">
      <Listbox
        items={Object.values(contacts).sort((a, b) => {
          if (a.newMessage && !b.newMessage) return -1;
          if (!a.newMessage && b.newMessage) return 1;
          return 0;
        })}
        label="Assigned to"
        selectionMode="single"
        selectedKeys={[selectedChat]}
        onSelectionChange={handleSelectionChange}
        variant="flat"
        disallowEmptySelection
        emptyContent="No hay contactos"
      >
        {(item) => (
          <ListboxItem key={item?.phone_id} textValue={item.phone_id}>
            <div className="flex gap-2 items-center">
              <div className="flex flex-col w-full">
                <div className="px-2 flex flex-col">
                  <span className="text-small truncate">{item.fullName || item.phone_id}</span>
                  <span className="text-tiny text-default-400">{item.phone_id}</span>
                </div>
                <div className="flex gap-2">
                  {item.newMessage && (
                    <Chip size="sm" color="success" variant="light">Nuevo</Chip>
                  )}
                  {item.aiEnabled && (
                    <Chip size="sm" color="warning" variant="light">IA</Chip>
                  )}
                </div>
              </div>
            </div>
          </ListboxItem>
        )}
      </Listbox>
    </ScrollShadow>
  )
}

export default Contacts;