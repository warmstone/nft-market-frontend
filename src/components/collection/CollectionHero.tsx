import { formatETH, ipfsURL } from "@/lib/utils";
import type { CollectionDetail } from "@/types";

interface Props {
  collection: CollectionDetail;
}

export default function CollectionHero({ collection }: Props) {
  return (
    <div className="mb-8">
      {collection.imageUrl && (
        <img
          src={ipfsURL(collection.imageUrl)}
          alt={collection.name}
          className="mb-4 h-24 w-24 rounded-full ring-2 ring-gray-700"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <h1 className="text-3xl font-bold text-white">{collection.name}</h1>
      <p className="text-gray-400">{collection.symbol}</p>
      <div className="mt-4 flex gap-6 text-sm">
        <div>
          <span className="text-gray-500">Floor</span>
          <p className="text-white font-medium">
            {collection.floorPrice ? `${formatETH(collection.floorPrice)} ETH` : "—"}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Best Bid</span>
          <p className="text-white font-medium">
            {collection.bestBid ? `${formatETH(collection.bestBid)} ETH` : "—"}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Listed</span>
          <p className="text-white font-medium">{collection.listed}</p>
        </div>
      </div>
    </div>
  );
}
