import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import { PWAProvider } from "@/components/pwa-provider";
import { AuthProvider } from "@/components/providers/auth-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DLOD - Day Labor On Demand",
  description: "Connect with day laborers and contractors instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b5cf6" />
      </head>
      <body
        className={`${inter.variable} antialiased bg-background text-foreground`}
      >
        <PWAProvider>
          <AuthProvider>
            <Header />
            <div className="pt-16">
              {children}
            </div>
          </AuthProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
