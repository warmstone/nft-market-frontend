import { config } from "@/config";
import type {
  Collection,
  CollectionDetail,
  AssetDetail,
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
  getCollections: async () => {
    const res = await fetchAPI<{
      collections: Collection[];
      total: number;
      page: number;
      pageSize: number;
    }>("/api/v1/collections");
    return res.collections;
  },

  getCollection: async (address: string) => {
    const res = await fetchAPI<{
      collection: Collection;
      floorPrice: string | null;
      bestBid: string | null;
      listed: number;
    }>(`/api/v1/collections/${address}`);
    return {
      ...res.collection,
      floorPrice: res.floorPrice || "",
      bestBid: res.bestBid || "",
      listed: res.listed,
    } satisfies CollectionDetail;
  },

  // === Assets ===
  getAsset: (collection: string, tokenId: string) =>
    fetchAPI<AssetDetail>(`/api/v1/assets/${collection}/${tokenId}`),

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
