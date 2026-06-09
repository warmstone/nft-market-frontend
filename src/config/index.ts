export const config = {
  apiBase: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  exchangeAddress: (process.env.NEXT_PUBLIC_EXCHANGE_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  protocolManagerAddress: (process.env.NEXT_PUBLIC_PROTOCOL_MANAGER_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  collectionManagerAddress: (process.env.NEXT_PUBLIC_COLLECTION_MANAGER_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  royaltyManagerAddress: (process.env.NEXT_PUBLIC_ROYALTY_MANAGER_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  wethAddress: (process.env.NEXT_PUBLIC_WETH_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 31337,
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
} as const;
