"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { toast } from "sonner";
import { useOrders } from "@/hooks/useOrders";
import { exchangeABI } from "@/lib/contract";
import { config } from "@/config";
import { shortenAddress } from "@/lib/utils";
import type { Order } from "@/types";

interface Props {
  collection: string;
  tokenId: string;
}

function OrderRow({
  order,
  label,
  actionLabel,
  onAction,
  isPending,
}: {
  order: Order;
  label: string;
  actionLabel: string;
  onAction: () => void;
  isPending: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-[#e8e2d8] bg-white px-5 py-4">
      <div>
        <p className="font-mono text-base font-medium text-[#1a1a1a]">
          {order.price} {label}
        </p>
        <p className="mt-0.5 font-serif text-xs text-[#8c8580]">
          {shortenAddress(order.maker)}
        </p>
      </div>
      <button
        onClick={onAction}
        disabled={isPending}
        className="rounded-md bg-[#1a1a1a] px-5 py-2 font-serif text-sm text-[#faf7f2] transition hover:bg-[#3d3d3d] disabled:opacity-40"
      >
        {isPending ? "Pending…" : actionLabel}
      </button>
    </div>
  );
}

export default function OrderPanel({ collection, tokenId }: Props) {
  const { address } = useAccount();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { data: sellOrders } = useOrders({
    collection,
    tokenId,
    side: 0,
    status: 0,
    pageSize: 10,
  });
  const { data: buyOrders } = useOrders({
    collection,
    tokenId,
    side: 1,
    status: 0,
    pageSize: 10,
  });

  const { writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError } =
    useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Transaction confirmed");
      setTxHash(undefined);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      toast.error("Transaction failed");
      setTxHash(undefined);
    }
  }, [isError]);

  async function handleBuy(order: Order) {
    if (!address) {
      toast.error("Connect your wallet first");
      return;
    }
    try {
      const hash = await writeContractAsync({
        address: config.exchangeAddress,
        abi: exchangeABI,
        functionName: "fulfillOrder",
        args: [
          {
            maker: order.maker as `0x${string}`,
            taker: order.taker as `0x${string}`,
            side: order.side,
            kind: order.kind,
            assetType: order.assetType,
            collection: order.collection as `0x${string}`,
            tokenId: BigInt(order.tokenId),
            amount: BigInt(order.amount),
            paymentToken: order.paymentToken as `0x${string}`,
            price: BigInt(order.price),
            startPrice: BigInt(order.startPrice),
            startTime: BigInt(order.startTime),
            endTime: BigInt(order.endTime),
            salt: BigInt(order.salt),
            counter: BigInt(order.counter),
            extra: order.extra as `0x${string}`,
          },
          order.signature as `0x${string}`,
        ],
        value: BigInt(order.price),
      });
      setTxHash(hash);
      toast("Transaction submitted…", {
        style: { background: "#fefdfb", color: "#1a1a1a", border: "1px solid #b8860b" },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transaction rejected");
    }
  }

  async function handleAcceptOffer(order: Order) {
    if (!address) {
      toast.error("Connect your wallet first");
      return;
    }
    try {
      const hash = await writeContractAsync({
        address: config.exchangeAddress,
        abi: exchangeABI,
        functionName: "acceptOffer",
        args: [
          {
            maker: order.maker as `0x${string}`,
            taker: order.taker as `0x${string}`,
            side: order.side,
            kind: order.kind,
            assetType: order.assetType,
            collection: order.collection as `0x${string}`,
            tokenId: BigInt(order.tokenId),
            amount: BigInt(order.amount),
            paymentToken: order.paymentToken as `0x${string}`,
            price: BigInt(order.price),
            startPrice: BigInt(order.startPrice),
            startTime: BigInt(order.startTime),
            endTime: BigInt(order.endTime),
            salt: BigInt(order.salt),
            counter: BigInt(order.counter),
            extra: order.extra as `0x${string}`,
          },
          order.signature as `0x${string}`,
          BigInt(tokenId),
        ],
      });
      setTxHash(hash);
      toast("Transaction submitted…", {
        style: { background: "#fefdfb", color: "#1a1a1a", border: "1px solid #b8860b" },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transaction rejected");
    }
  }

  const isPending = isConfirming || !!txHash;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-serif text-lg font-semibold text-[#1a1a1a]">
          Listings
        </h3>
        {!sellOrders?.orders?.length && (
          <p className="font-serif text-sm text-[#c4bfb8] italic">
            No listings for this work.
          </p>
        )}
        <div className="space-y-3">
          {sellOrders?.orders.map((order) => (
            <OrderRow
              key={order.orderHash}
              order={order}
              label="ETH"
              actionLabel="Buy Now"
              onAction={() => handleBuy(order)}
              isPending={isPending}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-serif text-lg font-semibold text-[#1a1a1a]">
          Offers
        </h3>
        {!buyOrders?.orders?.length && (
          <p className="font-serif text-sm text-[#c4bfb8] italic">
            No offers for this work.
          </p>
        )}
        <div className="space-y-3">
          {buyOrders?.orders.map((order) => (
            <OrderRow
              key={order.orderHash}
              order={order}
              label="WETH"
              actionLabel="Accept Offer"
              onAction={() => handleAcceptOffer(order)}
              isPending={isPending}
            />
          ))}
        </div>
      </div>

      <a
        href={`/create?collection=${collection}&tokenId=${tokenId}`}
        className="block text-center font-serif text-sm text-[#b8860b] transition hover:text-[#9e7208]"
      >
        + Create order for this work
      </a>
    </div>
  );
}
