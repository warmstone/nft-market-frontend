"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ModeSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("mode") || "sell";

  return (
    <div className="mb-8 flex rounded-md border border-[#e8e2d8] bg-[#f5efe4] p-1">
      {(["sell", "buy"] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => router.push(`/create?mode=${mode}`)}
          className={`flex-1 rounded-sm px-4 py-2.5 font-serif text-sm transition ${
            current === mode
              ? "bg-white text-[#1a1a1a] shadow-sm"
              : "text-[#8c8580] hover:text-[#1a1a1a]"
          }`}
        >
          {mode === "sell" ? "Sell a Work" : "Make an Offer"}
        </button>
      ))}
    </div>
  );
}
