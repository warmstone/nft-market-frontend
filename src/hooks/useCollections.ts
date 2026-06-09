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

export function useAsset(collection: string | undefined, tokenId: string | undefined) {
  return useSWR(
    collection && tokenId ? `asset:${collection}:${tokenId}` : null,
    () => api.getAsset(collection!, tokenId!),
    { revalidateOnFocus: false, dedupingInterval: 10_000 }
  );
}
