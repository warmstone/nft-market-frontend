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
  const selectClass =
    "rounded-md border border-[#e8e2d8] bg-white px-3 py-2 font-mono text-xs text-[#1a1a1a] outline-none transition focus:border-[#b8860b] appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b6560%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-10";
  const inputClass =
    "rounded-md border border-[#e8e2d8] bg-white px-3 py-2 font-mono text-xs text-[#1a1a1a] outline-none placeholder-[#c4bfb8] transition focus:border-[#b8860b] w-32";

  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      <select
        value={side}
        onChange={(e) => onSideChange(e.target.value as "" | "0" | "1")}
        className={selectClass}
      >
        <option value="">All Sides</option>
        <option value="0">Sell</option>
        <option value="1">Buy</option>
      </select>

      <select
        value={kind}
        onChange={(e) => onKindChange(e.target.value)}
        className={selectClass}
      >
        <option value="">All Kinds</option>
        <option value="0">Fixed Price</option>
        <option value="1">Dutch Auction</option>
      </select>

      <input
        type="text"
        placeholder="Min ETH"
        value={minPrice}
        onChange={(e) => onMinPriceChange(e.target.value)}
        className={inputClass}
      />

      <input
        type="text"
        placeholder="Max ETH"
        value={maxPrice}
        onChange={(e) => onMaxPriceChange(e.target.value)}
        className={inputClass}
      />
    </div>
  );
}
