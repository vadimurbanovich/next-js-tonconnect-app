"use client"

import "./globals.css";
import dynamic from 'next/dynamic';

const TonConnectUIProviderNoSSR = dynamic(
  () => import('@tonconnect/ui-react').then((mod) => mod.TonConnectUIProvider),
  { ssr: false }
);


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Wallet Ton Connect</title>
      </head>
      <body
      >
        <TonConnectUIProviderNoSSR manifestUrl="https://lime-faithful-rabbit-214.mypinata.cloud/files/bafkreidhitkfq65m65kn4xxzfvc7cshzk3wef4kvfcajuhujxehauavi4m?X-Algorithm=PINATA1&X-Date=1736353567&X-Expires=30&X-Method=GET&X-Signature=e85b426441ad85af2ddce8302ce5c0bba1ecd0fb434ef11d2e73ea0baa660292">
          {children}
        </TonConnectUIProviderNoSSR>
      </body>
    </html>
  );
}
