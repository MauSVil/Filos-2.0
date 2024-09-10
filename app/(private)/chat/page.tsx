import { headers } from "next/headers"
import DesktopContent from "./_desktop/Content"
import { isMobileDevice } from "@/lib/utils";
import MobileContent from "./_mobile/Content";

const ChatPage = () => {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = isMobileDevice(userAgent);

  if (isMobile) {
    return (
      <MobileContent />
    )
  }

  return (
    <DesktopContent />
  )
}

export default ChatPage