"use client";

import { useCollections } from "@/hooks/useCollections";
import CollectionCard from "@/components/home/CollectionCard";

export default function HomePage() {
  const { data: collections, error, isLoading } = useCollections();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Explore Collections</h1>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-gray-900 aspect-[3/4]" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-400">
          Failed to load collections. Please try again.
        </div>
      )}

      {collections && collections.length === 0 && (
        <div className="py-20 text-center text-gray-500">
          <p className="text-lg">No collections yet</p>
          <p className="text-sm mt-2">
            Collections will appear here once registered on-chain.
          </p>
        </div>
      )}

      {collections && collections.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {collections.map((c) => (
            <CollectionCard key={c.address} collection={c} />
          ))}
        </div>
      )}
    </div>
  );
}
