# NFT Market Frontend Design

Date: 2026-06-09 | Version: 1.0

## 1. Overview

Frontend for the NFT Signed Order DEX. Makers browse NFTs, create and sign EIP-712 orders off-chain, and submit them to the Go backend. Takers browse the marketplace, accept orders, and execute trades on-chain via the Exchange contract. The backend provides REST API for queries and WebSocket for real-time updates.

### 1.1 Division of Labor

| Responsibility | Contract | Backend | Frontend |
|---|---|---|---|
| EIP-712 order signing | — | — | viem signTypedData |
| Order storage / search | — | PostgreSQL + REST API | SWR fetch + filters |
| Signature verification | ECDSA on-chain | ECDSA on-submit | — |
| Trade execution | fulfillOrder / acceptOffer | — | viem writeContract |
| Real-time updates | Events | WebSocket push | useWebSocket hook |
| Metadata aggregation | — | tokenURI / IPFS | Display from API |
| Replay protection | cancelledSalt / counter / filled | Event sync → order status | Read only |

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router |
| Language | TypeScript strict |
| Styling | TailwindCSS 3 |
| Wallet | RainbowKit + wagmi v3 |
| Chain interaction | viem (contract reads, writes, EIP-712 signatures) |
| Data fetching | SWR (cache + revalidation) |
| WebSocket | Native WebSocket (`/ws/orders`) |
| Forms | React Hook Form |
| Toast | sonner |

## 3. Routes

```
/                                  Home — collection grid browse
/collection/[address]              Collection detail — order list + stats
/asset/[collection]/[tokenId]      NFT detail — image/attrs + related orders
/create                            Create mode (Sell/Offer) → sign → submit
/profile                           My wallet + active orders + NFTs
```

All pages use `"use client"` for wagmi state and real-time data.

### 3.1 Global Layout (Header)

```
Header
├── Logo + Home link
├── SearchBar (search collection / NFT → navigate)
├── CreateDropdown (Sell / Offer → /create)
└── RainbowKit ConnectButton
```

## 4. Component Tree

### HomePage
- **CollectionGrid** — `GET /api/v1/collections` → card grid with name, symbol, floor price

### CollectionPage
- **CollectionHero** — Collection name, image, description, floor/bestBid/listed stats
- **OrderFilterBar** — Filter by side (Sell/Buy), kind, price range
- **OrderList** — `GET /api/v1/orders?collection=...` + WebSocket live update

### AssetPage
- **NFTViewer** — Image + attributes list
- **OrderPanel** — Active orders for this NFT + "Create Order" entry
- **AcceptButton** — "Buy Now" for sell orders / "Accept Offer" for buy orders

### CreatePage
- **ModeSelector** — Sell vs Buy toggle
- **OrderForm** — price, payment token, start/end time, taker fields
- **NFTPicker** — (Sell) select owned NFT / (Buy) pick collection + tokenId
- **SignButton** — EIP-712 sign → `POST /api/v1/orders`

### ProfilePage
- **WalletSummary** — ETH/WETH balance
- **TabBar** — [Active Orders | My NFTs | History]
- **OrderTab** — `GET /api/v1/users/:address/orders`
- **NFTTab** — User's held NFTs
- **HistoryTab** — Past trade events

## 5. Data Flow

### REST API (fetch + SWR)
```
Page mount → SWR useSWR('/api/v1/orders?...')
           → automatic caching + revalidation on focus
```

### WebSocket (single connection, global)
```
ws://host/ws/orders?collections=0x...,0x...
→ useWebSocket hook
→ on "order:filled" / "order:cancelled" / "order:new" → SWR mutate
```

### Contract Interaction (viem + wagmi)
```
useWriteContract hook:
  1. Read contract ABI
  2. wagmi useWriteContract → simulate → send transaction
  3. wagmi useWaitForTransactionReceipt → confirm
  4. On success → invalidate SWR cache
```

### EIP-712 Signing (viem signTypedData)
```
1. User fills OrderForm
2. viem.signTypedData({ domain, types, primaryType: "Order", message })
3. POST /api/v1/orders with order + signature
4. Backend verifies signature → returns 201
```

## 6. State Management

No global state library. Layered by concern:

| Concern | Solution |
|---|---|
| Backend data queries | SWR (cache + dedup + revalidation) |
| WebSocket pushes | useWebSocket hook + SWR mutate |
| Wallet / chain state | wagmi hooks (useAccount, useBalance, useChainId) |
| Form state | React Hook Form |
| Toast / notifications | sonner |

## 7. Core User Flows

### 7.1 Create Sell Order (Maker signs Sell Order)

1. User clicks "Create" → "Sell"
2. NFTPicker lists user's NFTs (wagmi tokenOfOwnerByIndex / backend index)
3. User selects NFT, fills OrderForm: price (ETH), paymentToken, startTime/endTime, taker (address(0) = public)
4. "Sign & List" → viem signTypedData → `POST /api/v1/orders`
5. Backend verifies signature → 201 → Toast "Order listed" → redirect /profile

### 7.2 Create Buy Offer (Maker signs Buy Order)

1. User clicks "Create" → "Offer"
2. Select collection, enter tokenId
3. Fill OrderForm: price (WETH), paymentToken = WETH, startTime/endTime
4. Check WETH allowance: if allowance < price → "Approve WETH" → approve(Exchange, price)
5. "Sign & Offer" → viem signTypedData (Buy side) → `POST /api/v1/orders`
6. Toast "Offer submitted"

### 7.3 Accept Sell Order (Buy Now)

1. User sees Sell order on Collection/Asset page
2. Click "Buy Now"
3. Checks: order not expired/filled, user has enough balance
4. Call: `Exchange.fulfillOrder(order, signature) { value: price }`
5. Wait confirmation → WebSocket pushes order:filled → SWR refresh
6. Toast "Purchased successfully"

### 7.4 Accept Buy Offer (Accept Offer)

1. User sees Buy order on their NFT
2. Click "Accept Offer"
3. Checks: user holds the tokenId
4. If not approved: setApprovalForAll(Exchange, true)
5. Call: `Exchange.acceptOffer(order, signature, tokenId)`
6. Wait confirmation → Toast

### 7.5 Cancel Order

1. User on /profile → Active Orders tab
2. Click "Cancel" on individual order
3. Call: `Exchange.cancel(salt)` or `Exchange.incrementCounter()` (bulk)
4. WebSocket pushes order:cancelled → page updates

## 8. Key Design Decisions

- **No server-side rendering for data pages** — all data comes from backend API or chain, so pages use `"use client"`. SSR only useful for static layout shell.
- **WETH allowance check before signing Buy orders** — prevent wasted signatures that can't be executed.
- **EIP-712 domain matches contract exactly**: name="NFTMarketExchange", version="1", uint128/uint64 as distinct type names (not uint256).
- **WebSocket connection is per-collection subscription** — client sends `?collections=0x...,0x...` to subscribe to specific collections.
- **SWR as cache layer** — avoids Redux/Context for server state. wagmi already handles chain state.

## 9. Dependencies

```json
{
  "next": "^15",
  "react": "^19",
  "typescript": "^5",
  "tailwindcss": "^3",
  "@rainbow-me/rainbowkit": "^2",
  "wagmi": "^3",
  "viem": "^2",
  "swr": "^2",
  "react-hook-form": "^7",
  "sonner": "^1"
}
```

## 10. Out of Scope (v1)

- GraphQL integration (backend stub only)
- Dutch auction UI (contract struct supports it, backend API supports it, UI deferred)
- CollectionBid / TraitBid / Bundle order kinds
- ERC1155 support
- Mobile responsive (desktop-first, basic responsive acceptable)
- i18n
- Dark mode toggle (dark-only is fine for v1)
