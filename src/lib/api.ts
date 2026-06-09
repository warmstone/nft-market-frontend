import { config } from "@/config";
import type {
  Collection,
  CollectionDetail,
  CollectionsResponse,
  CollectionDetailResponse,
  CollectionStatsResponse,
  GlobalStats,
  Order,
  OrdersResponse,
  SubmitOrderRequest,
  OrderSubmitResponse,
  UserOrdersResponse,
} from "@/types";

// --- Auth token (in-memory, survives page navigation but not refresh) ---

let authToken: string | null = null;

export function setAuthToken(token: string) { authToken = token; }
export function getAuthToken(): string | null { return authToken; }
export function clearAuthToken() { authToken = null; }

// --- ApiError ---

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
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  const res = await fetch(`${config.apiBase}${path}`, {
    headers,
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

// --- Auth flow helper ---

export type SignMessage = (message: string) => Promise<`0x${string}`>;

export async function login(address: string, signMessage: SignMessage): Promise<string> {
  // 1. Get challenge
  const challengeRes = await fetchAPI<{ challenge: string }>(
    `/api/v1/auth/challenge?address=${address}`
  );
  // 2. Sign challenge
  const signature = await signMessage(challengeRes.challenge);
  // 3. Login to get JWT
  const loginRes = await fetchAPI<{ token: string }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ address, signature }),
  });
  authToken = loginRes.token;
  return loginRes.token;
}

export const api = {
  // === Auth ===
  login,
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  async getCollections(): Promise<Collection[]> {
    const data = await fetchAPI<CollectionsResponse>("/api/v1/collections");
    return data.collections ?? [];
  },

  async getCollection(address: string): Promise<CollectionDetail> {
    const data = await fetchAPI<CollectionDetailResponse>(
      `/api/v1/collections/${address}`
    );
    return {
      ...data.collection,
      floorPrice: data.floorPrice ?? "0",
      bestBid: data.bestBid ?? "0",
      listed: data.listed ?? 0,
    };
  },

  // === Orders ===
  getOrders: (params: Record<string, string | number | undefined>) => {
    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") searchParams.set(k, String(v));
    }
    return fetchAPI<OrdersResponse>(
      `/api/v1/orders?${searchParams.toString()}`
    );
  },

  getOrder: (hash: string) =>
    fetchAPI<Order>(`/api/v1/orders/${hash}`),

  getBestOrder: (collection: string, side: 0 | 1 = 0) =>
    fetchAPI<Order>(`/api/v1/orders/best?collection=${collection}&side=${side}`),

  submitOrder: (order: SubmitOrderRequest) =>
    fetchAPI<OrderSubmitResponse>("/api/v1/orders", {
      method: "POST",
      body: JSON.stringify(order),
    }),

  // === Users ===
  getUserOrders: (address: string, status?: number) => {
    const qs = status !== undefined ? `?status=${status}` : "";
    return fetchAPI<UserOrdersResponse>(
      `/api/v1/users/${address}/orders${qs}`
    );
  },

  // === Stats ===
  getGlobalStats: () =>
    fetchAPI<GlobalStats>("/api/v1/stats"),

  async getCollectionStats(address: string): Promise<CollectionStatsResponse> {
    return fetchAPI<CollectionStatsResponse>(`/api/v1/stats/${address}`);
  },
};
