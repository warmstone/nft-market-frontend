import Link from "next/link";
import { useAccount } from "wagmi";
import { formatETH, shortenAddress, relativeTime, isZeroAddress } from "@/lib/utils";
import type { Order } from "@/types";

interface Props {
  order: Order;
}

export default function OrderCard({ order }: Props) {
  const { address } = useAccount();
  const isSell = order.side === 0;
  const isOwner = address?.toLowerCase() === order.maker.toLowerCase();

  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-900 p-4 ring-1 ring-gray-800">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm font-medium text-white">
            {isSell ? "Listed" : "Offer"} · #
            {order.tokenId.length > 12
              ? shortenAddress(order.tokenId)
              : order.tokenId}
          </p>
          <p className="text-xs text-gray-500">
            by {shortenAddress(order.maker)}{" "}
            {isZeroAddress(order.taker) ? "" : `for ${shortenAddress(order.taker)}`}
            {order.endTime > 0 && ` · Expires ${relativeTime(order.endTime)}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <p className="text-lg font-semibold text-white">
          {formatETH(order.price)} ETH
        </p>
        <div className="flex gap-2">
          <Link
            href={`/asset/${order.collection}/${order.tokenId}`}
            className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700"
          >
            View
          </Link>
          {!isOwner && order.status === 0 && (
            <Link
              href={`/asset/${order.collection}/${order.tokenId}`}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs text-white hover:bg-brand-700"
            >
              {isSell ? "Buy" : "Accept"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
