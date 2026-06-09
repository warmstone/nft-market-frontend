"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ModeSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("mode") || "sell";

  return (
    <div className="mb-6 flex rounded-lg bg-gray-900 p-1 ring-1 ring-gray-800">
      {(["sell", "buy"] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => router.push(`/create?mode=${mode}`)}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${
            current === mode
              ? "bg-brand-600 text-white"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          {mode === "sell" ? "Sell NFT" : "Make Offer"}
        </button>
      ))}
    </div>
  );
}
