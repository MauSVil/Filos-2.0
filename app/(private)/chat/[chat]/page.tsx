'use client';

import SelectedChatContent from "./_components/SelectedChatContent";

type Props = {
  params: Promise<{ chat: string }>;
};

export default async function SelectedChatPage({ params }: Props) {
  const { chat } = await params;
  return <SelectedChatContent selectedChat={chat} />;
}