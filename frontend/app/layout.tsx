import type { Metadata } from "next";
import "./globals.css";
import { PopupAvisos } from "./_components/popup-avisos";
import { VisitTracker } from "./_components/visit-tracker";
import { NotificationPermission } from "./_components/notification-permission";

export const metadata: Metadata = {
  title: "IDAM Intranet",
  description: "Intranet corporativa do IDAM Amazonas",
};

// Estrutura HTML comum a todas as páginas do frontend.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <VisitTracker />
        <PopupAvisos />
        <NotificationPermission />
      </body>
    </html>
  );
}
