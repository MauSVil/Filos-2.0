'use client';

import { Button } from "@/components/ui/button";
import Chat from "../../_desktop/_components/Chat";
import { useRouter } from "next/navigation";
import { useContact } from "@/app/(private)/orders/_hooks/useContact";
import { useMemo } from "react";
import { Contact } from "@/types/Chat";

interface Props {
  selectedChat: string;
}

const SelectedChatContent = (props: Props) => {
  const { selectedChat } = props;
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  }

  const contactQuery = useContact({ phone_id: selectedChat, enabled: true });
  const contact = useMemo(() => contactQuery?.data || [], [contactQuery.data]) as Contact;

  return (
    <div className="flex flex-col gap-4">
      <div className="justify-start">
        <Button onClick={handleBackClick}>
          Volver
        </Button>
      </div>
      <Chat
        loading={contactQuery.isLoading}
        selectedChat={selectedChat}
        contact={contact}
      />
    </div>
  );
};

export default SelectedChatContent;