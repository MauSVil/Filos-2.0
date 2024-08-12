"use client";

import { dehydrate, HydrationBoundary, QueryClient, useQuery } from "@tanstack/react-query";
import { Key, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import Contacts from "./_components/Contacts";
import Chat from "./_components/Chat";
import { socket } from "./_socket";
import { Input } from "@nextui-org/input";

export type Contact = {
  _id: string;
  phone_id: string;
  fullName: string;
  email: string;
  aiEnabled: boolean;
  address: string;
  newMessage: boolean;
  lastMessageSent: Date;
};

export type Message = {
  _id: string;
  type: string;
  timestamp: string;
  role: string;
  phone_id: string;
  message: string;
  metadata: {
    url: string;
  }
};

export type SerializedError = {
  status: number;
  message: string;
  details?: any;
};

const ChatPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [value, setValue] = useState<string>('');
  const [selectedChat, setSelectedChat] = useState<string>('');
  const [contacts, setContacts] = useState<{ [key: string]: Contact }>({});
  const queryClient = new QueryClient();

  const handleSelectionChange = (val: Set<Key> | "all") => {
    if (val === "all") return;
    const myValue = [...val][0];
    const myValueString = myValue.toString();
    setSelectedChat((prevState) => {
      socket.emit('leave_chat', { phone_id: prevState});
      return myValueString;
    });
  };

  const keyedContacts = useMemo(() => {
    const contactsFiltered = Object.values(contacts).filter((contact) => {
      return (contact?.fullName?.toLowerCase() || '').includes(value.toLowerCase()) || (contact?.phone_id?.toLowerCase() || '').includes(value.toLowerCase());
    });

    return _.keyBy(contactsFiltered, 'phone_id');
  }, [contacts, value]);

  useEffect(() => {
    socket.on('contacts', (contacts: Contact[]) => {
      setContacts(_.keyBy(contacts, 'phone_id'));
      setLoading(false);
    });

    socket.on('new_contact', (contact: Contact) => {
      setContacts((prevState) => {
        return { ...prevState, [contact.phone_id]: contact };
      });
    });

    socket.on('list_contact_update', (contact: Contact) => {
      setContacts((prevState) => {
        return { ...prevState, [contact.phone_id]: contact };
      });
    });

    return () => {
      socket.off('contacts');
      socket.off('new_contact');
      socket.off('list_contact_update');
    };
  }, []);

  console.log(loading, 'loading');

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex h-full gap-4">
        <div className="flex flex-col gap-2 w-1/4 max-w-[200px]">
          <Input
            placeholder="Busca un contacto..."
            size="sm"
            variant="bordered"
            value={value}
            onValueChange={setValue}
          />
          <Contacts
            loading={loading}
            selectedChat={selectedChat}
            handleSelectionChange={handleSelectionChange}
            contacts={keyedContacts}
          />
        </div>
        <Chat
          selectedChat={selectedChat}
          contact={keyedContacts[selectedChat]}
        />
      </div>
    </HydrationBoundary>
  );
}

export default ChatPage;