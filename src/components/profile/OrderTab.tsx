"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { toast } from "sonner";
import { config } from "@/config";
import { useUserOrders } from "@/hooks/useOrders";
import { exchangeABI } from "@/lib/contract";
import { formatETH, relativeTime, shortenAddress } from "@/lib/utils";
import type { Order } from "@/types";

function CancelButton({ order }: { order: Order }) {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { writeContractAsync } = useWriteContract();
  const { isSuccess, isError } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Order cancelled");
      setTxHash(undefined);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      toast.error("Cancel failed");
      setTxHash(undefined);
    }
  }, [isError]);

  async function handleCancel() {
    try {
      const hash = await writeContractAsync({
        address: config.exchangeAddress,
        abi: exchangeABI,
        functionName: "cancel",
        args: [BigInt(order.salt)],
      });
      setTxHash(hash);
      toast("Cancelling order");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Cancel rejected");
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={!!txHash}
      className="rounded-md border border-[#e8e2d8] px-4 py-1.5 font-serif text-xs text-[#6b6560] transition hover:border-[#c53030] hover:text-[#c53030] disabled:opacity-40"
    >
      {txHash ? "Pending" : "Cancel"}
    </button>
  );
}

export default function OrderTab() {
  const { address } = useAccount();
  const { data, isLoading } = useUserOrders(address, 0);

  if (!address) {
    return (
      <p className="py-16 text-center font-serif text-sm text-[#c4bfb8] italic">
        Connect your wallet to view your orders.
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
        No active orders.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.orders.map((order, i) => (
        <div
          key={order.orderHash}
          className="animate-fade-up flex items-center justify-between rounded-md border border-[#e8e2d8] bg-white px-5 py-4"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-wider text-[#8c8580]">
                {order.side === 0 ? "Listing" : "Offer"}
              </span>
              <Link
                href={`/asset/${order.collection}/${order.tokenId}`}
                className="font-mono text-sm text-[#1a1a1a] transition hover:text-[#b8860b]"
              >
                #{order.tokenId.length > 12 ? shortenAddress(order.tokenId) : order.tokenId}
              </Link>
              <span className="font-mono text-xs text-[#c4bfb8]">
                {shortenAddress(order.collection)}
              </span>
            </div>
            <p className="mt-1 font-serif text-sm text-[#6b6560]">
              {formatETH(order.price)} {order.side === 0 ? "ETH" : "WETH"}
              {order.endTime > 0 ? ` expires ${relativeTime(order.endTime)}` : ""}
            </p>
          </div>
          <CancelButton order={order} />
        </div>
      ))}
    </div>
  );
}
