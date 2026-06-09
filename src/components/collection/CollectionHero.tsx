import { shortenAddress } from "@/lib/utils";
import type { CollectionDetail } from "@/types";

interface Props {
  collection: CollectionDetail;
}

export default function CollectionHero({ collection }: Props) {
  return (
    <div className="mb-12 border-b border-[#e8e2d8] pb-10">
      <h1 className="font-serif text-4xl font-semibold italic text-[#1a1a1a]">
        {collection.name}
      </h1>
      <p className="mt-2 font-mono text-sm text-[#8c8580]">
        {shortenAddress(collection.address)}
      </p>
      <div className="mt-8 flex gap-12 font-mono text-sm">
        <div>
          <span className="text-[#8c8580] uppercase tracking-wider text-xs">
            Floor Price
          </span>
          <p className="mt-1 text-lg font-medium text-[#1a1a1a]">
            {collection.floorPrice
              ? `${collection.floorPrice} ETH`
              : "—"}
          </p>
        </div>
        <div>
          <span className="text-[#8c8580] uppercase tracking-wider text-xs">
            Best Bid
          </span>
          <p className="mt-1 text-lg font-medium text-[#1a1a1a]">
            {collection.bestBid ? `${collection.bestBid} ETH` : "—"}
          </p>
        </div>
        <div>
          <span className="text-[#8c8580] uppercase tracking-wider text-xs">
            Listed
          </span>
          <p className="mt-1 text-lg font-medium text-[#1a1a1a]">
            {collection.listed}
          </p>
        </div>
      </div>
    </div>
  );
}
