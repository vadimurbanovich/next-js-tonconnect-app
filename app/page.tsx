"use client";

import { Address } from "@ton/core";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [ tonConnectUi ] = useTonConnectUI();
  const [ tonWalletAdress, setTonWalletAdress ] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true)

  const handleWalletConnection = useCallback((adress: string) => {
    setTonWalletAdress(adress);
    console.log('wallet connected');
    setIsLoading(false);
  }, []);

  const handleWalletDisconnection = useCallback(() => {
    setTonWalletAdress(null);
    console.log('wallet disconnected');
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (tonConnectUi.account?.address) {
        handleWalletConnection(tonConnectUi.account?.address);
      } else {
        handleWalletDisconnection();
      }
    };

    checkWalletConnection();

    const unsubscribe = tonConnectUi.onStatusChange((wallet) => {
      if (wallet) {
        handleWalletConnection(wallet.account.address);
      } else {
        handleWalletDisconnection();
      }
    })

    return () => {
      unsubscribe();
    }

  }, [tonConnectUi, handleWalletConnection, handleWalletDisconnection]);

  const handleWalletAction = async () => {
    if(tonConnectUi.connected) {
      setIsLoading(true);
      await tonConnectUi.disconnect();
    } else {
      await tonConnectUi.openModal();
    }
  }

  const formatAdress = (adress: string) => {
    const tempAdress = Address.parse(adress).toString();
    return `${tempAdress.slice(0,4)}...${tempAdress.slice(-4)}`
  }

  if (isLoading) return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded">
        Loading...
      </div>
    </main>
  )
  return (
      <main className="flex min-h-screen flex-col items-center justify-center">
    <h1 className="text-4xl font-bold mb-8">TON Connect Demo</h1>
    {tonWalletAdress ? (
      <div className="flex flex-col items-center">
        <p className="mb-4">Connected: {formatAdress(tonWalletAdress)}</p>
        <button
          onClick={handleWalletAction}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Disconnect Wallet
        </button>
      </div>
    ) : (
      <button
        onClick={handleWalletAction}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Connect TON Wallet
      </button>
    )}
  </main>
  );
}
