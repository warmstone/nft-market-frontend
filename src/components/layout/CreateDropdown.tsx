"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function CreateDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        Create
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 rounded-lg bg-gray-800 py-1 shadow-xl ring-1 ring-gray-700">
          <Link
            href="/create?mode=sell"
            className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
            onClick={() => setOpen(false)}
          >
            Sell NFT
          </Link>
          <Link
            href="/create?mode=buy"
            className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
            onClick={() => setOpen(false)}
          >
            Make Offer
          </Link>
        </div>
      )}
    </div>
  );
}
