import { Key, useMemo, useRef } from "react";
import { Contact } from "../page";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import moment from "moment";
import { cn } from "@/utils/cn";

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
        <ScrollArea className="w-full h-[500px] lg:h-[650px]">
          {orderedContacts.map((contact) => {
            if (contact.phone_id === "5535209307") {
              console.log(contact, "contactttttt");
            }
            return (
              <div
                key={contact.phone_id}
                className="relative flex items-center justify-between gap-4 p-2 cursor-pointer border-b-2 border-primary-foreground mb-2 pr-4 hover:bg-primary/10 rounded-medium"
                onClick={() => handleSelectionChange(new Set([contact.phone_id]))}
              >
                <div className="w-3 overflow-hidden inline-block absolute bottom-0 right-0">
                  <div className={cn("h-5 rotate-45 transform origin-bottom-left", {
                    "bg-red-400": contact.type === "wholesale",
                    "bg-blue-400": contact.type === "retail",
                  })} />
                </div>
                {/* <div className="absolute h-3 w-3 bottom-0 right-0 rotate-45 transform origin-bottom-left bg-red-400" /> */}
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">{contact.fullName || contact.phone_id }</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {moment(contact.lastMessageSent).fromNow()}
                  </p>
                  <div className="flex items-center gap-1 mb-2">
                    {
                      contact.newMessage && (
                        <Badge variant={"new"}>Nuevo</Badge>
                      )
                    }
                    {
                      contact.aiEnabled && (
                        <Badge variant={"IA"}>IA</Badge>
                      )
                    }
                  </div>
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