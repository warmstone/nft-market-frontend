"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSWRConfig } from "swr";
import { config } from "@/config";
import type { WsMessage, WsOrderFilledPayload } from "@/types";

export function useWebSocket(collections: string[]) {
  const { mutate } = useSWRConfig();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
