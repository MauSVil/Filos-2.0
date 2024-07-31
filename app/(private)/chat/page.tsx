"use client";

import ChatInput from "@/components/chat/input";
import { dehydrate, HydrationBoundary, QueryClient, useQuery } from "@tanstack/react-query";
import ky from "ky";
import { Key, useEffect, useRef, useState } from "react";
import _ from "lodash";
import { MessageRepositoryFilter } from "@/types/RepositoryTypes/Message";
import moment from "moment";
import Contacts from "./_components/Contacts";
import Chat from "./_components/Chat";


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
  const queryClient = new QueryClient();

  const contactsQuery = useQuery<Contact[], SerializedError>({
    queryKey: ['contacts'],
    queryFn: async () => {
      const res = await ky.post("/api/contacts/search", { json: {}});
      const contacts = await res.json() as Contact[];
      return contacts;
    }
  })

  const messagesQuery = useQuery<Message[], SerializedError>({
    queryKey: ['messages', selectedChat],
    queryFn: async () => {
      const res = await ky.post("/api/messages/search", { json: { phone_id: selectedChat } as MessageRepositoryFilter});
      const messages = await res.json() as Message[];
      return messages;
    },
  })

  const handleSelectionChange = (val: Set<Key> | "all") => {
    if (val === "all") return;
    const myValue = [...val][0];
    const myValueString = myValue.toString();
    setSelectedChat(myValueString);
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex h-full gap-4">
        <Contacts selectedChat={selectedChat} handleSelectionChange={handleSelectionChange} contactsQuery={contactsQuery} />
        <Chat selectedChat={selectedChat} messagesQuery={messagesQuery} />
      </div>
    </HydrationBoundary>
  );
}

export default ChatPage;