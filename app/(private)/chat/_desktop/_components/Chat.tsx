import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import MessageComponent from "./Message";
import { EditContactModal } from "./EditContactModal";

import ChatInput from "@/components/chat/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSocket } from "@/contexts/socketContext";
import { Button } from "@/components/ui/button";
import { EditContactFormSchema } from "@/zodSchemas/editContactForm";
import { Contact, Message } from "@/types/Chat";

type Props = {
  selectedChat: string;
  contact: Contact;
  loading?: boolean;
};

const Chat = (props: Props) => {
  const { socket, connected } = useSocket();
  const { selectedChat, contact, loading } = props;
  const [messages, setMessages] = useState<Message[]>([]);
  const [switchValue, setSwitchValue] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const handleSwitchChange = (value: boolean) => {
    socket.emit("update_contact", { phone_id: selectedChat, aiEnabled: value });
  };

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [selectedChat, messages.length]);

  useEffect(() => {
    if (!selectedChat || !connected) return;
    setSwitchValue(contact.aiEnabled);
    socket.emit("join_chat", { phone_id: selectedChat });
    socket.on(
      "joined_chat",
      ({ messages, contact }: { messages: Message[]; contact: Contact }) => {
        setMessages([]);
        setMessages(messages);
        setSwitchValue(contact.aiEnabled);
      },
    );
    socket.on(
      "updated_contact",
      ({ phone_id, aiEnabled }: { phone_id: string; aiEnabled: boolean }) => {
        setSwitchValue(aiEnabled);
      },
    );
    socket.on("sent_message", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("error", (error: string) => {
      console.log(error, "error");
      toast.error(error);
    });

    return () => {
      socket.off("joined_chat");
      socket.off("updated_contact");
      socket.off("sent_message");
      socket.off("error");
    };
  }, [selectedChat, socket, connected]);

  const handleEditContact = async () => {
    try {
      const formValues = (await EditContactModal({ contact })) as
        | EditContactFormSchema
        | undefined;

      if (!formValues) return;
      const { fullName, address, type } = formValues;
      const updatedContact: Partial<Contact> = {
        phone_id: selectedChat,
        ...(fullName && { fullName }),
        ...(address && { address }),
        ...(type && { type }),
      };

      socket.emit("update_contact", updatedContact);
    } catch (error) {
      console.log(error, "error");
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="flex flex-col flex-1 gap-2 h-full">
      {selectedChat && (
        <Card className="flex items-center justify-between p-2 rounded-medium">
          <Button size="sm" onClick={handleEditContact}>
            Editar contacto
          </Button>
          <div className="flex justify-between gap-2 items-center">
            <Switch
              checked={switchValue}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="airplane-mode">Usar AI</Label>
          </div>
        </Card>
      )}
      <Card className="flex-1">
        <CardContent className="flex">
          <div
            ref={chatRef}
            className="flex-1 h-[450px] rounded-medium border-small border-divider p-6 overflow-y-auto flex flex-col gap-4 lg:h-[650px]"
          >
            {!selectedChat ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-default-400">Selecciona un chat</span>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex items-center ${message.role === "assistant" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex max-w-[60%] rounded-md min-w-[20%] px-3 py-2 gap-2 rounded-medium ${message.role === "assistant" ? "flex-row-reverse bg-emerald-900" : "bg-zinc-800"}`}
                    >
                      <div className="flex flex-col w-full">
                        <MessageComponent
                          message={message}
                          scrollToBottom={scrollToBottom}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>
      {selectedChat && (
        <Card className="flex align-center justify-center w-full">
          <ChatInput selectedChat={selectedChat} />
        </Card>
      )}
    </div>
  );
};

export default Chat;
