"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useCollection } from "@/hooks/useCollections";
import { useOrders } from "@/hooks/useOrders";
import { useWebSocket } from "@/hooks/useWebSocket";
import CollectionHero from "@/components/collection/CollectionHero";
import OrderFilterBar from "@/components/collection/OrderFilterBar";
import OrderCard from "@/components/collection/OrderCard";

export default function CollectionPage() {
  const params = useParams();
  const address = params.address as string;

  const [side, setSide] = useState<"" | "0" | "1">("");
  const [kind, setKind] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { data: collection, isLoading: colLoading } =
    useCollection(address);
  const { data: ordersData, isLoading: ordersLoading } = useOrders({
    collection: address,
    side: side ? (Number(side) as 0 | 1) : undefined,
    kind: kind ? Number(kind) : undefined,
    status: 0,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    pageSize: 50,
  });

  useWebSocket([address]);

  return (
    <div>
      {colLoading && (
        <div className="mb-12 animate-pulse space-y-4">
          <div className="h-10 w-64 rounded bg-[#e8e2d8]" />
          <div className="h-5 w-48 rounded bg-[#e8e2d8]" />
          <div className="mt-6 flex gap-12">
            <div className="h-12 w-20 rounded bg-[#e8e2d8]" />
            <div className="h-12 w-20 rounded bg-[#e8e2d8]" />
            <div className="h-12 w-20 rounded bg-[#e8e2d8]" />
          </div>
        </div>
      )}

      {collection && <CollectionHero collection={collection} />}

      <OrderFilterBar
        side={side}
        kind={kind}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onSideChange={setSide}
        onKindChange={setKind}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
      />

      {ordersLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg border border-[#e8e2d8] bg-white"
            />
          ))}
        </div>
      )}

      {ordersData && !ordersData.orders?.length && (
        <div className="py-20 text-center">
          <p className="font-serif text-lg text-[#c4bfb8] italic">
            No active orders for this collection.
          </p>
        </div>
      )}

      {ordersData && ordersData.orders && ordersData.orders.length > 0 && (
        <div className="space-y-3">
          {ordersData.orders.map((order, i) => (
            <div
              key={order.orderHash}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <OrderCard order={order} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
