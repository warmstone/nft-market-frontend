"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import WalletSummary from "@/components/profile/WalletSummary";
import OrderTab from "@/components/profile/OrderTab";
import NFTTab from "@/components/profile/NFTTab";
import HistoryTab from "@/components/profile/HistoryTab";

const TABS = ["Active Orders", "Collection", "History"] as const;

export default function ProfilePage() {
  const { isConnected } = useAccount();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Active Orders");

  if (!isConnected) {
    return (
      <div className="py-32 text-center">
        <h1 className="font-serif text-4xl font-semibold italic text-[#1a1a1a]">
          Profile
        </h1>
        <p className="mt-4 font-serif text-base text-[#c4bfb8]">
          Connect your wallet to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 font-serif text-4xl font-semibold italic text-[#1a1a1a]">
        Profile
      </h1>
      <WalletSummary />

      <div className="mb-8 flex gap-1 rounded-md border border-[#e8e2d8] bg-[#f5efe4] p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-sm px-4 py-2.5 font-serif text-sm transition ${
              tab === t
                ? "bg-white text-[#1a1a1a] shadow-sm"
                : "text-[#8c8580] hover:text-[#1a1a1a]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Active Orders" && <OrderTab />}
      {tab === "Collection" && <NFTTab />}
      {tab === "History" && <HistoryTab />}
    </div>
  );
}
