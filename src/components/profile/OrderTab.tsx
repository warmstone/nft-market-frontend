"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { useUserOrders } from "@/hooks/useOrders";
import { formatETH, shortenAddress, relativeTime } from "@/lib/utils";
import { exchangeABI } from "@/lib/contract";
import { config } from "@/config";
import type { Order } from "@/types";
import { useState, useEffect } from "react";

function CancelButton({ order }: { order: Order }) {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { writeContractAsync } = useWriteContract();
  const { isSuccess, isError } = useWaitForTransactionReceipt({
    hash: txHash,
  });

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
      toast.loading("Cancelling...");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Cancel rejected");
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={!!txHash}
      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700 disabled:opacity-50"
    >
      {txHash ? "Pending..." : "Cancel"}
    </button>
  );
}

export default function OrderTab() {
  const { address } = useAccount();
  const { data, isLoading } = useUserOrders(address, 0); // Active only

  if (!address) {
    return <p className="text-gray-500">Connect your wallet to see orders.</p>;
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-900" />
        ))}
      </div>
    );
  }

  if (!data?.orders.length) {
    return <p className="text-gray-500 py-8 text-center">No active orders.</p>;
  }

  return (
    <div className="space-y-3">
      {data.orders.map((order) => (
        <div
          key={order.orderHash}
          className="flex items-center justify-between rounded-lg bg-gray-900 p-4 ring-1 ring-gray-800"
        >
          <div>
            <p className="text-sm font-medium text-white">
              {order.side === 0 ? "Sell" : "Buy"} · #
              {order.tokenId.length > 12
                ? shortenAddress(order.tokenId)
                : order.tokenId}
            </p>
            <p className="text-xs text-gray-500">
              {formatETH(order.price)} ETH
              {order.endTime > 0 && ` · Expires ${relativeTime(order.endTime)}`}
            </p>
          </div>
          <CancelButton order={order} />
        </div>
      ))}
    </div>
  );
}
