"use client";

import { Key, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { useRouter } from "next/navigation";

import Contacts from "../_desktop/_components/Contacts";

import { useSocket } from "@/contexts/socketContext";
import { Contact } from "@/types/Chat";

const MobileContent = () => {
  const { socket, connected } = useSocket();
  const [loading, setLoading] = useState<boolean>(true);
  const [contacts, setContacts] = useState<{ [key: string]: Contact }>({});
  const [value, setValue] = useState<string>("");
  const [filterOption, setFilterOption] = useState<string>("");

  const router = useRouter();

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

  const handleSelectionChange = (val: Set<Key> | "all") => {
    if (val === "all") return;
    const myValue = [...val][0];
    const myValueString = myValue.toString();

    router.push(`/chat/${myValueString}`);
    // setSelectedChat((prevState) => {
    //   socket.emit('leave_chat', { phone_id: prevState});
    //   return myValueString;
    // });
  };

  return (
    <Contacts
      contacts={keyedContacts}
      handleSelectionChange={handleSelectionChange}
      loading={loading}
      selectedChat={""}
    />
  );
};

export default MobileContent;
