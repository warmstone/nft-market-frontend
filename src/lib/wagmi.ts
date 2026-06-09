import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { hardhat, sepolia } from "viem/chains";
import { config as appConfig } from "@/config";

export const wagmiConfig = getDefaultConfig({
  appName: "NFT Market",
  projectId: appConfig.walletConnectProjectId,
  chains: [hardhat, sepolia],
  transports: {
    [hardhat.id]: http(),
    [sepolia.id]: http(),
  },
});

export { hardhat, sepolia };
