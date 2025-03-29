import { headers } from "next/headers";

import DesktopContent from "./_desktop/Content";
import MobileContent from "./_mobile/Content";

import { isMobileDevice } from "@/lib/utils";

const ChatPage = async () => {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const isMobile = isMobileDevice(userAgent);

  if (isMobile) {
    return <MobileContent />;
  }

  return <DesktopContent />;
};

export default ChatPage;
