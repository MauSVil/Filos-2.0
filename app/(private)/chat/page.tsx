"use client";

import { dehydrate, HydrationBoundary, QueryClient, useQuery } from "@tanstack/react-query";
import ky from "ky";
import { Key, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import Contacts from "./_components/Contacts";
import Chat from "./_components/Chat";
import io from 'socket.io-client';

// export const socket = io('https://filosbot.mausvil.dev');
export const socket = io('http://localhost:3000');

export type Contact = {
  _id: string;
  phone_id: string;
  fullName: string;
  email: string;
  aiEnabled: boolean;
  address: string;
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

    return () => {
      socket.off('contacts');
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