import { Key, useMemo, useRef } from "react";
import { Contact } from "../page";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";

interface ContactsProps {
  selectedChat: string;
  handleSelectionChange: (val: Set<Key> | "all") => void;
  contacts: { [key: string]: Contact };
  loading: boolean;
}

const Contacts = (props: ContactsProps) => {
  const { selectedChat, handleSelectionChange, contacts, loading } = props;

  const orderedContacts = useMemo(() => {
    return Object.values(contacts).sort((a, b) => {
      const dateA = new Date(a.lastMessageSent || 0).getTime();
      const dateB = new Date(b.lastMessageSent || 0).getTime();
      return dateB - dateA;
    });
  }, [contacts]);

  return (
    <Card x-chunk="dashboard-01-chunk-5">
      <CardContent className="flex gap-5 py-4">
        <ScrollArea className="w-full h-[550px]">
          {orderedContacts.map((contact) => {
            return (
              <div
                key={contact.phone_id}
                className="flex items-center justify-between gap-4 pb-2 cursor-pointer border-b-2 border-primary-foreground mb-2 pr-4"
                onClick={() => handleSelectionChange(new Set([contact.phone_id]))}
              >
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">{contact.fullName || contact.phone_id }</p>
                  <p className="text-xs text-muted-foreground">{contact.phone_id}</p>
                </div>
                {
                  selectedChat === contact.phone_id && (
                    <Check size={15} />
                  )
                }
              </div>
            );
          })}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default Contacts;