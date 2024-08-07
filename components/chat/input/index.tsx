"use client";

import React from "react";
import {Button, Tooltip} from "@nextui-org/react";
import {Icon} from "@iconify/react";

import {cn} from "@/utils/cn";

import PromptInput from "./prompt-input";
import { socket } from "@/app/(private)/chat/_socket";

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

  return (
    <form className="flex w-full items-start gap-2" onSubmit={handleSubmit}>
      <Tooltip showArrow content="Agregar archivo">
        <Button isIconOnly radius="lg" variant="flat" onClick={handleFileClick}>
          <Icon className="text-default-600" icon="solar:paperclip-linear" width={20} />
          <input
            type="file"
            className="hidden"
            ref={fileRef}
            onChange={handleFileChange}
          />
        </Button>
      </Tooltip>
      <PromptInput value={prompt} onValueChange={setPrompt} />
      {!prompt && (
        <Tooltip showArrow content="Speak">
          <Button isIconOnly variant="flat">
            <Icon className="text-default-600" icon="solar:microphone-3-linear" width={20} />
          </Button>
        </Tooltip>
      )}
      <Tooltip showArrow content="Send message">
        <Button
          isIconOnly
          color={!prompt ? "default" : "primary"}
          isDisabled={!prompt}
          radius="lg"
          variant={!prompt ? "flat" : "solid"}
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
      </Tooltip>
    </form>
  );
}
