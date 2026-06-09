export const exchangeABI = [
  // fulfillOrder(Order calldata order, bytes calldata signature)
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
  // acceptOffer(Order calldata order, bytes calldata signature, uint256 tokenId)
  {
    name: "acceptOffer",
    type: "function",
    stateMutability: "nonpayable",
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
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
  // cancel(uint256 salt)
  {
    name: "cancel",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "salt", type: "uint256" }],
    outputs: [],
  },
  // incrementCounter()
  {
    name: "incrementCounter",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
] as const;

export const erc721MarketABI = [
  {
    name: "ownerOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "owner", type: "address" }],
  },
  {
    name: "getApproved",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "approved", type: "address" }],
  },
  {
    name: "isApprovedForAll",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "operator", type: "address" },
    ],
    outputs: [{ name: "approved", type: "bool" }],
  },
  {
    name: "setApprovalForAll",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
    ],
    outputs: [],
  },
] as const;

export const erc20MarketABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "allowance", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
] as const;

export const protocolManagerABI = [
  {
    name: "owner",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "owner", type: "address" }],
  },
  {
    name: "operator",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "operator", type: "address" }],
  },
  {
    name: "protocolFeeBPS",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "bps", type: "uint128" }],
  },
  {
    name: "feeRecipient",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "recipient", type: "address" }],
  },
  {
    name: "paymentTokenAllowed",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ name: "allowed", type: "bool" }],
  },
  {
    name: "setProtocolFeeBPS",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "bps", type: "uint128" }],
    outputs: [],
  },
  {
    name: "setFeeRecipient",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "recipient", type: "address" }],
    outputs: [],
  },
  {
    name: "setOperator",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "operator", type: "address" }],
    outputs: [],
  },
  {
    name: "setPaymentTokenAllowed",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "allowed", type: "bool" },
    ],
    outputs: [],
  },
] as const;

export const collectionManagerABI = [
  {
    name: "owner",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "owner", type: "address" }],
  },
  {
    name: "operator",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "operator", type: "address" }],
  },
  {
    name: "allowlistCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "count", type: "uint256" }],
  },
  {
    name: "collectionAllowed",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "collection", type: "address" }],
    outputs: [{ name: "allowed", type: "bool" }],
  },
  {
    name: "collectionBlocked",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "collection", type: "address" }],
    outputs: [{ name: "blocked", type: "bool" }],
  },
  {
    name: "setOperator",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "operator", type: "address" }],
    outputs: [],
  },
  {
    name: "setCollectionAllowed",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "collection", type: "address" },
      { name: "allowed", type: "bool" },
    ],
    outputs: [],
  },
  {
    name: "setCollectionBlocked",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "collection", type: "address" },
      { name: "blocked", type: "bool" },
    ],
    outputs: [],
  },
] as const;

export const royaltyManagerABI = [
  {
    name: "owner",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "owner", type: "address" }],
  },
  {
    name: "manualRoyaltyBPS",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "collection", type: "address" }],
    outputs: [{ name: "bps", type: "uint96" }],
  },
  {
    name: "manualReceiver",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "collection", type: "address" }],
    outputs: [{ name: "receiver", type: "address" }],
  },
  {
    name: "setRoyalty",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "collection", type: "address" },
      { name: "receiver", type: "address" },
      { name: "bps", type: "uint96" },
    ],
    outputs: [],
  },
] as const;
