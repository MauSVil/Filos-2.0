"use client";

import React from "react";
import {Button, Tooltip} from "@nextui-org/react";
import {Icon} from "@iconify/react";

import {cn} from "@/utils/cn";

import PromptInput from "./prompt-input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInput } from "@/types/RepositoryTypes/Message";
import ky from "ky";
import { toast } from "react-toastify";

type Props = {
  selectedChat: string;
};

export default function ChatInput(props: Props) {
  const queryClient = useQueryClient();
  const {selectedChat} = props;
  const [prompt, setPrompt] = React.useState<string>("");

  const queryKey = ['messages', selectedChat];

  const mutation = useMutation({
    mutationFn: async (data: Partial<MessageInput>) => {
      await ky.post("/api/messages", {json: {
        ...data,
        phone_id: selectedChat,
      } as MessageInput});
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success("Message sent");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Error sending message");
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt) return;
    mutation.mutate({ message: prompt });
    setPrompt("");
  };

  return (
    <form className="flex w-full items-start gap-2" onSubmit={handleSubmit}>
      <Tooltip showArrow content="Add file">
        <Button isIconOnly radius="lg" variant="flat">
          <Icon className="text-default-600" icon="solar:paperclip-linear" width={20} />
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
