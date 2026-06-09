"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import SearchBar from "./SearchBar";
import CreateDropdown from "./CreateDropdown";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e8e2d8] bg-[#faf7f2]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        <Link
          href="/"
          className="font-serif text-xl font-semibold italic tracking-tight text-[#1a1a1a]"
        >
          Gallery
        </Link>
        <SearchBar />
        <CreateDropdown />
        <ConnectButton />
      </div>
    </header>
  );
}
