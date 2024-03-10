import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import "./globals.css";

import Providers from "@/app/providers";

const orbi = Orbitron({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Esport Game",
  description: "Esport game of Danny",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={orbi.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
