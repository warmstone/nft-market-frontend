"use client";

import { useAccount, useBalance } from "wagmi";
import { shortenAddress } from "@/lib/utils";

export default function WalletSummary() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  if (!address) return null;

  return (
    <div className="mb-10 rounded-lg border border-[#e8e2d8] bg-white p-8">
      <h2 className="font-mono text-xs uppercase tracking-wider text-[#8c8580]">
        Connected Wallet
      </h2>
      <p className="mt-2 font-mono text-sm text-[#1a1a1a]">
        {shortenAddress(address)}
      </p>
      <p className="mt-3 font-serif text-3xl font-semibold text-[#1a1a1a]">
        {balance
          ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}`
          : "—"}
      </p>
    </div>
  );
}
