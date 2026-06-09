"use client";

import { useCollections } from "@/hooks/useCollections";
import CollectionCard from "@/components/home/CollectionCard";

export default function HomePage() {
  const { data: collections, error, isLoading } = useCollections();

  return (
    <div>
      <h1 className="mb-10 font-serif text-4xl font-semibold italic text-[#1a1a1a]">
        Explore
      </h1>

      {isLoading && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-[#e8e2d8] bg-white aspect-[3/4]"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-6 font-serif text-sm text-red-600">
          Unable to load collections. Please try again.
        </div>
      )}

      {collections && collections.length === 0 && (
        <div className="py-32 text-center">
          <p className="font-serif text-xl text-[#c4bfb8] italic">
            No collections yet
          </p>
          <p className="mt-3 font-serif text-sm text-[#c4bfb8]">
            Collections will appear here once registered on-chain.
          </p>
        </div>
      )}

      {collections && collections.length > 0 && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {collections.map((c, i) => (
            <div
              key={c.address}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CollectionCard collection={c} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
