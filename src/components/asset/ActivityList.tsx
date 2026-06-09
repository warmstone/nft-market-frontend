import { formatETH, relativeTime, shortenAddress } from "@/lib/utils";
import type { Order } from "@/types";

const STATUS_LABEL = {
  0: "Active",
  1: "Filled",
  2: "Cancelled",
  3: "Expired",
} as const;

export default function ActivityList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <p className="font-serif text-sm text-[#c4bfb8] italic">
        No activity yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <div
          key={order.orderHash}
          className="flex items-center justify-between rounded-md border border-[#e8e2d8] bg-white px-4 py-3"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-[#8c8580]">
              {STATUS_LABEL[order.status]} {order.side === 0 ? "listing" : "offer"}
            </p>
            <p className="mt-1 font-serif text-xs text-[#8c8580]">
              {shortenAddress(order.maker)}
              {order.endTime > 0 ? ` expires ${relativeTime(order.endTime)}` : ""}
            </p>
          </div>
          <p className="font-mono text-sm font-medium text-[#1a1a1a]">
            {formatETH(order.price)} {order.side === 0 ? "ETH" : "WETH"}
          </p>
        </div>
      ))}
    </div>
  );
}
