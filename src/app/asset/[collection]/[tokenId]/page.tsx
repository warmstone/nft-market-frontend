"use client";

import { useParams } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAsset } from "@/hooks/useCollections";
import { shortenAddress } from "@/lib/utils";
import NFTViewer from "@/components/asset/NFTViewer";
import OrderPanel from "@/components/asset/OrderPanel";
import ActivityList from "@/components/asset/ActivityList";

export default function AssetPage() {
  const params = useParams();
  const collection = params.collection as string;
  const tokenId = params.tokenId as string;

  useWebSocket([collection]);
  const { data: asset, isLoading, error } = useAsset(collection, tokenId);

  const metadata = asset?.metadata;
  const displayName = metadata?.name || `#${tokenId}`;
  const attributes = Array.isArray(metadata?.attributes)
    ? metadata.attributes.map((attr) => ({
        trait_type: attr.trait_type || attr.traitType || "Attribute",
        value: String(attr.value),
      }))
    : undefined;

  return (
    <div>
      {isLoading && (
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-lg border border-[#e8e2d8] bg-[#f5efe4]" />
          <div className="space-y-5">
            <div className="h-10 w-40 animate-pulse rounded bg-[#e8e2d8]" />
            <div className="h-5 w-64 animate-pulse rounded bg-[#e8e2d8]" />
            <div className="h-48 animate-pulse rounded-lg border border-[#e8e2d8] bg-white" />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-6 font-serif text-sm text-red-600">
          Unable to load this work. Orders may still be available below.
        </div>
      )}

      {!isLoading && (
      <div className="grid gap-12 lg:grid-cols-2">
        <NFTViewer
          name={displayName}
          imageUrl={metadata?.imageUrl || ""}
          description={metadata?.description}
          attributes={attributes}
        />
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#1a1a1a]">
            {displayName}
          </h1>
          <p className="mt-3 font-mono text-sm text-[#8c8580] break-all">
            {asset?.collection?.name || shortenAddress(collection)}
            <span className="ml-2 text-[#c4bfb8]">
              {shortenAddress(collection)}
            </span>
          </p>
          <div className="mt-6 flex gap-8 border-y border-[#e8e2d8] py-5 font-mono text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#8c8580]">
                Listings
              </p>
              <p className="mt-1 text-lg font-medium text-[#1a1a1a]">
                {asset?.listings.length ?? 0}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#8c8580]">
                Offers
              </p>
              <p className="mt-1 text-lg font-medium text-[#1a1a1a]">
                {asset?.offers.length ?? 0}
              </p>
            </div>
          </div>
          <div className="mt-8">
            <OrderPanel collection={collection} tokenId={tokenId} />
          </div>
          <div className="mt-10">
            <h3 className="mb-4 font-serif text-lg font-semibold text-[#1a1a1a]">
              Activity
            </h3>
            <ActivityList orders={asset?.activity ?? []} />
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
