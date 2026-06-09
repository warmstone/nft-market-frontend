import Link from "next/link";
import { useAccount } from "wagmi";
import { shortenAddress, relativeTime, isZeroAddress } from "@/lib/utils";
import type { Order } from "@/types";

interface Props {
  order: Order;
}

export default function OrderCard({ order }: Props) {
  const { address } = useAccount();
  const isSell = order.side === 0;
  const isOwner =
    address?.toLowerCase() === order.maker.toLowerCase();

  return (
    <div className="flex items-center justify-between rounded-lg border border-[#e8e2d8] bg-white px-6 py-5 transition hover:border-[#c4bfb8]">
      <div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-wider text-[#8c8580]">
            {isSell ? "Listed" : "Offer"}
          </span>
          <span className="font-mono text-sm text-[#1a1a1a]">
            #{order.tokenId.length > 12
              ? shortenAddress(order.tokenId)
              : order.tokenId}
          </span>
        </div>
        <p className="mt-1 font-serif text-sm text-[#6b6560]">
          {shortenAddress(order.maker)}
          {!isZeroAddress(order.taker) &&
            ` · for ${shortenAddress(order.taker)}`}
          {order.endTime > 0 &&
            ` · ${relativeTime(order.endTime)}`}
        </p>
      </div>

      <div className="flex items-center gap-6">
        <p className="font-mono text-lg font-medium text-[#1a1a1a]">
          {order.price} ETH
        </p>
        <div className="flex gap-2">
          <Link
            href={`/asset/${order.collection}/${order.tokenId}`}
            className="rounded-md border border-[#e8e2d8] px-4 py-2 font-serif text-xs text-[#6b6560] transition hover:border-[#b8860b] hover:text-[#b8860b]"
          >
            View
          </Link>
          {!isOwner && order.status === 0 && (
            <Link
              href={`/asset/${order.collection}/${order.tokenId}`}
              className="rounded-md bg-[#1a1a1a] px-4 py-2 font-serif text-xs text-[#faf7f2] transition hover:bg-[#3d3d3d]"
            >
              {isSell ? "Buy" : "Accept"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
