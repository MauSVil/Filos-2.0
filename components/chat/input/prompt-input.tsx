"use client";


import React from "react";

import { Textarea, TextareaProps } from "@/components/ui/textarea";

interface PromptInputProps extends TextareaProps {
  sendMessage: (
    event: React.KeyboardEvent<HTMLInputElement> | KeyboardEvent,
  ) => void;
  onValueChange?: (value: string) => void;
  value?: string;
}

const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(
  ({ sendMessage, onValueChange, ...props }, ref) => {
    // const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    //   if (event.key === "Enter") {
    //     sendMessage();
    //   }
    // };

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onValueChange?.(event.target.value);
    };

    return (
      <Textarea
        ref={ref}
        aria-label="Prompt"
        className="border-none bg-transparent w-full"
        cols={1}
        placeholder="Escriba un mensaje..."
        rows={1}
        onChange={handleChange}
        value={props.value}
        // onKeyDown={handleKeyDown}
      />
    );
  },
);

export default PromptInput;

PromptInput.displayName = "PromptInput";
