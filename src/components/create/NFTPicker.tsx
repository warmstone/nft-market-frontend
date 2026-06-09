"use client";

interface Props {
  mode: "sell" | "buy";
  collection: string;
  tokenId: string;
  onCollectionChange: (v: string) => void;
  onTokenIdChange: (v: string) => void;
}

export default function NFTPicker({
  mode,
  collection,
  tokenId,
  onCollectionChange,
  onTokenIdChange,
}: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-300">
        {mode === "sell" ? "NFT to Sell" : "NFT to Buy"}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Collection Address
          </label>
          <input
            type="text"
            value={collection}
            onChange={(e) => onCollectionChange(e.target.value)}
            placeholder="0x..."
            className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 ring-1 ring-gray-700 placeholder-gray-500 font-mono"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Token ID</label>
          <input
            type="text"
            value={tokenId}
            onChange={(e) => onTokenIdChange(e.target.value)}
            placeholder="1"
            className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 ring-1 ring-gray-700 placeholder-gray-500"
          />
        </div>
      </div>
    </div>
  );
}
