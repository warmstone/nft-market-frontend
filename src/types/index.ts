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

export interface NFTMetadata {
  collection: string;
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  attributes?: Array<{ trait_type?: string; traitType?: string; value: string | number }>;
  syncedAt: string;
}

export interface AssetDetail {
  collection: Collection | null;
  metadata: NFTMetadata | null;
  tokenId: string;
  listings: Order[];
  offers: Order[];
  activity: Order[];
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
