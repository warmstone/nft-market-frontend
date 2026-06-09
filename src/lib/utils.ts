import { formatEther } from "viem";

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
