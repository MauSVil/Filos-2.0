"use client";

import type {TextAreaProps} from "@nextui-org/react";

import React from "react";

import {cn} from "@/utils/cn";
import { Textarea } from "@/components/ui/textarea";

interface PromptInputProps extends TextAreaProps {
  sendMessage: (event: React.KeyboardEvent<HTMLInputElement> | KeyboardEvent) => void;
  onValueChange?: (value: string) => void;
  value?: string;
}

const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(
  ({classNames = {}, sendMessage, ...props}, ref) => {
    return (
      <Textarea
        cols={1}
        rows={1}
        ref={ref}
        aria-label="Prompt"
        placeholder="Escriba un mensaje..."
        className="border-none bg-transparent w-full"
        onChange={(e) => props.onValueChange?.(e.target.value)}
        value={props.value}
      />
    );
  },
);

export default PromptInput;

PromptInput.displayName = "PromptInput";
