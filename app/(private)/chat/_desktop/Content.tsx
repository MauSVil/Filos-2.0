"use client";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Key, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { ListFilter } from "lucide-react";

import Contacts from "./_components/Contacts";
import Chat from "./_components/Chat";

import { Input } from "@/components/ui/input";
import { useSocket } from "@/contexts/socketContext";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Contact } from "@/types/Chat";

const DesktopContent = () => {
  const [filterOption, setFilterOption] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [value, setValue] = useState<string>("");
  const [selectedChat, setSelectedChat] = useState<string>("");
  const [contacts, setContacts] = useState<{ [key: string]: Contact }>({});
  const queryClient = new QueryClient();

  const { socket, connected } = useSocket();

  const handleSelectionChange = (val: Set<Key> | "all") => {
    if (val === "all") return;
    const myValue = [...val][0];
    const myValueString = myValue.toString();

    setSelectedChat((prevState) => {
      socket.emit("leave_chat", { phone_id: prevState });

      return myValueString;
    });
  };

  const keyedContacts = useMemo(() => {
    const contactsFiltered = Object.values(contacts)
      .filter((contact) => {
        return (
          (contact?.fullName?.toLowerCase() || "").includes(
            value.toLowerCase(),
          ) ||
          (contact?.phone_id?.toLowerCase() || "").includes(value.toLowerCase())
        );
      })
      .filter((contact) => {
        if (filterOption === "IA") {
          return contact.aiEnabled;
        } else if (filterOption === "noIA") {
          return !contact.aiEnabled;
        } else {
          return true;
        }
      });

    return _.keyBy(contactsFiltered, "phone_id");
  }, [contacts, value, filterOption]);

  useEffect(() => {
    if (!connected) return;

    socket.emit("contacts");

    socket.on("contacts", (contacts: Contact[]) => {
      setContacts(_.keyBy(contacts, "phone_id"));
      setLoading(false);
    });

    socket.on("new_contact", (contact: Contact) => {
      setContacts((prevState) => {
        return { ...prevState, [contact.phone_id]: contact };
      });
    });

    socket.on("list_contact_update", (contact: Contact) => {
      setContacts((prevState) => {
        return { ...prevState, [contact.phone_id]: contact };
      });
    });

    return () => {
      socket.off("contacts");
      socket.off("new_contact");
      socket.off("list_contact_update");
    };
  }, [socket, connected]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="grid h-full items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 grid-cols-1 lg:grid-cols-[1fr_2fr] xl:grid-cols-[1fr_2fr]">
        <div className="flex h-full flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Busca un contacto..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="h-7 gap-1 text-sm"
                  size="sm"
                  variant="outline"
                >
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">Filtrar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filrar por:</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={"" === filterOption}
                  onCheckedChange={() => setFilterOption("")}
                >
                  Todos
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={"IA" === filterOption}
                  onCheckedChange={() => setFilterOption("IA")}
                >
                  Con IA
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={"noIA" === filterOption}
                  onCheckedChange={() => setFilterOption("noIA")}
                >
                  Sin IA
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Contacts
            contacts={keyedContacts}
            handleSelectionChange={handleSelectionChange}
            loading={loading}
            selectedChat={selectedChat}
          />
        </div>
        <Chat
          contact={keyedContacts[selectedChat]}
          selectedChat={selectedChat}
        />
      </div>
    </HydrationBoundary>
  );
};

export default DesktopContent;
