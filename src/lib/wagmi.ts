import { createConfig, injected } from "wagmi";
import { http } from "viem";
import { hardhat, sepolia } from "viem/chains";

export const wagmiConfig = createConfig({
  chains: [hardhat, sepolia],
  connectors: [injected()],
  transports: {
    [hardhat.id]: http(),
    [sepolia.id]: http(),
  },
});

export { hardhat, sepolia };
