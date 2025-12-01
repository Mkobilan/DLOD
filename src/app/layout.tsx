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
  title: "DLOD - Day Labor On Demand | Construction Staffing & Gig Work",
  description: "Connect with skilled day laborers and contractors instantly. Find temporary construction jobs or hire workers for your project today.",
  keywords: [
    "Day Labor",
    "Construction Staffing",
    "Hire Contractors",
    "Temporary Workers",
    "Gig Economy",
    "General Labor",
    "Skilled Trades",
    "Daily Pay",
    "On-Demand Staffing",
    "Local Contractors"
  ],
  verification: {
    google: "wnwX0v0OGT7E25CuYA6r3_NjExggVU9PFITJXnpMp8U",
  },
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
