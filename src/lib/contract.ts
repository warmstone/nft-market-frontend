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
