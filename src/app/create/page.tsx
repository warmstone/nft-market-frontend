"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount, useSignTypedData } from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ORDER_TYPES, getEIP712Domain } from "@/lib/eip712";
import { randomSalt } from "@/lib/utils";
import ModeSelector from "@/components/create/ModeSelector";
import OrderForm, { type OrderFormValues } from "@/components/create/OrderForm";
import NFTPicker from "@/components/create/NFTPicker";

function CreatePageInner() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") || "sell") as "sell" | "buy";
  const { address } = useAccount();

  const [collection, setCollection] = useState(
    searchParams.get("collection") || ""
  );
  const [tokenId, setTokenId] = useState(searchParams.get("tokenId") || "");
  const [isPending, setIsPending] = useState(false);
  const { signTypedDataAsync } = useSignTypedData();

  async function handleSubmit(values: OrderFormValues) {
    if (!address) {
      toast.error("Connect your wallet first");
      return;
    }
    if (!collection || !tokenId) {
      toast.error("Enter collection address and token ID");
      return;
    }

    setIsPending(true);
    try {
      const salt = randomSalt();
      const priceWei = values.price ? parseEther(values.price) : BigInt(0);
      const startTime = values.startTime
        ? Math.floor(new Date(values.startTime).getTime() / 1000)
        : Math.floor(Date.now() / 1000);
      const endTime = values.endTime
        ? Math.floor(new Date(values.endTime).getTime() / 1000)
        : 0;
      const paymentToken =
        values.paymentToken || "0x0000000000000000000000000000000000000000";
      const taker =
        values.taker || "0x0000000000000000000000000000000000000000";

      const signature = await signTypedDataAsync({
        domain: getEIP712Domain(),
        types: ORDER_TYPES,
        primaryType: "Order",
        message: {
          maker: address,
          taker: taker as `0x${string}`,
          side: mode === "sell" ? 0 : 1,
          kind: 0, // FixedPrice for v1
          assetType: 0, // ERC721 for v1
          collection: collection as `0x${string}`,
          tokenId: BigInt(tokenId),
          amount: BigInt(1),
          paymentToken: paymentToken as `0x${string}`,
          price: priceWei,
          startPrice: priceWei,
          startTime: BigInt(startTime),
          endTime: BigInt(endTime),
          salt: BigInt(salt),
          counter: BigInt(0),
          extra: "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      });

      await api.submitOrder({
        maker: address,
        taker,
        side: mode === "sell" ? 0 : 1,
        kind: 0,
        assetType: 0,
        collection,
        tokenId,
        amount: "1",
        paymentToken,
        price: priceWei.toString(),
        startPrice: priceWei.toString(),
        startTime,
        endTime,
        salt,
        extra: "0x0000000000000000000000000000000000000000000000000000000000000000",
        signature,
      });

      toast.success(
        mode === "sell" ? "Order listed!" : "Offer submitted!"
      );
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Something went wrong";
      // Don't toast for user-rejected signatures
      if (!msg.includes("rejected") && !msg.includes("denied")) {
        toast.error(msg);
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-white">
        {mode === "sell" ? "Create Listing" : "Make Offer"}
      </h1>

      <ModeSelector />
      <NFTPicker
        mode={mode}
        collection={collection}
        tokenId={tokenId}
        onCollectionChange={setCollection}
        onTokenIdChange={setTokenId}
      />
      <div className="mt-6">
        <OrderForm mode={mode} onSubmit={handleSubmit} isPending={isPending} />
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg animate-pulse">
          <div className="h-8 w-48 bg-gray-800 rounded mb-6" />
          <div className="h-40 bg-gray-900 rounded-xl" />
        </div>
      }
    >
      <CreatePageInner />
    </Suspense>
  );
}
