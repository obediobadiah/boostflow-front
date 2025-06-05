import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "BoostFlow | Business & Product Promotion App",
  description: "Promote products, automatically post on social media, and track commissions.",
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'icon', url: '/logo/Boost_Flow_App.png', type: 'image/png', sizes: '512x512' },
    { rel: 'apple-touch-icon', url: '/logo/Boost_Flow_App.png' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Force favicon refresh by adding a version query parameter */}
        <link rel="icon" href="/favicon.ico?v=2" />
        <link rel="icon" href="/logo/Boost_Flow_App.png?v=2" type="image/png" />
        <link rel="apple-touch-icon" href="/logo/Boost_Flow_App.png?v=2" />
      </head>
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
