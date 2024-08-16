"use client";

import type {TextAreaProps} from "@nextui-org/react";

import React from "react";
import {Textarea} from "@nextui-org/react";

import {cn} from "@/utils/cn";

interface PromptInputProps extends TextAreaProps {
  sendMessage: (event: React.KeyboardEvent<HTMLInputElement> | KeyboardEvent) => void;
}

const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(
  ({classNames = {}, sendMessage, ...props}, ref) => {
    return (
      <Textarea
        ref={ref}
        onKeyDown={sendMessage}
        aria-label="Prompt"
        className="min-h-[40px]"
        classNames={{
          ...classNames,
          label: cn("hidden", classNames?.label),
          input: cn("py-0", classNames?.input),
        }}
        minRows={1}
        placeholder="Escriba un mensaje..."
        radius="lg"
        variant="bordered"
        {...props}
      />
    );
  },
);

export default PromptInput;

PromptInput.displayName = "PromptInput";
