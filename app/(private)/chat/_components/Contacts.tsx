import { Key, useMemo, useRef } from "react";
import { Contact } from "../page";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContactsProps {
  selectedChat: string;
  handleSelectionChange: (val: Set<Key> | "all") => void;
  contacts: { [key: string]: Contact };
  loading: boolean;
}

const Contacts = (props: ContactsProps) => {
  const { selectedChat, handleSelectionChange, contacts, loading } = props;

  return (
    <Card x-chunk="dashboard-01-chunk-5">
      <CardContent className="flex gap-5 py-4">
        <ScrollArea className="w-full h-[550px]">
          {Object.keys(contacts).map((key) => {
            const contact = contacts[key];
            return (
              <div
                key={key}
                className="flex items-center gap-4 pb-2 cursor-pointer border-b-2 border-primary-foreground mb-2"
              >
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">{contact.fullName}</p>
                  <p className="text-sm text-muted-foreground">{contact.phone_id}</p>
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default Contacts;