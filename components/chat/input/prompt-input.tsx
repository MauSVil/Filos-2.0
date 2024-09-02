"use client";

import type {TextAreaProps} from "@nextui-org/react";

import React from "react";

import { Textarea } from "@/components/ui/textarea";

interface PromptInputProps extends TextAreaProps {
  sendMessage: (event: React.KeyboardEvent<HTMLInputElement> | KeyboardEvent) => void;
  onValueChange?: (value: string) => void;
  value?: string;
}

const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(
  ({classNames = {}, sendMessage, onValueChange, ...props}, ref) => {
    // const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    //   if (event.key === "Enter") {
    //     sendMessage();
    //   }
    // };

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onValueChange?.(event.target.value)
    }

    return (
      <Textarea
        cols={1}
        rows={1}
        ref={ref}
        aria-label="Prompt"
        placeholder="Escriba un mensaje..."
        className="border-none bg-transparent w-full"
        onChange={handleChange}
        value={props.value}
        // onKeyDown={handleKeyDown}
      />
    );
  },
);

export default PromptInput;

PromptInput.displayName = "PromptInput";
