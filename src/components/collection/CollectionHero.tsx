import { formatETH, shortenAddress } from "@/lib/utils";
import type { CollectionDetail } from "@/types";

interface Props {
  collection: CollectionDetail;
}

export default function CollectionHero({ collection }: Props) {
  return (
    <div className="mb-12 border-b border-[#e8e2d8] pb-10">
      <h1 className="font-serif text-4xl font-semibold italic text-[#1a1a1a]">
        {collection.name || "Untitled Collection"}
      </h1>
      <p className="mt-2 font-mono text-sm text-[#8c8580]">
        {shortenAddress(collection.address)}
      </p>
      <div className="mt-8 flex gap-12 font-mono text-sm">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#8c8580]">
            Floor Price
          </span>
          <p className="mt-1 text-lg font-medium text-[#1a1a1a]">
            {collection.floorPrice ? `${formatETH(collection.floorPrice)} ETH` : "-"}
          </p>
        </div>
        <div>
          <span className="text-xs uppercase tracking-wider text-[#8c8580]">
            Best Bid
          </span>
          <p className="mt-1 text-lg font-medium text-[#1a1a1a]">
            {collection.bestBid ? `${formatETH(collection.bestBid)} WETH` : "-"}
          </p>
        </div>
        <div>
          <span className="text-xs uppercase tracking-wider text-[#8c8580]">
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
