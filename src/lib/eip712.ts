import { config } from "@/config";

export const ORDER_TYPES = {
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

export interface EIP712Order {
  maker: `0x${string}`;
  taker: `0x${string}`;
  side: number;
  kind: number;
  assetType: number;
  collection: `0x${string}`;
  tokenId: bigint;
  amount: bigint;
  paymentToken: `0x${string}`;
  price: bigint;
  startPrice: bigint;
  startTime: number;
  endTime: number;
  salt: bigint;
  counter: bigint;
  extra: `0x${string}`;
}

export function getEIP712Domain() {
  return {
    name: "NFTMarketExchange",
    version: "1",
    chainId: config.chainId,
    verifyingContract: config.exchangeAddress as `0x${string}`,
  } as const;
}
