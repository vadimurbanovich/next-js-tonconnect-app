import { NextApiRequest, NextApiResponse } from "next";
import NFTChecker from "@/lib/nftChecker";

const nftChecker = new NFTChecker();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ message: "Wallet address is required" });
  }

  try {
    const hasNFT = await nftChecker.checkNFT(walletAddress);

    return res.status(200).json({ hasNFT });
  } catch (error) {
    console.error("Error checking NFT:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
