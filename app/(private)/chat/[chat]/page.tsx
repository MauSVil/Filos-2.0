import SelectedChatContent from "./_components/SelectedChatContent";

interface Props {
  params: {
    chat: string;
  }
}

const SelectedChatPage = ({ params }: Props) => {
  const { chat } = params;
  return <SelectedChatContent selectedChat={chat} />;
}

export default SelectedChatPage;