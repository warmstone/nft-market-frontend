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
