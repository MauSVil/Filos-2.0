import { Metadata } from "next";
import SettingsContent from "./_components/Content";

export const metadata: Metadata = {
  title: "Configuración",
  description: "Settings page",
};

const SettingsPage = () => {
  return <SettingsContent />;
};

export default SettingsPage;
