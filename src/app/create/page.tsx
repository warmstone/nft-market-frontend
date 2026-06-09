"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  useAccount,
  useReadContract,
  useSignTypedData,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";
import { config } from "@/config";
import { api } from "@/lib/api";
import { erc20MarketABI, erc721MarketABI } from "@/lib/contract";
import { ORDER_TYPES, getEIP712Domain } from "@/lib/eip712";
import { isZeroAddress, randomSalt, shortenAddress } from "@/lib/utils";
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
  const [tokenId, setTokenId] = useState(
    searchParams.get("tokenId") || ""
  );
  const [isPending, setIsPending] = useState(false);
  const [approvalTx, setApprovalTx] = useState<`0x${string}` | undefined>();
  const [formValues, setFormValues] = useState<OrderFormValues>({
    price: "",
    startPrice: "",
    startTime: "",
    endTime: "",
    taker: "",
    paymentToken: "",
  });
  const { signTypedDataAsync } = useSignTypedData();
  const { writeContractAsync } = useWriteContract();
  const { isLoading: approvalPending } = useWaitForTransactionReceipt({
    hash: approvalTx,
  });
  const account = address as `0x${string}` | undefined;
  const tokenIdBigInt = /^\d+$/.test(tokenId) ? BigInt(tokenId) : BigInt(0);
  const priceWei = formValues.price && /^\d*\.?\d+$/.test(formValues.price)
    ? parseEther(formValues.price)
    : BigInt(0);
  const orderPaymentToken =
    formValues.paymentToken ||
    (mode === "buy"
      ? config.wethAddress
      : "0x0000000000000000000000000000000000000000");
  const canReadNFT = !!collection && !!tokenId && /^\d+$/.test(tokenId) && !!account;
  const { data: owner } = useReadContract({
    address: collection as `0x${string}`,
    abi: erc721MarketABI,
    functionName: "ownerOf",
    args: [tokenIdBigInt],
    query: { enabled: canReadNFT },
  });
  const { data: approved } = useReadContract({
    address: collection as `0x${string}`,
    abi: erc721MarketABI,
    functionName: "getApproved",
    args: [tokenIdBigInt],
    query: { enabled: canReadNFT && mode === "sell" },
  });
  const { data: approvedForAll } = useReadContract({
    address: collection as `0x${string}`,
    abi: erc721MarketABI,
    functionName: "isApprovedForAll",
    args: [account ?? "0x0000000000000000000000000000000000000000", config.exchangeAddress],
    query: { enabled: canReadNFT && mode === "sell" },
  });
  const { data: tokenAllowance } = useReadContract({
    address: orderPaymentToken as `0x${string}`,
    abi: erc20MarketABI,
    functionName: "allowance",
    args: [account ?? "0x0000000000000000000000000000000000000000", config.exchangeAddress],
    query: { enabled: mode === "buy" && !!account && !isZeroAddress(orderPaymentToken) },
  });
  const needsNFTApproval =
    mode === "sell" &&
    !!account &&
    !!collection &&
    approved !== undefined &&
    approvedForAll !== undefined &&
    approved.toLowerCase() !== config.exchangeAddress.toLowerCase() &&
    approvedForAll !== true;
  const needsTokenApproval =
    mode === "buy" &&
    priceWei > BigInt(0) &&
    tokenAllowance !== undefined &&
    tokenAllowance < priceWei;

  async function handleSubmit(values: OrderFormValues) {
    if (!address) {
      toast.error("Connect your wallet first");
      return;
    }
    if (!collection || !tokenId) {
      toast.error("Enter collection address and token ID");
      return;
    }
    if (!/^\d+$/.test(tokenId)) {
      toast.error("Token ID must be a decimal integer");
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
        values.paymentToken ||
        (mode === "buy"
          ? config.wethAddress
          : "0x0000000000000000000000000000000000000000");
      const taker =
        values.taker || "0x0000000000000000000000000000000000000000";

      if (mode === "sell") {
        if (owner && owner.toLowerCase() !== address.toLowerCase()) {
          toast.error(`This wallet does not own token #${tokenId}`);
          return;
        }
        const exchangeApproved =
          approved?.toLowerCase() === config.exchangeAddress.toLowerCase() ||
          approvedForAll === true;
        if (approved !== undefined && approvedForAll !== undefined && !exchangeApproved) {
          toast.error("Approve the exchange for this NFT before listing");
          return;
        }
      }

      if (mode === "buy" && isZeroAddress(paymentToken)) {
        toast.error("Configure WETH or enter a payment token before making an offer");
        return;
      }
      if (mode === "buy" && tokenAllowance !== undefined && tokenAllowance < priceWei) {
        toast.error("Approve the payment token before submitting this offer");
        return;
      }

      const signature = await signTypedDataAsync({
        domain: getEIP712Domain(),
        types: ORDER_TYPES,
        primaryType: "Order",
        message: {
          maker: address,
          taker: taker as `0x${string}`,
          side: mode === "sell" ? 0 : 1,
          kind: 0,
          assetType: 0,
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
        mode === "sell" ? "Work listed" : "Offer submitted"
      );
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Something went wrong";
      if (!msg.includes("rejected") && !msg.includes("denied")) {
        toast.error(msg);
      }
    } finally {
      setIsPending(false);
    }
  }

  async function handleApproveNFT() {
    if (!collection) return;
    try {
      const hash = await writeContractAsync({
        address: collection as `0x${string}`,
        abi: erc721MarketABI,
        functionName: "setApprovalForAll",
        args: [config.exchangeAddress, true],
      });
      setApprovalTx(hash);
      toast("Approval submitted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approval rejected");
    }
  }

  async function handleApproveToken() {
    if (isZeroAddress(orderPaymentToken) || priceWei <= BigInt(0)) return;
    try {
      const hash = await writeContractAsync({
        address: orderPaymentToken as `0x${string}`,
        abi: erc20MarketABI,
        functionName: "approve",
        args: [config.exchangeAddress, priceWei],
      });
      setApprovalTx(hash);
      toast("Approval submitted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approval rejected");
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-8 font-serif text-3xl font-semibold italic text-[#1a1a1a]">
        {mode === "sell" ? "List a Work" : "Make an Offer"}
      </h1>

      <ModeSelector />
      <NFTPicker
        mode={mode}
        collection={collection}
        tokenId={tokenId}
        onCollectionChange={setCollection}
        onTokenIdChange={setTokenId}
      />
      {collection && tokenId && owner && (
        <div className="mt-4 rounded-md border border-[#e8e2d8] bg-white px-4 py-3 font-serif text-xs text-[#8c8580]">
          Owner {shortenAddress(owner)}
        </div>
      )}
      {(needsNFTApproval || needsTokenApproval) && (
        <div className="mt-4 rounded-md border border-[#e8e2d8] bg-white p-4">
          <p className="font-serif text-sm text-[#6b6560]">
            {needsNFTApproval
              ? "Approve the exchange before listing this work."
              : "Approve the exchange to use your payment token for this offer."}
          </p>
          <button
            type="button"
            onClick={needsNFTApproval ? handleApproveNFT : handleApproveToken}
            disabled={approvalPending}
            className="mt-3 rounded-md bg-[#1a1a1a] px-4 py-2 font-serif text-sm text-[#faf7f2] transition hover:bg-[#3d3d3d] disabled:opacity-40"
          >
            {approvalPending ? "Approving" : needsNFTApproval ? "Approve Collection" : "Approve Token"}
          </button>
        </div>
      )}
      <div className="mt-8">
        <OrderForm
          mode={mode}
          onSubmit={handleSubmit}
          onValuesChange={setFormValues}
          isPending={isPending}
        />
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg animate-pulse space-y-6">
          <div className="h-9 w-48 rounded bg-[#e8e2d8]" />
          <div className="h-48 rounded-lg border border-[#e8e2d8] bg-white" />
        </div>
      }
    >
      <CreatePageInner />
    </Suspense>
  );
}
