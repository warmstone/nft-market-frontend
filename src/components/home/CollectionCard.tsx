import Link from "next/link";
import { formatETH, ipfsURL } from "@/lib/utils";
import type { Collection } from "@/types";

interface Props {
  collection: Collection & { floorPrice?: string; listed?: number };
}

export default function CollectionCard({ collection }: Props) {
  const imgSrc = collection.imageUrl
    ? ipfsURL(collection.imageUrl)
    : "/placeholder-collection.png";

  return (
    <Link
      href={`/collection/${collection.address}`}
      className="group rounded-xl bg-gray-900 ring-1 ring-gray-800 transition hover:ring-gray-600"
    >
      <div className="aspect-square overflow-hidden rounded-t-xl bg-gray-800">
        <img
          src={imgSrc}
          alt={collection.name}
          className="h-full w-full object-cover transition group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect fill='%23374151' width='100' height='100'/></svg>";
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white truncate">{collection.name}</h3>
        <p className="text-sm text-gray-400 truncate">
          {collection.symbol}
        </p>
        {collection.floorPrice && (
          <p className="mt-2 text-sm">
            <span className="text-gray-500">Floor: </span>
            <span className="text-gray-200">{formatETH(collection.floorPrice)} ETH</span>
          </p>
        )}
        {collection.listed !== undefined && (
          <p className="text-xs text-gray-500">{collection.listed} listed</p>
        )}
      </div>
    </Link>
  );
}
