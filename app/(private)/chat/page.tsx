"use client";

import { dehydrate, HydrationBoundary, QueryClient, useQuery } from "@tanstack/react-query";
import ky from "ky";
import { Key, useEffect, useState } from "react";
import _ from "lodash";
import { MessageRepositoryFilter } from "@/types/RepositoryTypes/Message";
import Contacts from "./_components/Contacts";
import Chat from "./_components/Chat";
import io from 'socket.io-client';

// export const socket = io('https://filosbot.mausvil.dev');
export const socket = io('http://localhost:3000');

export type Contact = {
  id: string;
  name: string;
  avatar: string;
  secondary: string;
};

export type Message = {
  _id: string;
  phone_id: string;
  message: string;
  timestamp: string;
  role: string;
};

export type SerializedError = {
  status: number;
  message: string;
  details?: any;
};

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState("");
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const queryClient = new QueryClient();

  const contactsQuery = useQuery<Contact[], SerializedError>({
    queryKey: ['contacts'],
    queryFn: async () => {
      const res = await ky.post("/api/contacts/search", { json: {}});
      const contacts = await res.json() as Contact[];
      return contacts;
    }
  });

  const handleSelectionChange = (val: Set<Key> | "all") => {
    if (val === "all") return;
    const myValue = [...val][0];
    const myValueString = myValue.toString();
    setSelectedChat(myValueString);
  };

  useEffect(() => {
    socket.on('new_message', (message) => {
      setMessages((prevMessages) => {
        const newMessages = _.cloneDeep(prevMessages);
        if (!newMessages[message.phone_id]) {
          newMessages[message.phone_id] = [];
        }
        newMessages[message.phone_id].push(message);
        return newMessages;
      });
    });

    return () => {
      socket.off('new_message');
    };
  }, []);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex h-full gap-4">
        <Contacts selectedChat={selectedChat} handleSelectionChange={handleSelectionChange} contactsQuery={contactsQuery} />
        <Chat
          selectedChat={selectedChat}
          messages={messages[selectedChat]}
        />
      </div>
    </HydrationBoundary>
  );
}

export default ChatPage;