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

// --- API response wrappers (match backend actual format) ---

export interface CollectionsResponse {
  collections: Collection[] | null;
  total: number;
  page: number;
  pageSize: number;
}

export interface CollectionDetailResponse {
  collection: Collection;
  floorPrice: string;
  bestBid: string;
  listed: number;
}

export interface CollectionStatsResponse {
  collection: string;
  floorPrice: string;
  bestBid: string;
  listed: number;
}

export interface OrdersResponse {
  orders: Order[] | null;
  total: number;
  page: number;
  pageSize: number;
}

export interface OrderSubmitResponse {
  orderHash: string;
  status: string;
}

export interface UserOrdersResponse {
  orders: Order[] | null;
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
