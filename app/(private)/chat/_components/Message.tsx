import moment from "moment";
import { Message } from "../page";
import { Image } from "@nextui-org/react";

const MessageComponent = ({ message }: { message: Message }) => {
  switch (message.type) {
    case 'text':
      return (
        <>
          <span className="text-small">{message.message}</span>
          <span className={`text-tiny text-white text-right`}>
            {moment(message.timestamp).format("HH:mm")}
          </span>
        </>
      );
    case 'image':
      return (
        <Image
          width={150}
          className="rounded-medium"
          src={message.metadata.url}
          alt="image"
        />
      );
    default:
      return (
        <>
          <span className="text-small">No se pudo procesar este mensaje</span>
          <span className={`text-tiny text-white text-right`}>
            {moment(message.timestamp).format("HH:mm")}
          </span>
        </>
      )
  }
};

export default MessageComponent;