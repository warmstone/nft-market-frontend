"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { useOrders } from "@/hooks/useOrders";
import { exchangeABI } from "@/lib/contract";
import { config } from "@/config";
import { formatETH, shortenAddress } from "@/lib/utils";
import type { Order } from "@/types";

interface Props {
  collection: string;
  tokenId: string;
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
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Transaction confirmed!");
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
      toast.loading("Transaction submitted...");
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
      toast.loading("Transaction submitted...");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transaction rejected");
    }
  }

  const isPending = isConfirming || !!txHash;

  return (
    <div className="space-y-6">
      {/* Sell Orders (Listings) */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-white">Listings</h3>
        {sellOrders?.orders.length === 0 && (
          <p className="text-sm text-gray-500">No listings for this NFT.</p>
        )}
        {sellOrders?.orders.map((order) => (
          <div
            key={order.orderHash}
            className="flex items-center justify-between rounded-lg bg-gray-900 p-4 ring-1 ring-gray-800"
          >
            <div>
              <p className="text-lg font-semibold text-white">
                {formatETH(order.price)} ETH
              </p>
              <p className="text-xs text-gray-500">
                by {shortenAddress(order.maker)}
              </p>
            </div>
            <button
              onClick={() => handleBuy(order)}
              disabled={isPending}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {isPending ? "Pending..." : "Buy Now"}
            </button>
          </div>
        ))}
      </div>

      {/* Buy Orders (Offers) */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-white">Offers</h3>
        {buyOrders?.orders.length === 0 && (
          <p className="text-sm text-gray-500">No offers for this NFT.</p>
        )}
        {buyOrders?.orders.map((order) => (
          <div
            key={order.orderHash}
            className="flex items-center justify-between rounded-lg bg-gray-900 p-4 ring-1 ring-gray-800"
          >
            <div>
              <p className="text-lg font-semibold text-white">
                {formatETH(order.price)} WETH
              </p>
              <p className="text-xs text-gray-500">
                by {shortenAddress(order.maker)}
              </p>
            </div>
            <button
              onClick={() => handleAcceptOffer(order)}
              disabled={isPending}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {isPending ? "Pending..." : "Accept Offer"}
            </button>
          </div>
        ))}
      </div>

      {/* Create link */}
      <a
        href={`/create?collection=${collection}&tokenId=${tokenId}`}
        className="block text-center text-sm text-brand-500 hover:underline"
      >
        + Create order for this NFT
      </a>
    </div>
  );
}
