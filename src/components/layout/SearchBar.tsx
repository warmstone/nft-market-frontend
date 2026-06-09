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
    router.push(`/collection/${q}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-sm">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search collections..."
        className="w-full rounded-md border border-[#e8e2d8] bg-white px-4 py-2 font-serif text-sm text-[#1a1a1a] placeholder-[#c4bfb8] outline-none transition focus:border-[#b8860b] focus:ring-1 focus:ring-[#b8860b]/20"
      />
    </form>
  );
}
