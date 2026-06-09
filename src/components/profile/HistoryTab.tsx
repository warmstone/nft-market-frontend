"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useUserOrders } from "@/hooks/useOrders";
import { formatETH, shortenAddress } from "@/lib/utils";

export default function HistoryTab() {
  const { address } = useAccount();
  const { data, isLoading } = useUserOrders(address, 1);

  if (!address) {
    return (
      <p className="py-16 text-center font-serif text-sm text-[#c4bfb8] italic">
        Connect your wallet to view your history.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-md border border-[#e8e2d8] bg-white"
          />
        ))}
      </div>
    );
  }

  if (!data?.orders.length) {
    return (
      <p className="py-16 text-center font-serif text-sm text-[#c4bfb8] italic">
        No completed trades yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.orders.map((order) => (
        <Link
          key={order.orderHash}
          href={`/asset/${order.collection}/${order.tokenId}`}
          className="flex items-center justify-between rounded-md border border-[#e8e2d8] bg-white px-5 py-4 transition hover:border-[#b8860b]"
        >
          <div>
            <p className="font-mono text-sm text-[#1a1a1a]">
              #{order.tokenId.length > 12 ? shortenAddress(order.tokenId) : order.tokenId}
            </p>
            <p className="mt-1 font-serif text-xs text-[#8c8580]">
              {shortenAddress(order.collection)}
            </p>
          </div>
          <p className="font-mono text-sm font-medium text-[#1a1a1a]">
            {formatETH(order.price)} {order.side === 0 ? "ETH" : "WETH"}
          </p>
        </Link>
      ))}
    </div>
  );
}
