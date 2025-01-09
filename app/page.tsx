"use client";

import { Address } from "@ton/core";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [tonConnectUi] = useTonConnectUI();
  const [tonWalletAdress, setTonWalletAdress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const handleWalletConnection = useCallback((address: string) => {
    setTonWalletAdress(address);
    console.log("wallet connected");
    setIsLoading(false);
  }, []);

  const handleWalletDisconnection = useCallback(() => {
    setTonWalletAdress(null);
    console.log("wallet disconnected");
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
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUi, handleWalletConnection, handleWalletDisconnection]);

  const handleWalletAction = async () => {
    if (tonConnectUi.connected) {
      setIsLoading(true);
      await tonConnectUi.disconnect();
    } else {
      await tonConnectUi.openModal();
    }
  };

  const checkNFT = async () => {
    if (!tonWalletAdress) return;

    setIsLoading(true);

    const response = await fetch("/api/checkNFT", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: tonWalletAdress }),
    });

    const data = await response.json();

    if (data.hasNFT) {
      const inviteLink = "https://t.me/+MAwB07fDDt01MGQ6"; 
      setInviteLink(inviteLink);
    } else {
      alert("У вас нет подходящего NFT.");
    }

    setIsLoading(false);
  };

  const formatAddress = (address: string) => {
    const tempAddress = Address.parse(address).toString();
    return `${tempAddress.slice(0, 4)}...${tempAddress.slice(-4)}`;
  };

  if (isLoading)
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded">
          Завантаження...
        </div>
      </main>
    );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">kulturrra</h1>
      {tonWalletAdress ? (
        <div className="flex flex-col items-center">
          <p className="mb-4">Wallet: {formatAddress(tonWalletAdress)}</p>
          <button
            onClick={handleWalletAction}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Відключити Ton Wallet
          </button>
          <button
            onClick={checkNFT}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Перевірити NFT
          </button>
          {inviteLink && (
            <p className="mt-4">
              Ваше посилання: <a href={inviteLink}>{inviteLink}</a>
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={handleWalletAction}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Підлючити свій TON Wallet
        </button>
      )}
    </main>
  );
}