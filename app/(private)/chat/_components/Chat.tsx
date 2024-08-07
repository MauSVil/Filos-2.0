import ChatInput from "@/components/chat/input";
import { useEffect, useRef, useState } from "react";
import { Contact, Message, socket } from "../page";
import { Switch } from "@nextui-org/react";
import { toast } from "react-toastify";
import MessageComponent from "./Message";

type Props = {
  selectedChat: string;
  contact: Contact;
};

const Chat = (props: Props) => {
  const { selectedChat, contact } = props;
  const [messages, setMessages] = useState<Message[]>([]);
  const [switchValue, setSwitchValue] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const handleSwitchChange = (value: boolean) => {
    socket.emit('update_contact', { phone_id: selectedChat, aiEnabled: value });
  }

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat, messages.length]);

  useEffect(() => {
    if (!selectedChat) return;
    setSwitchValue(contact.aiEnabled);
    socket.emit('join_chat', { phone_id: selectedChat});
    socket.on('joined_chat', ({ messages, contact }: { messages: Message[], contact: Contact }) => {
      setMessages([]);
      setMessages(messages);
      setSwitchValue(contact.aiEnabled);
    });
    socket.on('updated_contact', ({ phone_id, aiEnabled }: { phone_id: string, aiEnabled: boolean }) => {
      setSwitchValue(aiEnabled);
    });
    socket.on('sent_message', (message: Message) => {
      console.log(message, 'message');
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('error', (error: string) => {
      toast.error(error);
    });

    return () => {
      socket.off('joined_chat');
      socket.off('updated_contact');
      socket.off('sent_message');
    };
  }, [selectedChat]);

  return (
    <div className="flex flex-col flex-1 gap-4">
      {
        selectedChat && (
          <div className="flex items-center justify-end p-2 rounded-medium">
            <Switch isSelected={switchValue} size="sm" onValueChange={handleSwitchChange}>
              Usa IA para responder
            </Switch>
          </div>
        )
      }
      <div ref={chatRef} className="flex-1 rounded-medium border-small border-divider p-6 overflow-y-auto flex flex-col gap-4">
        {
          !selectedChat ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-default-400">Selecciona un chat</span>
            </div>
          ) : (
            <>
              {
                messages.map((message) => (
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
                        max-w-[60%]
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
                      <div className="flex flex-col w-full">
                        <MessageComponent message={message} />
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
            <ChatInput selectedChat={selectedChat} />
          </div>
        )
      }
    </div>
  )
};

export default Chat;