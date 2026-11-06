import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { InstallPwaBanner } from "@/components/pwa/InstallPwaBanner";

export const viewport: Viewport = {
  themeColor: "#124E66",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "TaskFlow | Týmová správa a Rozvrh",
  description: "Moderní aplikace pro správu projektů, Kanban board, studijní rozvrh a Vánoční nákupní centrum",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TaskFlow",
  },
  icons: {
    icon: [
      { url: "/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className="h-full bg-[#212A31] text-[#D3D9D4]">
      <body className="min-h-full flex flex-col font-sans antialiased bg-[#212A31] text-[#D3D9D4] selection:bg-[#124E66] selection:text-white pb-16 md:pb-0">
        <AuthProvider>
          <PwaRegister />
          {children}
          <InstallPwaBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
