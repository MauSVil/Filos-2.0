"use client";

import ChatInput from "@/components/chat/input";
import { Listbox, ListboxItem } from "@nextui-org/listbox";
import { Avatar } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { Key, useEffect, useRef, useState } from "react";
import _ from "lodash";
import { MessageRepositoryFilter } from "@/types/RepositoryTypes/Message";
import moment from "moment";


type Contact = {
  id: string;
  name: string;
  avatar: string;
  email: string;
};

type Message = {
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
  const contactsRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const contactsQuery = useQuery<Contact[], SerializedError>({
    queryKey: ['contacts'],
    queryFn: async () => {
      const res = await ky.post("/api/contacts", { json: {}});
      const contacts = await res.json() as Contact[];
      return contacts;
    }
  })

  const messagesQuery = useQuery<Message[], SerializedError>({
    queryKey: ['messages', selectedChat],
    queryFn: async () => {
      const res = await ky.post("/api/messages", { json: { phone_id: selectedChat } as MessageRepositoryFilter});
      const messages = await res.json() as Message[];
      return messages;
    },
  })

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat, messagesQuery.data]);

  const handleSelectionChange = (val: Set<Key> | "all") => {
    if (val === "all") return;
    const myValue = [...val][0];
    const myValueString = myValue.toString();
    setSelectedChat(myValueString);
  };

  return (
    <div className="flex h-full gap-4">
      <div
        ref={contactsRef}
        className="w-1/4 max-w-[260px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100 overflow-y-auto"
      >
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
                  <span className="text-tiny text-default-400">{item.email}</span>
                </div>
              </div>
            </ListboxItem>
          )}
        </Listbox>
      </div>
      <div className="flex flex-col flex-1 gap-4">
        <div ref={chatRef} className="flex-1 rounded-medium border-small border-divider p-6 overflow-y-auto flex flex-col gap-4">
          {
            !selectedChat ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-default-400">Selecciona un chat</span>
              </div>
            ) : (
              <>
                {
                  messagesQuery.data?.map((message) => (
                    <div
                      key={message._id}
                      className={`
                        flex
                        items-center
                        ${message.role === 'assistant' ?
                          "justify-end" :
                          "justify-start"
                        }`
                      }
                    >
                      <div
                        className={`
                          flex
                          max-w-[70%]
                          min-w-[20%]
                          px-3
                          py-2
                          gap-2
                          bg-default-100
                          dark:bg-default-300
                          rounded-medium
                          ${message.role === 'assistant' ? "flex-row-reverse bg-green-100 dark:bg-green-700" : "text-left bg-default-100 dark:bg-default-300"}
                          `
                        }
                      >
                        {/* <Avatar alt={message.phone_id} className="flex-shrink-0" size="sm" src={} /> */}
                        <div className="flex flex-col w-full">
                          <span className="text-small">{message.message}</span>
                          <span className={`text-tiny text-white text-right`}>
                            {moment(message.timestamp).format("HH:mm")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </>
            )
          }
        </div>
        {
          selectedChat && (
            <div>
              <ChatInput />
            </div>
          )
        }
      </div>
    </div>
  );
}

export default ChatPage;