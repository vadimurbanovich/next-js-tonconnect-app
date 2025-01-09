"use client"

import { TonConnectUIProvider } from "@tonconnect/ui-react";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>kulturrra NFT-Gate</title>
      </head>
      <body
      >
        <TonConnectUIProvider manifestUrl="https://popytka.vercel.app/">
          {children}
        </TonConnectUIProvider>
      </body>
    </html>
  );
}
