"use client";

import { useAccount, useBalance } from "wagmi";
import { formatETH, shortenAddress } from "@/lib/utils";

export default function WalletSummary() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  if (!address) return null;

  return (
    <div className="mb-8 rounded-xl bg-gray-900 p-6 ring-1 ring-gray-800">
      <h2 className="text-sm text-gray-500 mb-1">Connected Wallet</h2>
      <p className="text-lg font-mono text-white">{shortenAddress(address)}</p>
      <p className="mt-2 text-2xl font-bold text-white">
        {balance ? `${formatETH(balance.value.toString())} ${balance.symbol}` : "—"}
      </p>
    </div>
  );
}
