# NFT Market Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete frontend for the NFT Signed Order DEX — browse collections, create/sign EIP-712 orders, accept orders on-chain, real-time WebSocket updates.

**Architecture:** Next.js 15 App Router with `"use client"` pages, SWR for server-state caching, wagmi for wallet/chain state, viem for EIP-712 signing and contract writes. No global state library. Single WebSocket connection per collection subscription.

**Tech Stack:** Next.js 15, TypeScript strict, TailwindCSS 3, RainbowKit v2, wagmi v3, viem v2, SWR v2, React Hook Form v7, sonner v1

**Backend API base:** `NEXT_PUBLIC_API_URL` (default `http://localhost:8080`)

---

## File Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx                    — Root layout: Providers + Header + Toaster
│   ├── page.tsx                      — Home: CollectionGrid
│   ├── collection/
│   │   └── [address]/
│   │       └── page.tsx              — Collection detail: Hero + FilterBar + OrderList
│   ├── asset/
│   │   └── [collection]/
│   │       └── [tokenId]/
│   │           └── page.tsx          — Asset detail: NFTViewer + OrderPanel
│   ├── create/
│   │   └── page.tsx                  — Create order: ModeSelector + OrderForm + NFTPicker
│   └── profile/
│       └── page.tsx                  — Profile: WalletSummary + Tabs
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── SearchBar.tsx
│   │   └── CreateDropdown.tsx
│   ├── home/
│   │   └── CollectionCard.tsx
│   ├── collection/
│   │   ├── CollectionHero.tsx
│   │   ├── OrderFilterBar.tsx
│   │   └── OrderCard.tsx
│   ├── asset/
│   │   ├── NFTViewer.tsx
│   │   └── OrderPanel.tsx
│   ├── create/
│   │   ├── ModeSelector.tsx
│   │   ├── OrderForm.tsx
│   │   └── NFTPicker.tsx
│   └── profile/
│       ├── WalletSummary.tsx
│       ├── OrderTab.tsx
│       ├── NFTTab.tsx
│       └── HistoryTab.tsx
├── hooks/
│   ├── useWebSocket.ts
│   ├── useOrders.ts
│   └── useCollections.ts
├── lib/
│   ├── api.ts
│   ├── eip712.ts
│   ├── contract.ts
│   └── utils.ts
├── types/
│   └── index.ts
└── config/
    └── index.ts
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `.env.local`, `src/app/globals.css`, `src/app/layout.tsx` (minimal)

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /home/warms/workspace/nft-market-frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --no-turbopack
```

Expected: creates package.json, tsconfig.json, next.config.js, tailwind.config.ts, src/app/layout.tsx, src/app/globals.css

- [ ] **Step 2: Install additional dependencies**

```bash
npm install @rainbow-me/rainbowkit wagmi viem swr react-hook-form sonner
```

Expected: packages added to package.json and node_modules

- [ ] **Step 3: Create `.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_EXCHANGE_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_CHAIN_ID=31337
```

- [ ] **Step 4: Configure `tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f0ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 5: Replace `src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-950 text-gray-100 antialiased;
}
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```

Expected: Next.js starts on localhost:3000. Kill after verifying.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: scaffold Next.js project with dependencies"
```

---

### Task 2: TypeScript Types

**Files:**
- Create: `src/types/index.ts`

All types match the backend domain model exactly. Numeric fields are decimal strings (matching the backend's `*BigInt` JSON serialization).

- [ ] **Step 1: Create `src/types/index.ts`**

```typescript
// === Enums (match backend domain constants) ===

/** 0=Sell, 1=Buy */
export type OrderSide = 0 | 1;

/** 0=FixedPrice, 1=DutchAuction, 2=CollectionBid, 3=TraitBid, 4=Bundle */
export type OrderKind = 0 | 1 | 2 | 3 | 4;

/** 0=ERC721, 1=ERC1155 */
export type AssetType = 0 | 1;

/** 0=Active, 1=Filled, 2=Cancelled, 3=Expired */
export type OrderStatus = 0 | 1 | 2 | 3;

// === Domain Models ===

export interface Order {
  maker: string;
  taker: string;
  side: OrderSide;
  kind: OrderKind;
  assetType: AssetType;
  collection: string;
  tokenId: string;
  amount: string;
  paymentToken: string;
  price: string;
  startPrice: string;
  startTime: number;
  endTime: number;
  salt: string;
  counter: string;
  extra: string;
  // server metadata
  id: number;
  orderHash: string;
  status: OrderStatus;
  signature: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  address: string;
  chainId: number;
  name: string;
  symbol: string;
  imageUrl: string;
  metadata?: unknown;
  syncedAt: string;
}

export interface CollectionDetail extends Collection {
  floorPrice: string;
  bestBid: string;
  listed: number;
}

export interface GlobalStats {
  totalOrders: number;
  totalCollections: number;
  totalTraders: number;
}

export interface SubmitOrderRequest {
  maker: string;
  taker: string;
  side: OrderSide;
  kind: OrderKind;
  assetType: AssetType;
  collection: string;
  tokenId: string;
  amount: string;
  paymentToken: string;
  price: string;
  startPrice?: string;
  startTime: number;
  endTime: number;
  salt: string;
  extra: string;
  signature: string;
}

export interface PaginatedResponse<T> {
  orders: T[];
  total: number;
  page: number;
  pageSize: number;
}

// === WebSocket Messages ===

export type WsMessageType =
  | "order:filled"
  | "order:cancelled"
  | "order:new"
  | "collection:updated";

export interface WsMessage {
  type: WsMessageType;
  payload: unknown;
}

export interface WsOrderFilledPayload {
  orderHash: string;
  txHash: string;
  finalPrice: string;
}

export interface WsOrderCancelledPayload {
  maker: string;
}

export interface WsCollectionUpdatedPayload {
  collection: string;
  blocked: boolean;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts && git commit -m "feat: add TypeScript types matching backend domain"
```

---

### Task 3: Configuration

**Files:**
- Create: `src/config/index.ts`, `src/lib/contract.ts`
- Modify: `src/app/layout.tsx` (replace with provider-wrapped version)

- [ ] **Step 1: Create `src/config/index.ts`**

```typescript
export const config = {
  apiBase: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  exchangeAddress: (process.env.NEXT_PUBLIC_EXCHANGE_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 31337,
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
} as const;
```

- [ ] **Step 2: Create `src/lib/contract.ts`**

Minimal ABI fragments for the Exchange contract functions used by the frontend.

```typescript
export const exchangeABI = [
  // fulfillOrder(Order calldata order, bytes calldata signature)
  {
    name: "fulfillOrder",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "order",
        type: "tuple",
        components: [
          { name: "maker", type: "address" },
          { name: "taker", type: "address" },
          { name: "side", type: "uint8" },
          { name: "kind", type: "uint8" },
          { name: "assetType", type: "uint8" },
          { name: "collection", type: "address" },
          { name: "tokenId", type: "uint256" },
          { name: "amount", type: "uint128" },
          { name: "paymentToken", type: "address" },
          { name: "price", type: "uint128" },
          { name: "startPrice", type: "uint128" },
          { name: "startTime", type: "uint64" },
          { name: "endTime", type: "uint64" },
          { name: "salt", type: "uint256" },
          { name: "counter", type: "uint256" },
          { name: "extra", type: "bytes32" },
        ],
      },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
  },
  // acceptOffer(Order calldata order, bytes calldata signature, uint256 tokenId)
  {
    name: "acceptOffer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "order",
        type: "tuple",
        components: [
          { name: "maker", type: "address" },
          { name: "taker", type: "address" },
          { name: "side", type: "uint8" },
          { name: "kind", type: "uint8" },
          { name: "assetType", type: "uint8" },
          { name: "collection", type: "address" },
          { name: "tokenId", type: "uint256" },
          { name: "amount", type: "uint128" },
          { name: "paymentToken", type: "address" },
          { name: "price", type: "uint128" },
          { name: "startPrice", type: "uint128" },
          { name: "startTime", type: "uint64" },
          { name: "endTime", type: "uint64" },
          { name: "salt", type: "uint256" },
          { name: "counter", type: "uint256" },
          { name: "extra", type: "bytes32" },
        ],
      },
      { name: "signature", type: "bytes" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
  // cancel(uint256 salt)
  {
    name: "cancel",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "salt", type: "uint256" }],
    outputs: [],
  },
  // incrementCounter()
  {
    name: "incrementCounter",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
] as const;
```

- [ ] **Step 3: Commit**

```bash
git add src/config/index.ts src/lib/contract.ts && git commit -m "feat: add app config and Exchange contract ABI"
```

---

### Task 4: Utility Functions

**Files:**
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Create `src/lib/utils.ts`**

```typescript
import { formatEther, parseEther, type Address } from "viem";

/** Format wei string to ETH with up to 4 decimal places. */
export function formatETH(wei: string): string {
  try {
    const eth = formatEther(BigInt(wei));
    const num = parseFloat(eth);
    if (num === 0) return "0";
    if (num < 0.0001) return "<0.0001";
    return num.toFixed(4).replace(/\.?0+$/, "");
  } catch {
    return "0";
  }
}

/** Shorten address: 0x1234...abcd */
export function shortenAddress(addr: string): string {
  if (addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/** Generate a random salt as a hex string. */
export function randomSalt(): `0x${string}` {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

/** Format a Unix timestamp to relative time. */
export function relativeTime(ts: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = ts - now;
  const abs = Math.abs(diff);
  const mins = Math.floor(abs / 60);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  if (diff < 0) {
    if (days > 0) return `${days}d ago`;
    if (hrs > 0) return `${hrs}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "just now";
  }
  if (days > 0) return `in ${days}d`;
  if (hrs > 0) return `in ${hrs}h`;
  if (mins > 0) return `in ${mins}m`;
  return "soon";
}

/** Check if an address is the zero address (public order). */
export function isZeroAddress(addr: string): boolean {
  return /^0x0+$/.test(addr) || addr === "0x0000000000000000000000000000000000000000";
}

/** Resolve IPFS URL to HTTP gateway. */
export function ipfsURL(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return uri;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/utils.ts && git commit -m "feat: add utility functions for formatting and address handling"
```

---

### Task 5: API Client

**Files:**
- Create: `src/lib/api.ts`

- [ ] **Step 1: Create `src/lib/api.ts`**

```typescript
import { config } from "@/config";
import type {
  Collection,
  CollectionDetail,
  GlobalStats,
  Order,
  PaginatedResponse,
  SubmitOrderRequest,
} from "@/types";

class ApiError extends Error {
  code: string;
  status: number;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function fetchAPI<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${config.apiBase}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body.error || "UNKNOWN",
      body.message || res.statusText
    );
  }
  return res.json();
}

export const api = {
  // === Collections ===
  getCollections: () =>
    fetchAPI<Collection[]>("/api/v1/collections"),

  getCollection: (address: string) =>
    fetchAPI<CollectionDetail>(`/api/v1/collections/${address}`),

  // === Orders ===
  getOrders: (params: Record<string, string | number | undefined>) => {
    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") searchParams.set(k, String(v));
    }
    return fetchAPI<PaginatedResponse<Order>>(
      `/api/v1/orders?${searchParams.toString()}`
    );
  },

  getOrder: (hash: string) =>
    fetchAPI<Order>(`/api/v1/orders/${hash}`),

  getBestOrder: (collection: string, side: 0 | 1 = 0) =>
    fetchAPI<Order>(`/api/v1/orders/best?collection=${collection}&side=${side}`),

  submitOrder: (order: SubmitOrderRequest) =>
    fetchAPI<{ orderHash: string; status: string }>("/api/v1/orders", {
      method: "POST",
      body: JSON.stringify(order),
    }),

  // === Users ===
  getUserOrders: (address: string, status?: number) => {
    const qs = status !== undefined ? `?status=${status}` : "";
    return fetchAPI<{ orders: Order[] }>(
      `/api/v1/users/${address}/orders${qs}`
    );
  },

  // === Stats ===
  getGlobalStats: () =>
    fetchAPI<GlobalStats>("/api/v1/stats"),

  getCollectionStats: (address: string) =>
    fetchAPI<{
      floorPrice: string;
      bestBid: string;
      listedCount: number;
      volume: string;
    }>(`/api/v1/stats/${address}`),
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/api.ts && git commit -m "feat: add API client for all backend endpoints"
```

---

### Task 6: EIP-712 Signing Helper

**Files:**
- Create: `src/lib/eip712.ts`

Types must match the backend's `OrderTypes` in `internal/service/signature.go` so that signatures pass backend verification. The type names `uint128` and `uint64` are used as distinct EIP-712 type names — not replaced with `uint256`.

- [ ] **Step 1: Create `src/lib/eip712.ts`**

```typescript
import { config } from "@/config";

export const ORDER_TYPES = {
  Order: [
    { name: "maker", type: "address" },
    { name: "taker", type: "address" },
    { name: "side", type: "uint8" },
    { name: "kind", type: "uint8" },
    { name: "assetType", type: "uint8" },
    { name: "collection", type: "address" },
    { name: "tokenId", type: "uint256" },
    { name: "amount", type: "uint128" },
    { name: "paymentToken", type: "address" },
    { name: "price", type: "uint128" },
    { name: "startPrice", type: "uint128" },
    { name: "startTime", type: "uint64" },
    { name: "endTime", type: "uint64" },
    { name: "salt", type: "uint256" },
    { name: "counter", type: "uint256" },
    { name: "extra", type: "bytes32" },
  ],
} as const;

export interface EIP712Order {
  maker: `0x${string}`;
  taker: `0x${string}`;
  side: number;
  kind: number;
  assetType: number;
  collection: `0x${string}`;
  tokenId: bigint;
  amount: bigint;
  paymentToken: `0x${string}`;
  price: bigint;
  startPrice: bigint;
  startTime: number;
  endTime: number;
  salt: bigint;
  counter: bigint;
  extra: `0x${string}`;
}

export function getEIP712Domain() {
  return {
    name: "NFTMarketExchange",
    version: "1",
    chainId: config.chainId,
    verifyingContract: config.exchangeAddress as `0x${string}`,
  } as const;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/eip712.ts && git commit -m "feat: add EIP-712 order types and domain helper"
```

---

### Task 7: SWR and WebSocket Hooks

**Files:**
- Create: `src/hooks/useCollections.ts`, `src/hooks/useOrders.ts`, `src/hooks/useWebSocket.ts`

- [ ] **Step 1: Create `src/hooks/useCollections.ts`**

```typescript
import useSWR from "swr";
import { api } from "@/lib/api";
import type { Collection, CollectionDetail } from "@/types";

export function useCollections() {
  return useSWR("collections", () => api.getCollections(), {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });
}

export function useCollection(address: string | undefined) {
  return useSWR(
    address ? `collection:${address}` : null,
    () => api.getCollection(address!),
    { revalidateOnFocus: false, dedupingInterval: 15_000 }
  );
}
```

- [ ] **Step 2: Create `src/hooks/useOrders.ts`**

```typescript
import useSWR from "swr";
import { api } from "@/lib/api";
import type { Order } from "@/types";

interface OrderFilters {
  collection?: string;
  maker?: string;
  side?: 0 | 1;
  kind?: number;
  status?: number;
  minPrice?: string;
  maxPrice?: string;
  tokenId?: string;
  page?: number;
  pageSize?: number;
}

export function useOrders(filters: OrderFilters) {
  const params: Record<string, string | number | undefined> = {};
  for (const [k, v] of Object.entries(filters)) {
    params[k] = v;
  }
  const key = `orders:${JSON.stringify(params)}`;
  return useSWR(key, () => api.getOrders(params), {
    revalidateOnFocus: false,
    dedupingInterval: 10_000,
  });
}

export function useBestOrder(
  collection: string | undefined,
  side: 0 | 1 = 0
) {
  return useSWR(
    collection ? `bestOrder:${collection}:${side}` : null,
    () => api.getBestOrder(collection!, side),
    { revalidateOnFocus: false, dedupingInterval: 15_000 }
  );
}

export function useUserOrders(address: string | undefined, status?: number) {
  return useSWR(
    address ? `userOrders:${address}:${status ?? ""}` : null,
    () => api.getUserOrders(address!, status),
    { revalidateOnFocus: false, dedupingInterval: 10_000 }
  );
}

export function useOrder(hash: string | undefined) {
  return useSWR(
    hash ? `order:${hash}` : null,
    () => api.getOrder(hash!),
    { revalidateOnFocus: false }
  );
}
```

- [ ] **Step 3: Create `src/hooks/useWebSocket.ts`**

WebSocket connection subscribes to collections, receives messages, and calls SWR `mutate` to refresh affected caches on events.

```typescript
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSWRConfig } from "swr";
import { config } from "@/config";
import type { WsMessage, WsOrderFilledPayload } from "@/types";

export function useWebSocket(collections: string[]) {
  const { mutate } = useSWRConfig();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const cols = collections.filter(Boolean).join(",");
    const url = `${config.apiBase}/ws/orders${cols ? `?collections=${cols}` : ""}`;
    // Replace http:// with ws:// or https:// with wss://
    const wsUrl = url.replace(/^http/, "ws");

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);
        switch (msg.type) {
          case "order:filled": {
            const p = msg.payload as WsOrderFilledPayload;
            // Invalidate all order lists and the specific order
            mutate(
              (key) =>
                typeof key === "string" &&
                (key.startsWith("orders:") || key.startsWith("bestOrder:") || key.startsWith("userOrders:"))
            );
            break;
          }
          case "order:cancelled":
          case "order:new":
            mutate(
              (key) =>
                typeof key === "string" &&
                (key.startsWith("orders:") || key.startsWith("bestOrder:") || key.startsWith("userOrders:"))
            );
            break;
          case "collection:updated":
            mutate(
              (key) =>
                typeof key === "string" &&
                (key === "collections" || key.startsWith("collection:"))
            );
            break;
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      reconnectRef.current = setTimeout(connect, 5000);
    };
  }, [collections, mutate]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  return wsRef;
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/ && git commit -m "feat: add SWR data hooks and WebSocket real-time hook"
```

---

### Task 8: Root Layout + Providers

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/layout/Header.tsx` (placeholder)
- Create: `src/components/layout/SearchBar.tsx` (placeholder)
- Create: `src/components/layout/CreateDropdown.tsx` (placeholder)

- [ ] **Step 1: Create `src/components/layout/SearchBar.tsx`**

```typescript
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
```

- [ ] **Step 2: Create `src/components/layout/CreateDropdown.tsx`**

```typescript
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
```

- [ ] **Step 3: Create `src/components/layout/Header.tsx`**

```typescript
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
```

- [ ] **Step 4: Replace `src/app/layout.tsx`**

```typescript
import type { Metadata } from "next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { Providers } from "@/components/layout/Providers";
import { wagmiConfig } from "@/lib/wagmi";
import Header from "@/components/layout/Header";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "NFT Market",
  description: "Decentralized NFT marketplace with signed orders",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SSR cookie hydration for RainbowKit (prevents modal flash)
  const initialState = cookieToInitialState(
    wagmiConfig,
    headers().get("cookie")
  );

  return (
    <html lang="en" className="dark">
      <body>
        <Providers initialState={initialState}>
          <Header />
          <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: { background: "#1f2937", color: "#f3f4f6", border: "1px solid #374151" },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Create `src/lib/wagmi.ts`**

```typescript
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { hardhat, sepolia } from "viem/chains";
import { config as appConfig } from "@/config";

export const wagmiConfig = getDefaultConfig({
  appName: "NFT Market",
  projectId: appConfig.walletConnectProjectId,
  chains: [hardhat, sepolia],
  transports: {
    [hardhat.id]: http(),
    [sepolia.id]: http(),
  },
});

export { hardhat, sepolia };
```

- [ ] **Step 6: Create `src/components/layout/Providers.tsx`**

```typescript
"use client";

import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { wagmiConfig } from "@/lib/wagmi";

import "@rainbow-me/rainbowkit/styles.css";

export function Providers({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState: unknown;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#6366f1",
            borderRadius: "medium",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

- [ ] **Step 7: Verify TypeScript compiles and dev server starts**

```bash
npx tsc --noEmit && npm run dev
```

Expected: no TS errors, dev server starts. Kill after verifying.

- [ ] **Step 8: Commit**

```bash
git add src/lib/wagmi.ts src/components/layout/ src/app/layout.tsx && git commit -m "feat: add root layout with RainbowKit + wagmi providers and header"
```

---

### Task 9: Home Page — Collection Grid

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/home/CollectionCard.tsx`

- [ ] **Step 1: Create `src/components/home/CollectionCard.tsx`**

```typescript
import Link from "next/link";
import { formatETH, ipfsURL } from "@/lib/utils";
import type { Collection } from "@/types";

interface Props {
  collection: Collection & { floorPrice?: string; listed?: number };
}

export default function CollectionCard({ collection }: Props) {
  const imgSrc = collection.imageUrl
    ? ipfsURL(collection.imageUrl)
    : "/placeholder-collection.png";

  return (
    <Link
      href={`/collection/${collection.address}`}
      className="group rounded-xl bg-gray-900 ring-1 ring-gray-800 transition hover:ring-gray-600"
    >
      <div className="aspect-square overflow-hidden rounded-t-xl bg-gray-800">
        <img
          src={imgSrc}
          alt={collection.name}
          className="h-full w-full object-cover transition group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect fill='%23374151' width='100' height='100'/></svg>";
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white truncate">{collection.name}</h3>
        <p className="text-sm text-gray-400 truncate">
          {collection.symbol}
        </p>
        {collection.floorPrice && (
          <p className="mt-2 text-sm">
            <span className="text-gray-500">Floor: </span>
            <span className="text-gray-200">{formatETH(collection.floorPrice)} ETH</span>
          </p>
        )}
        {collection.listed !== undefined && (
          <p className="text-xs text-gray-500">{collection.listed} listed</p>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Replace `src/app/page.tsx`**

```typescript
"use client";

import { useCollections } from "@/hooks/useCollections";
import CollectionCard from "@/components/home/CollectionCard";

export default function HomePage() {
  const { data: collections, error, isLoading } = useCollections();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Explore Collections</h1>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-gray-900 aspect-[3/4]" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-400">
          Failed to load collections. Please try again.
        </div>
      )}

      {collections && collections.length === 0 && (
        <div className="py-20 text-center text-gray-500">
          <p className="text-lg">No collections yet</p>
          <p className="text-sm mt-2">
            Collections will appear here once registered on-chain.
          </p>
        </div>
      )}

      {collections && collections.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {collections.map((c) => (
            <CollectionCard key={c.address} collection={c} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/ src/app/page.tsx && git commit -m "feat: add home page with collection grid"
```

---

### Task 10: Collection Page

**Files:**
- Create: `src/app/collection/[address]/page.tsx`
- Create: `src/components/collection/CollectionHero.tsx`
- Create: `src/components/collection/OrderFilterBar.tsx`
- Create: `src/components/collection/OrderCard.tsx`

- [ ] **Step 1: Create `src/components/collection/CollectionHero.tsx`**

```typescript
import { formatETH, ipfsURL } from "@/lib/utils";
import type { CollectionDetail } from "@/types";

interface Props {
  collection: CollectionDetail;
}

export default function CollectionHero({ collection }: Props) {
  return (
    <div className="mb-8">
      {collection.imageUrl && (
        <img
          src={ipfsURL(collection.imageUrl)}
          alt={collection.name}
          className="mb-4 h-24 w-24 rounded-full ring-2 ring-gray-700"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <h1 className="text-3xl font-bold text-white">{collection.name}</h1>
      <p className="text-gray-400">{collection.symbol}</p>
      <div className="mt-4 flex gap-6 text-sm">
        <div>
          <span className="text-gray-500">Floor</span>
          <p className="text-white font-medium">
            {collection.floorPrice ? `${formatETH(collection.floorPrice)} ETH` : "—"}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Best Bid</span>
          <p className="text-white font-medium">
            {collection.bestBid ? `${formatETH(collection.bestBid)} ETH` : "—"}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Listed</span>
          <p className="text-white font-medium">{collection.listed}</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/collection/OrderFilterBar.tsx`**

```typescript
"use client";

interface Props {
  side: "" | "0" | "1";
  kind: string;
  minPrice: string;
  maxPrice: string;
  onSideChange: (v: "" | "0" | "1") => void;
  onKindChange: (v: string) => void;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
}

export default function OrderFilterBar({
  side,
  kind,
  minPrice,
  maxPrice,
  onSideChange,
  onKindChange,
  onMinPriceChange,
  onMaxPriceChange,
}: Props) {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <select
        value={side}
        onChange={(e) => onSideChange(e.target.value as "" | "0" | "1")}
        className="rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 ring-1 ring-gray-700"
      >
        <option value="">All Sides</option>
        <option value="0">Sell (Listings)</option>
        <option value="1">Buy (Offers)</option>
      </select>

      <select
        value={kind}
        onChange={(e) => onKindChange(e.target.value)}
        className="rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 ring-1 ring-gray-700"
      >
        <option value="">All Kinds</option>
        <option value="0">Fixed Price</option>
        <option value="1">Dutch Auction</option>
      </select>

      <input
        type="text"
        placeholder="Min price (ETH)"
        value={minPrice}
        onChange={(e) => onMinPriceChange(e.target.value)}
        className="rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 ring-1 ring-gray-700 placeholder-gray-500 w-36"
      />

      <input
        type="text"
        placeholder="Max price (ETH)"
        value={maxPrice}
        onChange={(e) => onMaxPriceChange(e.target.value)}
        className="rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 ring-1 ring-gray-700 placeholder-gray-500 w-36"
      />
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/collection/OrderCard.tsx`**

```typescript
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatETH, shortenAddress, relativeTime, isZeroAddress } from "@/lib/utils";
import { config } from "@/config";
import type { Order } from "@/types";

interface Props {
  order: Order;
}

export default function OrderCard({ order }: Props) {
  const { address } = useAccount();
  const isSell = order.side === 0;
  const isOwner = address?.toLowerCase() === order.maker.toLowerCase();

  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-900 p-4 ring-1 ring-gray-800">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm font-medium text-white">
            {isSell ? "Listed" : "Offer"} · #
            {order.tokenId.length > 12
              ? shortenAddress(order.tokenId)
              : order.tokenId}
          </p>
          <p className="text-xs text-gray-500">
            by {shortenAddress(order.maker)}{" "}
            {isZeroAddress(order.taker) ? "" : `for ${shortenAddress(order.taker)}`}
            {order.endTime > 0 && ` · Expires ${relativeTime(order.endTime)}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <p className="text-lg font-semibold text-white">
          {formatETH(order.price)} ETH
        </p>
        <div className="flex gap-2">
          <Link
            href={`/asset/${order.collection}/${order.tokenId}`}
            className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700"
          >
            View
          </Link>
          {!isOwner && order.status === 0 && (
            <Link
              href={`/asset/${order.collection}/${order.tokenId}`}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs text-white hover:bg-brand-700"
            >
              {isSell ? "Buy" : "Accept"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/app/collection/[address]/page.tsx`**

```typescript
"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useCollection } from "@/hooks/useCollections";
import { useOrders } from "@/hooks/useOrders";
import { useWebSocket } from "@/hooks/useWebSocket";
import CollectionHero from "@/components/collection/CollectionHero";
import OrderFilterBar from "@/components/collection/OrderFilterBar";
import OrderCard from "@/components/collection/OrderCard";

export default function CollectionPage() {
  const params = useParams();
  const address = params.address as string;

  const [side, setSide] = useState<"" | "0" | "1">("");
  const [kind, setKind] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { data: collection, isLoading: colLoading } = useCollection(address);
  const { data: ordersData, isLoading: ordersLoading } = useOrders({
    collection: address,
    side: side ? (Number(side) as 0 | 1) : undefined,
    kind: kind ? Number(kind) : undefined,
    status: 0,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    pageSize: 50,
  });

  useWebSocket([address]);

  return (
    <div>
      {colLoading && (
        <div className="mb-8 animate-pulse">
          <div className="h-24 w-24 rounded-full bg-gray-800 mb-4" />
          <div className="h-8 w-48 bg-gray-800 rounded mb-2" />
          <div className="h-4 w-24 bg-gray-800 rounded" />
        </div>
      )}

      {collection && <CollectionHero collection={collection} />}

      <OrderFilterBar
        side={side}
        kind={kind}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onSideChange={setSide}
        onKindChange={setKind}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
      />

      {ordersLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-900" />
          ))}
        </div>
      )}

      {ordersData && ordersData.orders.length === 0 && (
        <div className="py-16 text-center text-gray-500">
          No active orders for this collection.
        </div>
      )}

      {ordersData && ordersData.orders.length > 0 && (
        <div className="space-y-3">
          {ordersData.orders.map((order) => (
            <OrderCard key={order.orderHash} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/collection/ src/components/collection/ && git commit -m "feat: add collection page with hero, filters, and order list"
```

---

### Task 11: Asset Page

**Files:**
- Create: `src/app/asset/[collection]/[tokenId]/page.tsx`
- Create: `src/components/asset/NFTViewer.tsx`
- Create: `src/components/asset/OrderPanel.tsx`

- [ ] **Step 1: Create `src/components/asset/NFTViewer.tsx`**

```typescript
import { ipfsURL } from "@/lib/utils";

interface Attribute {
  trait_type: string;
  value: string;
}

interface Props {
  name: string;
  imageUrl: string;
  description?: string;
  attributes?: Attribute[];
}

export default function NFTViewer({ name, imageUrl, description, attributes }: Props) {
  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-xl bg-gray-900 ring-1 ring-gray-800">
        <img
          src={ipfsURL(imageUrl)}
          alt={name}
          className="h-full w-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect fill='%23374151' width='200' height='200'/></svg>";
          }}
        />
      </div>
      <h2 className="mt-4 text-xl font-bold text-white">{name}</h2>
      {description && (
        <p className="mt-2 text-sm text-gray-400">{description}</p>
      )}
      {attributes && attributes.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {attributes.map((attr) => (
            <div
              key={attr.trait_type}
              className="rounded-lg bg-gray-900 p-3 ring-1 ring-gray-800"
            >
              <p className="text-xs text-gray-500 uppercase">{attr.trait_type}</p>
              <p className="text-sm text-gray-200 truncate">{attr.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/asset/OrderPanel.tsx`**

This is the core trading panel. It shows active orders for the NFT, buy/accept buttons, and handles contract interaction.

```typescript
"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";
import { useOrders } from "@/hooks/useOrders";
import { exchangeABI } from "@/lib/contract";
import { config } from "@/config";
import { formatETH, shortenAddress } from "@/lib/utils";
import type { Order } from "@/types";

interface Props {
  collection: string;
  tokenId: string;
}

export default function OrderPanel({ collection, tokenId }: Props) {
  const { address } = useAccount();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { data: sellOrders } = useOrders({
    collection,
    tokenId,
    side: 0,
    status: 0,
    pageSize: 10,
  });
  const { data: buyOrders } = useOrders({
    collection,
    tokenId,
    side: 1,
    status: 0,
    pageSize: 10,
  });

  const { writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
    onSuccess() {
      toast.success("Transaction confirmed!");
      setTxHash(undefined);
    },
    onError() {
      toast.error("Transaction failed");
      setTxHash(undefined);
    },
  });

  async function handleBuy(order: Order) {
    if (!address) {
      toast.error("Connect your wallet first");
      return;
    }
    try {
      const hash = await writeContractAsync({
        address: config.exchangeAddress,
        abi: exchangeABI,
        functionName: "fulfillOrder",
        args: [
          {
            maker: order.maker as `0x${string}`,
            taker: order.taker as `0x${string}`,
            side: order.side,
            kind: order.kind,
            assetType: order.assetType,
            collection: order.collection as `0x${string}`,
            tokenId: BigInt(order.tokenId),
            amount: BigInt(order.amount),
            paymentToken: order.paymentToken as `0x${string}`,
            price: BigInt(order.price),
            startPrice: BigInt(order.startPrice),
            startTime: order.startTime,
            endTime: order.endTime,
            salt: BigInt(order.salt),
            counter: BigInt(order.counter),
            extra: order.extra as `0x${string}`,
          },
          order.signature as `0x${string}`,
        ],
        value: BigInt(order.price),
      });
      setTxHash(hash);
      toast.loading("Transaction submitted...");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transaction rejected");
    }
  }

  async function handleAcceptOffer(order: Order) {
    if (!address) {
      toast.error("Connect your wallet first");
      return;
    }
    try {
      const hash = await writeContractAsync({
        address: config.exchangeAddress,
        abi: exchangeABI,
        functionName: "acceptOffer",
        args: [
          {
            maker: order.maker as `0x${string}`,
            taker: order.taker as `0x${string}`,
            side: order.side,
            kind: order.kind,
            assetType: order.assetType,
            collection: order.collection as `0x${string}`,
            tokenId: BigInt(order.tokenId),
            amount: BigInt(order.amount),
            paymentToken: order.paymentToken as `0x${string}`,
            price: BigInt(order.price),
            startPrice: BigInt(order.startPrice),
            startTime: order.startTime,
            endTime: order.endTime,
            salt: BigInt(order.salt),
            counter: BigInt(order.counter),
            extra: order.extra as `0x${string}`,
          },
          order.signature as `0x${string}`,
          BigInt(tokenId),
        ],
      });
      setTxHash(hash);
      toast.loading("Transaction submitted...");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transaction rejected");
    }
  }

  const isPending = isConfirming || !!txHash;

  return (
    <div className="space-y-6">
      {/* Sell Orders (Listings) */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-white">Listings</h3>
        {sellOrders?.orders.length === 0 && (
          <p className="text-sm text-gray-500">No listings for this NFT.</p>
        )}
        {sellOrders?.orders.map((order) => (
          <div
            key={order.orderHash}
            className="flex items-center justify-between rounded-lg bg-gray-900 p-4 ring-1 ring-gray-800"
          >
            <div>
              <p className="text-lg font-semibold text-white">
                {formatETH(order.price)} ETH
              </p>
              <p className="text-xs text-gray-500">
                by {shortenAddress(order.maker)}
              </p>
            </div>
            <button
              onClick={() => handleBuy(order)}
              disabled={isPending}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {isPending ? "Pending..." : "Buy Now"}
            </button>
          </div>
        ))}
      </div>

      {/* Buy Orders (Offers) */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-white">Offers</h3>
        {buyOrders?.orders.length === 0 && (
          <p className="text-sm text-gray-500">No offers for this NFT.</p>
        )}
        {buyOrders?.orders.map((order) => (
          <div
            key={order.orderHash}
            className="flex items-center justify-between rounded-lg bg-gray-900 p-4 ring-1 ring-gray-800"
          >
            <div>
              <p className="text-lg font-semibold text-white">
                {formatETH(order.price)} WETH
              </p>
              <p className="text-xs text-gray-500">
                by {shortenAddress(order.maker)}
              </p>
            </div>
            <button
              onClick={() => handleAcceptOffer(order)}
              disabled={isPending}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {isPending ? "Pending..." : "Accept Offer"}
            </button>
          </div>
        ))}
      </div>

      {/* Create link */}
      <a
        href={`/create?collection=${collection}&tokenId=${tokenId}`}
        className="block text-center text-sm text-brand-500 hover:underline"
      >
        + Create order for this NFT
      </a>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/app/asset/[collection]/[tokenId]/page.tsx`**

```typescript
"use client";

import { useParams } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import NFTViewer from "@/components/asset/NFTViewer";
import OrderPanel from "@/components/asset/OrderPanel";

export default function AssetPage() {
  const params = useParams();
  const collection = params.collection as string;
  const tokenId = params.tokenId as string;

  useWebSocket([collection]);

  // In v1, NFT metadata is displayed from the order/collection context.
  // The backend aggregates tokenURI data; for now we display what's available.
  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-2">
        <NFTViewer
          name={`${collection.slice(0, 8)}... #${tokenId}`}
          imageUrl=""
        />
        <div>
          <h1 className="mb-4 text-2xl font-bold text-white">
            NFT #{tokenId}
          </h1>
          <p className="mb-6 text-sm text-gray-400 break-all">
            Collection: {collection}
          </p>
          <OrderPanel collection={collection} tokenId={tokenId} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/asset/ src/components/asset/ && git commit -m "feat: add asset detail page with NFT viewer and trade panel"
```

---

### Task 12: Create Page — Order Form

**Files:**
- Create: `src/app/create/page.tsx`
- Create: `src/components/create/ModeSelector.tsx`
- Create: `src/components/create/OrderForm.tsx`
- Create: `src/components/create/NFTPicker.tsx`

- [ ] **Step 1: Create `src/components/create/ModeSelector.tsx`**

```typescript
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
```

- [ ] **Step 2: Create `src/components/create/NFTPicker.tsx`**

A simple input-based picker. In production this would query the user's NFTs from chain, but v1 uses manual entry.

```typescript
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
```

- [ ] **Step 3: Create `src/components/create/OrderForm.tsx`**

Uses React Hook Form for the price/time fields. The EIP-712 signing and API submission are handled in the parent page.

```typescript
"use client";

import { useForm } from "react-hook-form";
import { parseEther } from "viem";

export interface OrderFormValues {
  price: string;       // ETH amount
  startPrice: string;  // Dutch auction start price (same as price for fixed)
  startTime: string;   // ISO datetime-local
  endTime: string;     // ISO datetime-local (empty = never expires)
  taker: string;       // address(0) = public
  paymentToken: string;
}

interface Props {
  mode: "sell" | "buy";
  onSubmit: (values: OrderFormValues) => void;
  isPending: boolean;
}

export default function OrderForm({ mode, onSubmit, isPending }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormValues>({
    defaultValues: {
      price: "",
      startPrice: "",
      startTime: "",
      endTime: "",
      taker: "",
      paymentToken: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-sm font-medium text-gray-300">Order Details</h3>

      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Price ({mode === "sell" ? "ETH" : "WETH"})
        </label>
        <input
          type="text"
          placeholder="0.1"
          {...register("price", {
            required: "Price is required",
            pattern: {
              value: /^\d*\.?\d*$/,
              message: "Invalid number",
            },
          })}
          className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 ring-1 ring-gray-700 placeholder-gray-500"
        />
        {errors.price && (
          <p className="mt-1 text-xs text-red-400">{errors.price.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Start Time
        </label>
        <input
          type="datetime-local"
          {...register("startTime", { required: "Start time is required" })}
          className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 ring-1 ring-gray-700"
        />
        {errors.startTime && (
          <p className="mt-1 text-xs text-red-400">{errors.startTime.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">
          End Time (empty = never expires)
        </label>
        <input
          type="datetime-local"
          {...register("endTime")}
          className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 ring-1 ring-gray-700"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Taker (empty = public)
        </label>
        <input
          type="text"
          placeholder="0x... or empty"
          {...register("taker", {
            validate: (v) =>
              !v || v.startsWith("0x") || "Must be a hex address",
          })}
          className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 ring-1 ring-gray-700 placeholder-gray-500 font-mono"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Payment Token (empty = {mode === "sell" ? "ETH" : "WETH"})
        </label>
        <input
          type="text"
          placeholder="0x... or empty"
          {...register("paymentToken", {
            validate: (v) =>
              !v || v.startsWith("0x") || "Must be a hex address",
          })}
          className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 ring-1 ring-gray-700 placeholder-gray-500 font-mono"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {isPending
          ? "Signing..."
          : mode === "sell"
          ? "Sign & List"
          : "Sign & Offer"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Create `src/app/create/page.tsx`**

The page orchestrates: mode selection, NFT picker, form, EIP-712 signing via viem, and API submission.

```typescript
"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount, useSignTypedData } from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";
import { config } from "@/config";
import { api } from "@/lib/api";
import { ORDER_TYPES, getEIP712Domain } from "@/lib/eip712";
import { randomSalt } from "@/lib/utils";
import ModeSelector from "@/components/create/ModeSelector";
import OrderForm, { type OrderFormValues } from "@/components/create/OrderForm";
import NFTPicker from "@/components/create/NFTPicker";

function CreatePageInner() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") || "sell") as "sell" | "buy";
  const { address } = useAccount();

  const [collection, setCollection] = useState(
    searchParams.get("collection") || ""
  );
  const [tokenId, setTokenId] = useState(searchParams.get("tokenId") || "");
  const [isPending, setIsPending] = useState(false);
  const { signTypedDataAsync } = useSignTypedData();

  async function handleSubmit(values: OrderFormValues) {
    if (!address) {
      toast.error("Connect your wallet first");
      return;
    }
    if (!collection || !tokenId) {
      toast.error("Enter collection address and token ID");
      return;
    }

    setIsPending(true);
    try {
      const salt = randomSalt();
      const priceWei = values.price ? parseEther(values.price) : 0n;
      const startTime = values.startTime
        ? Math.floor(new Date(values.startTime).getTime() / 1000)
        : Math.floor(Date.now() / 1000);
      const endTime = values.endTime
        ? Math.floor(new Date(values.endTime).getTime() / 1000)
        : 0;
      const paymentToken =
        values.paymentToken || "0x0000000000000000000000000000000000000000";
      const taker =
        values.taker || "0x0000000000000000000000000000000000000000";

      const signature = await signTypedDataAsync({
        domain: getEIP712Domain(),
        types: ORDER_TYPES,
        primaryType: "Order",
        message: {
          maker: address,
          taker: taker as `0x${string}`,
          side: mode === "sell" ? 0 : 1,
          kind: 0, // FixedPrice for v1
          assetType: 0, // ERC721 for v1
          collection: collection as `0x${string}`,
          tokenId: BigInt(tokenId),
          amount: BigInt(1),
          paymentToken: paymentToken as `0x${string}`,
          price: priceWei,
          startPrice: priceWei,
          startTime,
          endTime,
          salt: BigInt(salt),
          counter: BigInt(0),
          extra: "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      });

      await api.submitOrder({
        maker: address,
        taker,
        side: mode === "sell" ? 0 : 1,
        kind: 0,
        assetType: 0,
        collection,
        tokenId,
        amount: "1",
        paymentToken,
        price: priceWei.toString(),
        startPrice: priceWei.toString(),
        startTime,
        endTime,
        salt,
        extra: "0x0000000000000000000000000000000000000000000000000000000000000000",
        signature,
      });

      toast.success(
        mode === "sell" ? "Order listed!" : "Offer submitted!"
      );
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Something went wrong";
      // Don't toast for user-rejected signatures
      if (!msg.includes("rejected") && !msg.includes("denied")) {
        toast.error(msg);
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-white">
        {mode === "sell" ? "Create Listing" : "Make Offer"}
      </h1>

      <ModeSelector />
      <NFTPicker
        mode={mode}
        collection={collection}
        tokenId={tokenId}
        onCollectionChange={setCollection}
        onTokenIdChange={setTokenId}
      />
      <div className="mt-6">
        <OrderForm mode={mode} onSubmit={handleSubmit} isPending={isPending} />
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg animate-pulse">
          <div className="h-8 w-48 bg-gray-800 rounded mb-6" />
          <div className="h-40 bg-gray-900 rounded-xl" />
        </div>
      }
    >
      <CreatePageInner />
    </Suspense>
  );
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/create/ src/components/create/ && git commit -m "feat: add create order page with EIP-712 signing"
```

---

### Task 13: Profile Page

**Files:**
- Create: `src/app/profile/page.tsx`
- Create: `src/components/profile/WalletSummary.tsx`
- Create: `src/components/profile/OrderTab.tsx`
- Create: `src/components/profile/NFTTab.tsx`
- Create: `src/components/profile/HistoryTab.tsx`

- [ ] **Step 1: Create `src/components/profile/WalletSummary.tsx`**

```typescript
"use client";

import { useAccount, useBalance } from "wagmi";
import { formatETH, shortenAddress } from "@/lib/utils";

export default function WalletSummary() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  if (!address) return null;

  return (
    <div className="mb-8 rounded-xl bg-gray-900 p-6 ring-1 ring-gray-800">
      <h2 className="text-sm text-gray-500 mb-1">Connected Wallet</h2>
      <p className="text-lg font-mono text-white">{shortenAddress(address)}</p>
      <p className="mt-2 text-2xl font-bold text-white">
        {balance ? `${formatETH(balance.value.toString())} ${balance.symbol}` : "—"}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/profile/OrderTab.tsx`**

```typescript
"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { useUserOrders } from "@/hooks/useOrders";
import { formatETH, shortenAddress, relativeTime } from "@/lib/utils";
import { exchangeABI } from "@/lib/contract";
import { config } from "@/config";
import type { Order } from "@/types";
import { useState } from "react";

function CancelButton({ order }: { order: Order }) {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { writeContractAsync } = useWriteContract();
  useWaitForTransactionReceipt({
    hash: txHash,
    onSuccess() {
      toast.success("Order cancelled");
      setTxHash(undefined);
    },
    onError() {
      toast.error("Cancel failed");
      setTxHash(undefined);
    },
  });

  async function handleCancel() {
    try {
      const hash = await writeContractAsync({
        address: config.exchangeAddress,
        abi: exchangeABI,
        functionName: "cancel",
        args: [BigInt(order.salt)],
      });
      setTxHash(hash);
      toast.loading("Cancelling...");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Cancel rejected");
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={!!txHash}
      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700 disabled:opacity-50"
    >
      {txHash ? "Pending..." : "Cancel"}
    </button>
  );
}

export default function OrderTab() {
  const { address } = useAccount();
  const { data, isLoading } = useUserOrders(address, 0); // Active only

  if (!address) {
    return <p className="text-gray-500">Connect your wallet to see orders.</p>;
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-900" />
        ))}
      </div>
    );
  }

  if (!data?.orders.length) {
    return <p className="text-gray-500 py-8 text-center">No active orders.</p>;
  }

  return (
    <div className="space-y-3">
      {data.orders.map((order) => (
        <div
          key={order.orderHash}
          className="flex items-center justify-between rounded-lg bg-gray-900 p-4 ring-1 ring-gray-800"
        >
          <div>
            <p className="text-sm font-medium text-white">
              {order.side === 0 ? "Sell" : "Buy"} · #
              {order.tokenId.length > 12
                ? shortenAddress(order.tokenId)
                : order.tokenId}
            </p>
            <p className="text-xs text-gray-500">
              {formatETH(order.price)} ETH
              {order.endTime > 0 && ` · Expires ${relativeTime(order.endTime)}`}
            </p>
          </div>
          <CancelButton order={order} />
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/profile/NFTTab.tsx`**

```typescript
"use client";

import { useAccount } from "wagmi";

export default function NFTTab() {
  const { address } = useAccount();

  if (!address) {
    return <p className="text-gray-500">Connect your wallet to see NFTs.</p>;
  }

  return (
    <div className="py-12 text-center text-gray-500">
      <p>NFT browsing coming soon.</p>
      <p className="text-sm mt-2">
        Use the search bar or collection pages to find your NFTs.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/profile/HistoryTab.tsx`**

```typescript
"use client";

import { useAccount } from "wagmi";

export default function HistoryTab() {
  const { address } = useAccount();

  if (!address) {
    return <p className="text-gray-500">Connect your wallet to see history.</p>;
  }

  return (
    <div className="py-12 text-center text-gray-500">
      <p>Trade history coming soon.</p>
      <p className="text-sm mt-2">
        Past fill events will appear here.
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Create `src/app/profile/page.tsx`**

```typescript
"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import WalletSummary from "@/components/profile/WalletSummary";
import OrderTab from "@/components/profile/OrderTab";
import NFTTab from "@/components/profile/NFTTab";
import HistoryTab from "@/components/profile/HistoryTab";

const TABS = ["Active Orders", "My NFTs", "History"] as const;

export default function ProfilePage() {
  const { isConnected } = useAccount();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Active Orders");

  if (!isConnected) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Profile</h1>
        <p className="text-gray-500">Connect your wallet to view your profile.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Profile</h1>
      <WalletSummary />

      <div className="mb-6 flex gap-1 rounded-lg bg-gray-900 p-1 ring-1 ring-gray-800">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${
              tab === t
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Active Orders" && <OrderTab />}
      {tab === "My NFTs" && <NFTTab />}
      {tab === "History" && <HistoryTab />}
    </div>
  );
}
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/profile/ src/components/profile/ && git commit -m "feat: add profile page with orders and wallet summary"
```

---

### Task 14: Final Integration & Polish

**Files:**
- Check: all files compile, dev server runs, all pages load

- [ ] **Step 1: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors. If errors, fix and re-check.

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: successful build. Fix any build errors.

- [ ] **Step 3: Start dev server and verify all routes**

```bash
npm run dev
```

Manual verification checklist:
- `/` — loads, shows collection grid or empty state
- `/collection/0x...` — loads, shows collection detail + orders
- `/asset/0x.../1` — loads, shows NFT detail + order panel
- `/create?mode=sell` — loads form, shows sell mode
- `/create?mode=buy` — loads form, shows buy mode
- `/profile` — loads, shows connect prompt

- [ ] **Step 4: Add `@/` path alias to `tsconfig.json`**

If not already set by create-next-app, ensure path aliases work:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- [ ] **Step 5: Commit any remaining changes**

```bash
git add -A && git commit -m "chore: final integration fixes and polish"
```
