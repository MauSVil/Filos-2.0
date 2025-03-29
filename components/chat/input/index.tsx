"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { v4 as uuidv4 } from "uuid";
import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";

import { FileManager } from "../file-manager";

import PromptInput from "./prompt-input";

import { cn } from "@/utils/cn";
import { Tooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/contexts/socketContext";

type Props = {
  selectedChat: string;
};

export default function ChatInput(props: Props) {
  const { socket, connected } = useSocket();
  const { selectedChat } = props;
  const [prompt, setPrompt] = React.useState<string>("");

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!prompt) return;
    socket.emit("send_message", {
      phone_id: selectedChat,
      message: prompt,
      type: "text",
    });
    socket.emit("update_contact", { phone_id: selectedChat, aiEnabled: false });
    setPrompt("");
  };

  const handleFileClick = async () => {
    try {
      const resp = await FileManager();

      if (!resp) return;
      const { catalogueFile, awsFile, fileFile } = resp;

      if (fileFile) {
        const reader = new FileReader();

        reader.onload = () => {
          const base64 = reader.result as string;

          socket.emit("send_message", {
            phone_id: selectedChat,
            message: "Imagen enviada",
            type: "image",
            metadata: {
              base64,
              mimeType: fileFile.type.split("/")[1],
              name: fileFile.name,
            },
          });
          socket.emit("update_contact", {
            phone_id: selectedChat,
            aiEnabled: false,
          });
        };
        reader.readAsDataURL(fileFile);
      }
      if (awsFile) {
        socket.emit("send_message", {
          phone_id: selectedChat,
          message: "Imagen enviada",
          type: "image",
          metadata: {
            url: awsFile,
            mimeType: "png",
            name: `Modelo Sueter ${uuidv4()}`,
          },
        });
        socket.emit("update_contact", {
          phone_id: selectedChat,
          aiEnabled: false,
        });
      }
      if (catalogueFile) {
        const segments = catalogueFile.split("/");
        const fileName = segments.pop();
        const word = fileName.replace(".pdf", "");

        socket.emit("send_message", {
          phone_id: selectedChat,
          message: "Imagen enviada",
          type: "pdf",
          metadata: {
            url: catalogueFile,
            mimeType: "pdf",
            name: `Catalogo ${word}`,
          },
        });
        socket.emit("update_contact", {
          phone_id: selectedChat,
          aiEnabled: false,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = (
    event: React.KeyboardEvent<HTMLInputElement> | KeyboardEvent,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!prompt) return;
      socket.emit("send_message", {
        phone_id: selectedChat,
        message: prompt,
        type: "text",
      });
      socket.emit("update_contact", {
        phone_id: selectedChat,
        aiEnabled: false,
      });
      setPrompt("");
    }
  };

  return (
    <div className="flex gap-3 flex-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={handleFileClick}>
            <Icon
              className="text-default-600"
              icon="solar:paperclip-linear"
              width={20}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Adjuntar archivo</p>
        </TooltipContent>
      </Tooltip>
      <PromptInput
        sendMessage={sendMessage}
        value={prompt}
        onValueChange={setPrompt}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button disabled={!prompt} onClick={handleSubmit}>
            <Icon
              className={cn(
                "[&>path]:stroke-[2px]",
                !prompt ? "text-default-600" : "text-primary-foreground",
              )}
              icon="solar:arrow-up-linear"
              width={20}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Enviar mensaje</TooltipContent>
      </Tooltip>
    </div>
  );
}
