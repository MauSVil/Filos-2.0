import { Avatar, Listbox, ListboxItem } from "@nextui-org/react";
import { Key, useRef } from "react";
import { Contact } from "../page";

interface ContactsProps {
  selectedChat: string;
  handleSelectionChange: (val: Set<Key> | "all") => void;
  contacts: Contact[];
}

const Contacts = (props: ContactsProps) => {
  const { selectedChat, handleSelectionChange, contacts } = props;
  const contactsRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={contactsRef}
      className="max-w-full md:max-w-[200px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100 overflow-y-auto"
    >
      {
        <Listbox
          items={contacts}
          label="Assigned to"
          selectionMode="single"
          selectedKeys={[selectedChat]}
          onSelectionChange={handleSelectionChange}
          variant="flat"
          disallowEmptySelection
          emptyContent="No hay contactos"
        >
          {(item) => (
            <ListboxItem key={item.phone_id} textValue={item.phone_id}>
              <div className="flex gap-2 items-center justify-center">
                <Avatar alt={item.phone_id} className="flex-shrink-0" size="sm" />
                <div className="flex-col hidden lg:flex">
                  <span className="text-small">{item.phone_id}</span>
                  <span className="text-tiny text-default-400">{item.phone_id}</span>
                </div>
              </div>
            </ListboxItem>
          )}
        </Listbox>
      }
    </div>
  )
}

export default Contacts;