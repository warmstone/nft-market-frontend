"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (q.startsWith("0x") && q.length === 42) {
      router.push(`/collection/${q}`);
    } else {
      router.push(`/collection/${q}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-md mx-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search collections or NFTs..."
        className="w-full rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-200 placeholder-gray-500 outline-none ring-1 ring-gray-700 focus:ring-brand-500"
      />
    </form>
  );
}
