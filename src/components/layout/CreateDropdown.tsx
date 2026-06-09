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
        className="rounded-md bg-[#1a1a1a] px-5 py-2 font-serif text-sm font-medium text-[#faf7f2] transition hover:bg-[#3d3d3d]"
      >
        Create
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-md border border-[#e8e2d8] bg-white py-1 shadow-lg">
          <Link
            href="/create?mode=sell"
            className="block px-4 py-2.5 font-serif text-sm text-[#1a1a1a] transition hover:bg-[#f5efe4]"
            onClick={() => setOpen(false)}
          >
            Sell NFT
          </Link>
          <Link
            href="/create?mode=buy"
            className="block px-4 py-2.5 font-serif text-sm text-[#1a1a1a] transition hover:bg-[#f5efe4]"
            onClick={() => setOpen(false)}
          >
            Make Offer
          </Link>
        </div>
      )}
    </div>
  );
}
