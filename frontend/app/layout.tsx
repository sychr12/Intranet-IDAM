import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

// Fonte carregada pelo Next.js e exposta ao tema global por variável CSS.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

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
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
