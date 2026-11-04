import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "TaskFlow | Týmová správa a Vánoční organizér",
  description: "Moderní aplikace pro správu projektů, Kanban board a Vánoční nákupní centrum",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className="h-full bg-[#212A31] text-[#D3D9D4]">
      <body className="min-h-full flex flex-col font-sans antialiased bg-[#212A31] text-[#D3D9D4] selection:bg-[#124E66] selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
