"use client";

import { useAccount } from "wagmi";

export default function NFTTab() {
  const { address } = useAccount();

  if (!address) {
    return <p className="text-gray-500">Connect your wallet to see NFTs.</p>;
  }

  return (
    <div className="py-12 text-center text-gray-500">
      <p>NFT browsing coming soon.</p>
      <p className="text-sm mt-2">
        Use the search bar or collection pages to find your NFTs.
      </p>
    </div>
  );
}
