import moment from "moment";
import { Message } from "../page";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const MessageComponent = ({ message, scrollToBottom }: { message: Message, scrollToBottom: () => void }) => {
  switch (message.type) {
    case 'text':
      return (
        <>
          <span className="text-small ">{message.message}</span>
          <span className={`text-xs text-white text-right`}>
            {moment(message.timestamp).format("HH:mm")}
          </span>
        </>
      );
    case 'image':
      return (
        <Image
          width={150}
          height={150}
          className="rounded-medium"
          src={message.metadata.url}
          alt="image"
          onLoad={scrollToBottom}
        />
      );
    case 'pdf':
      return (
        <div className="flex flex-col gap-1">
          <span className="text-small">
            Se envio satisfactoriamente el PDF
          </span>
          <Button
            size="sm"
            onClick={() => window.open(message.metadata.url, '_blank')}
          >
            Ver PDF
          </Button>
        </div>
      )
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