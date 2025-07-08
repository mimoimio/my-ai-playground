import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChatLayout } from "@/components/ChatLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Chat",
  description: "AI Chat application with PocketBase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-[100dvh]">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-[100dvh]`}
      >
        <ChatLayout>
          {children}
        </ChatLayout>
      </body>
    </html>
  );
}
