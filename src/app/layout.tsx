import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "TaskFlow | Týmová správa projektů a úkolů",
  description: "Moderní MVP aplikace pro správu projektů, Kanban board a časovou osu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className="h-full bg-slate-50 text-slate-900">
      <body className="min-h-full flex flex-col font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
