import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HeaderMenu from '../components/HeaderMenu';
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from '@/contexts/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brown Dust 2 Wiki",
  description: "Brown Dust 2 Wiki",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <HeaderMenu />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
