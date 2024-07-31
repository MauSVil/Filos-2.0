import { Avatar, CircularProgress, Listbox, ListboxItem } from "@nextui-org/react";
import { UseQueryResult } from "@tanstack/react-query";
import { Key, useRef } from "react";
import { Contact, SerializedError } from "../page";

interface ContactsProps {
  selectedChat: string;
  handleSelectionChange: (val: Set<Key> | "all") => void;
  contactsQuery: UseQueryResult<Contact[], SerializedError>;
}

const Contacts = (props: ContactsProps) => {
  const { selectedChat, handleSelectionChange, contactsQuery } = props;
  const contactsRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={contactsRef}
      className="w-1/4 min-w-[200px] max-w-[200px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100 overflow-y-auto"
    >
      {
        contactsQuery.isLoading ? (
          <div className="flex items-center justify-center h-full">
            <CircularProgress />
          </div>
        ) : (
          <Listbox
            items={contactsQuery.data || []}
            label="Assigned to"
            selectionMode="single"
            selectedKeys={[selectedChat]}
            onSelectionChange={handleSelectionChange}
            variant="flat"
            disallowEmptySelection
            emptyContent="No hay contactos"
          >
            {(item) => (
              <ListboxItem key={item.id} textValue={item.name}>
                <div className="flex gap-2 items-center">
                  <Avatar alt={item.name} className="flex-shrink-0" size="sm" src={item.avatar} />
                  <div className="flex flex-col">
                    <span className="text-small">{item.name}</span>
                    <span className="text-tiny text-default-400">{item.secondary}</span>
                  </div>
                </div>
              </ListboxItem>
            )}
          </Listbox>
        )
      }
    </div>
  )
}

export default Contacts;