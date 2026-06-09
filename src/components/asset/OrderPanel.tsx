"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { toast } from "sonner";
import { config } from "@/config";
import { useOrders } from "@/hooks/useOrders";
import {
  erc20MarketABI,
  erc721MarketABI,
  exchangeABI,
} from "@/lib/contract";
import { formatETH, isZeroAddress, shortenAddress } from "@/lib/utils";
import type { Order } from "@/types";

interface Props {
  collection: string;
  tokenId: string;
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

function contractOrder(order: Order) {
  return {
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
  };
}

function ListingRow({
  order,
  account,
  nativeBalance,
  isPending,
  onBuy,
}: {
  order: Order;
  account?: `0x${string}`;
  nativeBalance?: bigint;
  isPending: boolean;
  onBuy: (order: Order) => void;
}) {
  const price = BigInt(order.price);
  const isMaker = !!account && account.toLowerCase() === order.maker.toLowerCase();
  const lacksBalance = nativeBalance !== undefined && nativeBalance < price;
  const disabled = !account || isMaker || lacksBalance || isPending;
  const reason = !account
    ? "Connect wallet"
    : isMaker
      ? "Your listing"
      : lacksBalance
        ? "Insufficient ETH"
        : isPending
          ? "Pending"
          : "Buy Now";

  return (
    <OrderRow
      order={order}
      label="ETH"
      actionLabel={reason}
      onAction={() => onBuy(order)}
      disabled={disabled}
    />
  );
}

function OfferRow({
  order,
  account,
  tokenId,
  isPending,
  onAccept,
  onApproveNFT,
}: {
  order: Order;
  account?: `0x${string}`;
  tokenId: string;
  isPending: boolean;
  onAccept: (order: Order) => void;
  onApproveNFT: (collection: `0x${string}`) => void;
}) {
  const { data: owner } = useReadContract({
    address: order.collection as `0x${string}`,
    abi: erc721MarketABI,
    functionName: "ownerOf",
    args: [BigInt(tokenId)],
    query: { enabled: !!account },
  });
  const { data: approved } = useReadContract({
    address: order.collection as `0x${string}`,
    abi: erc721MarketABI,
    functionName: "getApproved",
    args: [BigInt(tokenId)],
    query: { enabled: !!account },
  });
  const { data: approvedForAll } = useReadContract({
    address: order.collection as `0x${string}`,
    abi: erc721MarketABI,
    functionName: "isApprovedForAll",
    args: [account ?? ZERO_ADDRESS, config.exchangeAddress],
    query: { enabled: !!account },
  });
  const { data: makerTokenBalance } = useReadContract({
    address: order.paymentToken as `0x${string}`,
    abi: erc20MarketABI,
    functionName: "balanceOf",
    args: [order.maker as `0x${string}`],
    query: { enabled: !isZeroAddress(order.paymentToken) },
  });
  const { data: makerAllowance } = useReadContract({
    address: order.paymentToken as `0x${string}`,
    abi: erc20MarketABI,
    functionName: "allowance",
    args: [order.maker as `0x${string}`, config.exchangeAddress],
    query: { enabled: !isZeroAddress(order.paymentToken) },
  });

  const price = BigInt(order.price);
  const isMaker = !!account && account.toLowerCase() === order.maker.toLowerCase();
  const notOwner = !!owner && !!account && owner.toLowerCase() !== account.toLowerCase();
  const notApproved =
    !!account &&
    !!approved &&
    approved.toLowerCase() !== config.exchangeAddress.toLowerCase() &&
    approvedForAll === false;
  const makerCannotPay =
    (makerTokenBalance !== undefined && makerTokenBalance < price) ||
    (makerAllowance !== undefined && makerAllowance < price);
  const disabled = !account || isMaker || notOwner || notApproved || makerCannotPay || isPending;
  const reason = !account
    ? "Connect wallet"
    : isMaker
      ? "Your offer"
      : notOwner
        ? "Not owner"
        : notApproved
          ? "Approve NFT"
          : makerCannotPay
            ? "Offer unfunded"
            : isPending
              ? "Pending"
              : "Accept Offer";
  const canApproveNFT = !!account && !isMaker && !notOwner && notApproved && !isPending;

  return (
    <OrderRow
      order={order}
      label="WETH"
      actionLabel={reason}
      onAction={() => {
        if (canApproveNFT) {
          onApproveNFT(order.collection as `0x${string}`);
          return;
        }
        onAccept(order);
      }}
      disabled={disabled && !canApproveNFT}
    />
  );
}

function OrderRow({
  order,
  label,
  actionLabel,
  onAction,
  disabled,
}: {
  order: Order;
  label: string;
  actionLabel: string;
  onAction: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-[#e8e2d8] bg-white px-5 py-4">
      <div>
        <p className="font-mono text-base font-medium text-[#1a1a1a]">
          {formatETH(order.price)} {label}
        </p>
        <p className="mt-0.5 font-serif text-xs text-[#8c8580]">
          Maker {shortenAddress(order.maker)}
        </p>
      </div>
      <button
        onClick={onAction}
        disabled={disabled}
        className="rounded-md bg-[#1a1a1a] px-5 py-2 font-serif text-sm text-[#faf7f2] transition hover:bg-[#3d3d3d] disabled:opacity-40"
      >
        {actionLabel}
      </button>
    </div>
  );
}

export default function OrderPanel({ collection, tokenId }: Props) {
  const { address } = useAccount();
  const account = address as `0x${string}` | undefined;
  const { data: balance } = useBalance({ address: account });
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
        args: [contractOrder(order), order.signature as `0x${string}`],
        value: BigInt(order.price),
      });
      setTxHash(hash);
      toast("Transaction submitted");
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
          contractOrder(order),
          order.signature as `0x${string}`,
          BigInt(tokenId),
        ],
      });
      setTxHash(hash);
      toast("Transaction submitted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transaction rejected");
    }
  }

  async function handleApproveNFT(collectionAddress: `0x${string}`) {
    if (!address) {
      toast.error("Connect your wallet first");
      return;
    }

    try {
      const hash = await writeContractAsync({
        address: collectionAddress,
        abi: erc721MarketABI,
        functionName: "setApprovalForAll",
        args: [config.exchangeAddress, true],
      });
      setTxHash(hash);
      toast("Approval submitted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approval rejected");
    }
  }

  const isPending = isConfirming || !!txHash;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-serif text-lg font-semibold text-[#1a1a1a]">
          Listings
        </h3>
        {sellOrders?.orders.length === 0 && (
          <p className="font-serif text-sm text-[#c4bfb8] italic">
            No listings for this work.
          </p>
        )}
        <div className="space-y-3">
          {sellOrders?.orders.map((order) => (
            <ListingRow
              key={order.orderHash}
              order={order}
              account={account}
              nativeBalance={balance?.value}
              isPending={isPending}
              onBuy={handleBuy}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-serif text-lg font-semibold text-[#1a1a1a]">
          Offers
        </h3>
        {buyOrders?.orders.length === 0 && (
          <p className="font-serif text-sm text-[#c4bfb8] italic">
            No offers for this work.
          </p>
        )}
        <div className="space-y-3">
          {buyOrders?.orders.map((order) => (
            <OfferRow
              key={order.orderHash}
              order={order}
              account={account}
              tokenId={tokenId}
              isPending={isPending}
              onAccept={handleAcceptOffer}
              onApproveNFT={handleApproveNFT}
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
