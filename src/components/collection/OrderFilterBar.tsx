"use client";

interface Props {
  side: "" | "0" | "1";
  kind: string;
  minPrice: string;
  maxPrice: string;
  onSideChange: (v: "" | "0" | "1") => void;
  onKindChange: (v: string) => void;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
}

export default function OrderFilterBar({
  side,
  kind,
  minPrice,
  maxPrice,
  onSideChange,
  onKindChange,
  onMinPriceChange,
  onMaxPriceChange,
}: Props) {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <select
        value={side}
        onChange={(e) => onSideChange(e.target.value as "" | "0" | "1")}
        className="rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 ring-1 ring-gray-700"
      >
        <option value="">All Sides</option>
        <option value="0">Sell (Listings)</option>
        <option value="1">Buy (Offers)</option>
      </select>

      <select
        value={kind}
        onChange={(e) => onKindChange(e.target.value)}
        className="rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 ring-1 ring-gray-700"
      >
        <option value="">All Kinds</option>
        <option value="0">Fixed Price</option>
        <option value="1">Dutch Auction</option>
      </select>

      <input
        type="text"
        placeholder="Min price (ETH)"
        value={minPrice}
        onChange={(e) => onMinPriceChange(e.target.value)}
        className="rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 ring-1 ring-gray-700 placeholder-gray-500 w-36"
      />

      <input
        type="text"
        placeholder="Max price (ETH)"
        value={maxPrice}
        onChange={(e) => onMaxPriceChange(e.target.value)}
        className="rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 ring-1 ring-gray-700 placeholder-gray-500 w-36"
      />
    </div>
  );
}
