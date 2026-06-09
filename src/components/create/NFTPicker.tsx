"use client";

interface Props {
  mode: "sell" | "buy";
  collection: string;
  tokenId: string;
  onCollectionChange: (v: string) => void;
  onTokenIdChange: (v: string) => void;
}

const inputClass =
  "w-full rounded-md border border-[#e8e2d8] bg-white px-3 py-2.5 font-mono text-sm text-[#1a1a1a] placeholder-[#c4bfb8] outline-none transition focus:border-[#b8860b]";

export default function NFTPicker({
  mode,
  collection,
  tokenId,
  onCollectionChange,
  onTokenIdChange,
}: Props) {
  return (
    <div className="space-y-5">
      <h3 className="font-serif text-base font-medium text-[#1a1a1a]">
        {mode === "sell" ? "Work to Sell" : "Work to Bid On"}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-[#8c8580]">
            Collection
          </label>
          <input
            type="text"
            value={collection}
            onChange={(e) => onCollectionChange(e.target.value)}
            placeholder="0x..."
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-[#8c8580]">
            Token ID
          </label>
          <input
            type="text"
            value={tokenId}
            onChange={(e) => onTokenIdChange(e.target.value)}
            placeholder="1"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
