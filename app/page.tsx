"use client";

import Modal from "@/components/modal";
import { Address } from "@ton/core";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useCallback, useEffect, useState } from "react";


export default function Home() {
  const [tonConnectUi] = useTonConnectUI();
  const [tonWalletAddress, setTonWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const handleWalletConnection = useCallback((address: string) => {
    setTonWalletAddress(address);
    console.log("Wallet connected:", address);
    setIsLoading(false);
  }, []);

  const handleWalletDisconnection = useCallback(() => {
    setTonWalletAddress(null);
    console.log("Wallet disconnected");
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (tonConnectUi.account?.address) {
        handleWalletConnection(tonConnectUi.account.address);
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

  const checkNFT = async (address: string) => {
    if (!address) {
      setModalTitle("Помилка");
      setModalMessage("Будь ласка, підключіть свій TON Wallet.");
      setIsModalOpen(true);
      return;
    }

    setIsLoading(true);
    setInviteLink(null);

    try {
      const response = await fetch("/api/checkNFT", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.hasNFT) {
        setInviteLink("https://t.me/+MAwB07fDDt01MGQ6");
        setModalTitle("Вітаємо");
        setModalMessage("Ви маєте kulturra NFT.");
        setIsModalOpen(true);
      } else {
        setModalTitle("Помилка");
        setModalMessage("Ви не маєте kulturra NFT.");
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Ошибка при проверке NFT:", error);
      setModalTitle("Помилка");
      setModalMessage("Щось пішло не так при перевірці NFT.");
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    try {
      const tempAddress = Address.parse(address).toString();
      return `${tempAddress.slice(0, 4)}...${tempAddress.slice(-4)}`;
    } catch (error) {
      console.log(error);
      return address;
    }
  };

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setIsModalOpen(false)}
      />

      {isLoading ? (
        <main className="flex min-h-screen flex-col items-center justify-center">
          <div className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded">
            Завантаження...
          </div>
        </main>
      ) : (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
          <h1 className="text-4xl font-bold mb-8">kulturrra</h1>
          {tonWalletAddress ? (
            <div className="flex flex-col items-center w-full max-w-md">
              <p className="mb-4">Wallet: {formatAddress(tonWalletAddress)}</p>
              <button
                onClick={handleWalletAction}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full"
              >
                Відключити Ton Wallet
              </button>
              <button
                onClick={() => checkNFT(tonWalletAddress)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
              >
                Перевірити NFT
              </button>
              {inviteLink && (
                <p className="mt-4">
                  Ваше посилання:{" "}
                  <a href={inviteLink} className="text-blue-500 underline">
                    {inviteLink}
                  </a>
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={handleWalletAction}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Подключить свой TON Wallet
            </button>
          )}
        </main>
      )}
    </>
  );
}