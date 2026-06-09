"use client";

import { useAccount } from "wagmi";

export default function HistoryTab() {
  const { address } = useAccount();

  if (!address) {
    return (
      <p className="py-16 text-center font-serif text-sm text-[#c4bfb8] italic">
        Connect your wallet to view your history.
      </p>
    );
  }

  return (
    <div className="py-20 text-center">
      <p className="font-serif text-base text-[#c4bfb8] italic">
        Trade history coming soon.
      </p>
      <p className="mt-2 font-serif text-sm text-[#c4bfb8]">
        Past acquisitions and sales will appear here.
      </p>
    </div>
  );
}
