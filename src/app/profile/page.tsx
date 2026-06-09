"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import WalletSummary from "@/components/profile/WalletSummary";
import OrderTab from "@/components/profile/OrderTab";
import NFTTab from "@/components/profile/NFTTab";
import HistoryTab from "@/components/profile/HistoryTab";

const TABS = ["Active Orders", "My NFTs", "History"] as const;

export default function ProfilePage() {
  const { isConnected } = useAccount();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Active Orders");

  if (!isConnected) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Profile</h1>
        <p className="text-gray-500">Connect your wallet to view your profile.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Profile</h1>
      <WalletSummary />

      <div className="mb-6 flex gap-1 rounded-lg bg-gray-900 p-1 ring-1 ring-gray-800">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${
              tab === t
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Active Orders" && <OrderTab />}
      {tab === "My NFTs" && <NFTTab />}
      {tab === "History" && <HistoryTab />}
    </div>
  );
}
