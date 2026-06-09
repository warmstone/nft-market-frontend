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
