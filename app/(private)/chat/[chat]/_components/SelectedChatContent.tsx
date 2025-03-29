"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import Chat from "../../_desktop/_components/Chat";

import { Button } from "@/components/ui/button";
import { useContact } from "@/app/(private)/orders/_hooks/useContact";
import { Contact } from "@/types/Chat";

interface Props {
  selectedChat: string;
}

const SelectedChatContent = (props: Props) => {
  const { selectedChat } = props;
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const contactQuery = useContact({ phone_id: selectedChat, enabled: true });
  const contact = useMemo(
    () => contactQuery?.data || [],
    [contactQuery.data],
  ) as Contact;

  return (
    <div className="flex flex-col gap-4">
      <div className="justify-start">
        <Button onClick={handleBackClick}>Volver</Button>
      </div>
      <Chat
        contact={contact}
        loading={contactQuery.isLoading}
        selectedChat={selectedChat}
      />
    </div>
  );
};

export default SelectedChatContent;
