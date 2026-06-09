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
      className="hover-lift group block rounded-lg border border-[#e8e2d8] bg-white p-4"
    >
      <div className="aspect-square overflow-hidden rounded-md bg-[#f5efe4]">
        <img
          src={imgSrc}
          alt={collection.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect fill='%23ede3d3' width='100' height='100'/></svg>";
          }}
        />
      </div>
      <div className="mt-4">
        <h3 className="font-serif text-base font-semibold text-[#1a1a1a] truncate">
          {collection.name}
        </h3>
        <p className="font-mono text-xs text-[#8c8580] truncate mt-1">
          {collection.symbol}
        </p>
        {collection.floorPrice && (
          <p className="mt-3 font-mono text-sm">
            <span className="text-[#8c8580]">Floor </span>
            <span className="text-[#1a1a1a] font-medium">
              {formatETH(collection.floorPrice)} ETH
            </span>
          </p>
        )}
        {collection.listed !== undefined && (
          <p className="mt-1 font-mono text-xs text-[#8c8580]">
            {collection.listed} listed
          </p>
        )}
      </div>
    </Link>
  );
}
