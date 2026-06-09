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

  const { data: collection, isLoading: colLoading } = useCollection(address);
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
        <div className="mb-8 animate-pulse">
          <div className="h-24 w-24 rounded-full bg-gray-800 mb-4" />
          <div className="h-8 w-48 bg-gray-800 rounded mb-2" />
          <div className="h-4 w-24 bg-gray-800 rounded" />
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
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-900" />
          ))}
        </div>
      )}

      {ordersData && ordersData.orders.length === 0 && (
        <div className="py-16 text-center text-gray-500">
          No active orders for this collection.
        </div>
      )}

      {ordersData && ordersData.orders.length > 0 && (
        <div className="space-y-3">
          {ordersData.orders.map((order) => (
            <OrderCard key={order.orderHash} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
