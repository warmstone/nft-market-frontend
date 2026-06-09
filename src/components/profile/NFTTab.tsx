"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useUserOrders } from "@/hooks/useOrders";
import { formatETH, shortenAddress } from "@/lib/utils";

export default function NFTTab() {
  const { address } = useAccount();
  const { data, isLoading } = useUserOrders(address, 0);

  if (!address) {
    return (
      <p className="py-16 text-center font-serif text-sm text-[#c4bfb8] italic">
        Connect your wallet to view your market works.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-md border border-[#e8e2d8] bg-white"
          />
        ))}
      </div>
    );
  }

  const orders = data?.orders ?? [];
  if (orders.length === 0) {
    return (
      <p className="py-16 text-center font-serif text-sm text-[#c4bfb8] italic">
        No works are currently active in the market.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {orders.map((order) => (
        <Link
          key={order.orderHash}
          href={`/asset/${order.collection}/${order.tokenId}`}
          className="rounded-md border border-[#e8e2d8] bg-white p-5 transition hover:border-[#b8860b]"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-[#8c8580]">
                {order.side === 0 ? "Listing" : "Offer"}
              </p>
              <p className="mt-2 font-serif text-lg font-semibold text-[#1a1a1a]">
                #{order.tokenId.length > 12 ? shortenAddress(order.tokenId) : order.tokenId}
              </p>
              <p className="mt-1 font-mono text-xs text-[#8c8580]">
                {shortenAddress(order.collection)}
              </p>
            </div>
            <p className="font-mono text-sm font-medium text-[#1a1a1a]">
              {formatETH(order.price)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
