/**
 * Script: Submit a sell order as Account1 via CLI.
 *
 * Usage:
 *   npx tsx scripts/submit-sell-order.ts [tokenId] [priceInETH]
 *
 * Default: tokenId=1, price=0.001 ETH
 *
 * Flow:
 *   challenge → personal_sign → login (JWT) → EIP-712 sign Order → POST /api/v1/orders
 */

import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

// ============================================================
// Config
// ============================================================

const API_BASE = "http://localhost:8080";
const CHAIN_ID = 11155111;
const EXCHANGE_ADDRESS = "0xaCD4a18E63B01BB04346b2c33f26025d43641a47";
const PANDA_NFT = "0xB5CE1677188754FFf3c5Df158A5e14C0B61c0858";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_BYTES32 = "0x0000000000000000000000000000000000000000000000000000000000000000";

// Account1 private key (from integration.md)
const PRIVATE_KEY = "0x76f358dae4759e8ad90f02c037c86390d0cf0e7980f6f92bae68e7fe01ca2ffe";

const account = privateKeyToAccount(PRIVATE_KEY);
const wallet = createWalletClient({
  account,
  chain: sepolia,
  transport: http(),
});

// ============================================================
// EIP-712 types (must match contract Order struct exactly)
// ============================================================

const ORDER_TYPES = {
  Order: [
    { name: "maker", type: "address" },
    { name: "taker", type: "address" },
    { name: "side", type: "uint8" },
    { name: "kind", type: "uint8" },
    { name: "assetType", type: "uint8" },
    { name: "collection", type: "address" },
    { name: "tokenId", type: "uint256" },
    { name: "amount", type: "uint128" },
    { name: "paymentToken", type: "address" },
    { name: "price", type: "uint128" },
    { name: "startPrice", type: "uint128" },
    { name: "startTime", type: "uint64" },
    { name: "endTime", type: "uint64" },
    { name: "salt", type: "uint256" },
    { name: "counter", type: "uint256" },
    { name: "extra", type: "bytes32" },
  ],
} as const;

const DOMAIN = {
  name: "NFTMarketExchange",
  version: "1",
  chainId: CHAIN_ID,
  verifyingContract: EXCHANGE_ADDRESS,
} as const;

// ============================================================
// Helpers
// ============================================================

function randomSalt(): `0x${string}` {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

async function fetchAPI<T>(path: string, options?: RequestInit, token?: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { headers, ...options });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`[${res.status}] ${body.error || "UNKNOWN"}: ${body.message || res.statusText}`);
  }
  return body as T;
}

// ============================================================
// Main flow
// ============================================================

async function main() {
  const tokenId = process.argv[2] || "1";
  const priceETH = process.argv[3] || "0.001";
  const priceWei = BigInt(Math.floor(parseFloat(priceETH) * 1e18));

  console.log(`=== Submitting Sell Order ===`);
  console.log(`Account:  ${account.address}`);
  console.log(`NFT:      ${PANDA_NFT} #${tokenId}`);
  console.log(`Price:    ${priceETH} ETH (${priceWei} wei)`);
  console.log("");

  // ---- Step 1: Auth ----
  console.log("[1/4] Getting auth challenge...");
  const challengeRes = await fetchAPI<{ challenge: string }>(
    `/api/v1/auth/challenge?address=${account.address}`
  );
  console.log(`       Challenge: ${challengeRes.challenge.slice(0, 60)}...`);

  console.log("[2/4] Signing challenge...");
  const challengeSig = await wallet.signMessage({ message: challengeRes.challenge });
  console.log(`       Signature: ${challengeSig.slice(0, 20)}...`);

  console.log("[3/4] Logging in...");
  const loginRes = await fetchAPI<{ token: string }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ address: account.address, signature: challengeSig }),
  });
  const jwt = loginRes.token;
  console.log(`       JWT: ${jwt.slice(0, 30)}...`);

  // ---- Step 2: EIP-712 sign Order ----
  console.log("[4/4] Signing EIP-712 order & submitting...");
  const salt = randomSalt();
  const now = Math.floor(Date.now() / 1000);
  const maker = account.address;

  const orderMessage = {
    maker: maker as `0x${string}`,
    taker: ZERO_ADDRESS as `0x${string}`,
    side: 0,          // Sell
    kind: 0,          // FixedPrice
    assetType: 0,     // ERC721
    collection: PANDA_NFT as `0x${string}`,
    tokenId: BigInt(tokenId),
    amount: BigInt(1),
    paymentToken: ZERO_ADDRESS as `0x${string}`,   // native ETH
    price: priceWei,
    startPrice: priceWei,
    startTime: BigInt(now),
    endTime: BigInt(now + 86400 * 7),  // 7 days from now
    salt: BigInt(salt),
    counter: BigInt(0),
    extra: ZERO_BYTES32 as `0x${string}`,
  };

  const signature = await wallet.signTypedData({
    domain: DOMAIN,
    types: ORDER_TYPES,
    primaryType: "Order",
    message: orderMessage,
  });

  const orderPayload = {
    maker,
    taker: ZERO_ADDRESS,
    side: 0,
    kind: 0,
    assetType: 0,
    collection: PANDA_NFT,
    tokenId: tokenId,
    amount: "1",
    paymentToken: ZERO_ADDRESS,
    price: priceWei.toString(),
    startPrice: priceWei.toString(),
    startTime: now,
    endTime: now + 86400 * 7,
    salt: salt,
    counter: "0",
    extra: ZERO_BYTES32,
    signature,
  };

  const submitRes = await fetchAPI<{ orderHash: string; status: string }>(
    "/api/v1/orders",
    { method: "POST", body: JSON.stringify(orderPayload) },
    jwt
  );

  console.log("");
  console.log("=== Success! ===");
  console.log(`Order Hash: ${submitRes.orderHash}`);
  console.log(`Status:     ${submitRes.status}`);
  console.log("");
  console.log(`View: http://localhost:3000/collection/${PANDA_NFT}`);
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
