"use client";

import { dehydrate, HydrationBoundary, QueryClient, useQuery } from "@tanstack/react-query";
import { Key, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import Contacts from "./_components/Contacts";
import Chat from "./_components/Chat";
import { socket } from "./_socket";

export type Contact = {
  _id: string;
  phone_id: string;
  fullName: string;
  email: string;
  aiEnabled: boolean;
  address: string;
  newMessage: boolean;
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
  const [selectedChat, setSelectedChat] = useState<string>('');
  const [contacts, setContacts] = useState<Contact[]>([]);
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
    return _.keyBy(contacts, 'phone_id');
  }, [contacts]);

  useEffect(() => {
    socket.on('contacts', (contacts) => {
      setContacts(contacts);
    });

    socket.on('new_contact', (contact: Contact) => {
      setContacts((prevContacts) => [...prevContacts, contact]);
    });

    return () => {
      socket.off('contacts');
      socket.off('new_contact');
    };
  }, []);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex h-full gap-4">
        <Contacts
          selectedChat={selectedChat}
          handleSelectionChange={handleSelectionChange}
          contacts={contacts}
        />
        <Chat
          selectedChat={selectedChat}
          contact={keyedContacts[selectedChat]}
        />
      </div>
    </HydrationBoundary>
  );
}

export default ChatPage;