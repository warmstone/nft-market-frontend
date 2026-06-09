"use client";

import { useAccount } from "wagmi";

export default function NFTTab() {
  const { address } = useAccount();

  if (!address) {
    return (
      <p className="py-16 text-center font-serif text-sm text-[#c4bfb8] italic">
        Connect your wallet to view your collection.
      </p>
    );
  }

  return (
    <div className="py-20 text-center">
      <p className="font-serif text-base text-[#c4bfb8] italic">
        Collection browsing coming soon.
      </p>
      <p className="mt-2 font-serif text-sm text-[#c4bfb8]">
        Use the search bar or browse collections to discover works.
      </p>
    </div>
  );
}
