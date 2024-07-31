import ChatInput from "@/components/chat/input";
import { UseQueryResult } from "@tanstack/react-query";
import moment from "moment";
import { useEffect, useRef } from "react";
import { Message, SerializedError } from "../page";
import { CircularProgress, Switch } from "@nextui-org/react";

type Props = {
  selectedChat: string;
  messagesQuery: UseQueryResult<Message[], SerializedError>;
};

const Chat = (props: Props) => {
  const { selectedChat, messagesQuery } = props;
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat, messagesQuery.data]);

  if (messagesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full flex items-center justify-end border-small border-divider p-2 rounded-medium">
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 gap-4">
      {
        selectedChat && (
          <div className="flex items-center justify-end p-2 rounded-medium">
            <Switch defaultSelected size="sm">
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
            <ChatInput selectedChat={selectedChat} />
          </div>
        )
      }
    </div>
  )
};

export default Chat;