/**
 * Script: Fulfill a sell order on-chain as Account2.
 *
 * Usage:
 *   npx tsx scripts/fulfill-order.ts [orderId]
 *
 * Default: orderId=7 (tokenId=4, price=0.001 ETH — cheapest valid order)
 */

import { createWalletClient, http, getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

// ============================================================
// Config
// ============================================================

const API_BASE = "http://localhost:8080";
const EXCHANGE_ADDRESS = "0xaCD4a18E63B01BB04346b2c33f26025d43641a47";
const RPC_URL = "https://api.web3auth.io/infura-service/v1/0xaa36a7/BF_V-19wdoaEwvSIJMThVH4FLSoc0XqJP7JgNYhIWtZuHTDfOvdvKWtwC7iv9-M1_JuXJ8_Yca7fMOgxoOVEM68";

// Account2 private key
const ACCOUNT2_PK = "0xbbdfdc80464f8cadba388b6bd33f92e1c3a683d204210de0c9e10899fe50e284";

const account = privateKeyToAccount(ACCOUNT2_PK);
const wallet = createWalletClient({
  account,
  chain: sepolia,
  transport: http(RPC_URL),
});

// Exchange ABI — amount: uint256 matches the actual contract (LibOrder.sol)
const exchangeABI = [
  {
    name: "fulfillOrder",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "order",
        type: "tuple",
        components: [
          { name: "maker", type: "address" },
          { name: "taker", type: "address" },
          { name: "side", type: "uint8" },
          { name: "kind", type: "uint8" },
          { name: "assetType", type: "uint8" },
          { name: "collection", type: "address" },
          { name: "tokenId", type: "uint256" },
          { name: "amount", type: "uint256" },
          { name: "paymentToken", type: "address" },
          { name: "price", type: "uint128" },
          { name: "startPrice", type: "uint128" },
          { name: "startTime", type: "uint64" },
          { name: "endTime", type: "uint64" },
          { name: "salt", type: "uint256" },
          { name: "counter", type: "uint256" },
          { name: "extra", type: "bytes32" },
        ],
      },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
  },
] as const;

// ============================================================
// Helpers
// ============================================================

async function fetchOrderById(orderId: number) {
  const res = await fetch(`${API_BASE}/api/v1/orders?pageSize=50`);
  const data = (await res.json()) as any;
  const order = data.orders?.find((o: any) => o.id === orderId);
  if (!order) throw new Error(`Order id=${orderId} not found`);
  return order;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ============================================================
// Main
// ============================================================

async function main() {
  const orderId = parseInt(process.argv[2] || "7");

  console.log("=== Fulfilling Order (on-chain) ===");
  console.log(`Buyer (Account2): ${account.address}`);
  console.log(`Order ID:         ${orderId}`);
  console.log("");

  // ---- Step 1: Fetch order from backend ----
  console.log("[1/3] Fetching order from backend...");
  const order = await fetchOrderById(orderId);
  console.log(`       OrderHash:  ${order.orderHash}`);
  console.log(`       Maker:      ${order.maker}`);
  console.log(`       Collection: ${order.collection}`);
  console.log(`       TokenId:    ${order.tokenId}`);
  console.log(`       Price:      ${order.price} wei (${Number(order.price) / 1e18} ETH)`);
  console.log(`       Status:     ${["Active", "Filled", "Cancelled", "Expired"][order.status]}`);

  if (order.status !== 0) {
    console.log(`       ⚠️  Order is not Active, skipping.`);
    return;
  }

  // ---- Step 2: Call Exchange.fulfillOrder ----
  console.log("");
  console.log("[2/3] Sending fulfillOrder transaction...");

  const orderStruct = {
    maker: order.maker as `0x${string}`,
    taker: order.taker as `0x${string}`,
    side: order.side,
    kind: order.kind,
    assetType: order.assetType,
    collection: order.collection as `0x${string}`,
    tokenId: BigInt(order.tokenId),
    amount: BigInt(order.amount),
    paymentToken: order.paymentToken as `0x${string}`,
    price: BigInt(order.price),
    startPrice: BigInt(order.startPrice),
    startTime: Number(order.startTime),
    endTime: Number(order.endTime),
    salt: BigInt(order.salt),
    counter: BigInt(order.counter),
    extra: order.extra as `0x${string}`,
  };

  const signature = order.signature as `0x${string}`;
  const value = BigInt(order.price);

  try {
    const txHash = await wallet.writeContract({
      chain: sepolia,
      address: EXCHANGE_ADDRESS as `0x${string}`,
      abi: exchangeABI,
      functionName: "fulfillOrder",
      args: [orderStruct, signature],
      value,
      account,
    });
    console.log(`       ✅ Tx submitted!`);
    console.log(`       TxHash: ${txHash}`);

    // ---- Step 3: Wait for watcher to index ----
    console.log("");
    console.log("[3/3] Polling backend for status change (watcher polls every 30s)...");

    for (let i = 0; i < 12; i++) {
      await sleep(5000);
      const updated = await fetchOrderById(orderId);
      const statusName = ["Active", "Filled", "Cancelled", "Expired"][updated.status];
      process.stdout.write(`       ${String(i + 1).padStart(2)}x5s: status=${statusName}     \r`);
      if (updated.status === 1) {
        console.log("");
        console.log("");
        console.log("=== ✅ Order Filled! ===");
        console.log(`TxHash:    ${txHash}`);
        console.log(`OrderHash: ${updated.orderHash}`);
        console.log("");
        console.log(`Etherscan: https://sepolia.etherscan.io/tx/${txHash}`);
        return;
      }
    }
    console.log("");
    console.log("");
    console.log("⚠️  Order not yet Filled after 60s polling.");
    console.log("   The watcher may need more time, or there may be an issue.");
    console.log("   Check: curl http://localhost:8080/api/v1/orders?pageSize=50 | grep -A5 '\"id\": " + orderId);

  } catch (err: any) {
    console.log("");
    console.log("=== ❌ Transaction Failed ===");
    console.log("Error:", err.message);
    if (err.cause) {
      console.log("Cause:", JSON.stringify(err.cause, null, 2));
    }
    // Common reasons:
    // - "Order already filled" → salt was already used
    // - "Maker has insufficient balance" → Account1 doesn't own the token
    // - "ERC721: caller is not token owner or approved" → approval issue
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
