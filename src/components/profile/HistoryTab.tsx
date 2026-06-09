"use client";

import { useAccount } from "wagmi";

export default function HistoryTab() {
  const { address } = useAccount();

  if (!address) {
    return <p className="text-gray-500">Connect your wallet to see history.</p>;
  }

  return (
    <div className="py-12 text-center text-gray-500">
      <p>Trade history coming soon.</p>
      <p className="text-sm mt-2">
        Past fill events will appear here.
      </p>
    </div>
  );
}
