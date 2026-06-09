"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import SearchBar from "./SearchBar";
import CreateDropdown from "./CreateDropdown";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="text-lg font-bold text-white">
          NFT Market
        </Link>
        <SearchBar />
        <CreateDropdown />
        <ConnectButton />
      </div>
    </header>
  );
}
