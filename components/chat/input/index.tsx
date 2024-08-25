"use client";

import React from "react";
import {Icon} from "@iconify/react";

import {cn} from "@/utils/cn";

import PromptInput from "./prompt-input";
import { socket } from "@/app/(private)/chat/_socket";
import { Tooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";

type Props = {
  selectedChat: string;
  setFileManagerOpen: (value: boolean) => void;
};

export default function ChatInput(props: Props) {
  const {selectedChat, setFileManagerOpen} = props;
  const [prompt, setPrompt] = React.useState<string>("");
  const fileRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt) return;
    socket.emit('send_message', { phone_id: selectedChat, message: prompt, type: 'text' });
    socket.emit('update_contact', { phone_id: selectedChat, aiEnabled: false });
    setPrompt("");
  };

  const handleFileClick = () => {
    setFileManagerOpen(true);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      socket.emit('send_message', { phone_id: selectedChat, message: 'Imagen enviada', type: 'image', metadata: { url: base64, type: file.type }  });
      socket.emit('update_contact', { phone_id: selectedChat, aiEnabled: false });
    };
    reader.readAsDataURL(file);
  }

  const sendMessage = (event: React.KeyboardEvent<HTMLInputElement> | KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!prompt) return;
      socket.emit('send_message', { phone_id: selectedChat, message: prompt, type: 'text' });
      socket.emit('update_contact', { phone_id: selectedChat, aiEnabled: false });
      setPrompt("");
    }
  } 

  return (
    <form className="flex gap-6 w-full items-start gap-2" onSubmit={handleSubmit}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={handleFileClick}>
            <Icon className="text-default-600" icon="solar:paperclip-linear" width={20} />
            <input
              type="file"
              className="hidden"
              ref={fileRef}
              onChange={handleFileChange}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Adjuntar archivo
        </TooltipContent>
      </Tooltip>
      <PromptInput value={prompt} onValueChange={setPrompt} sendMessage={sendMessage} />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="submit"
          >
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
        <TooltipContent>
          Enviar mensaje
        </TooltipContent>
      </Tooltip>
    </form>
  );
}
