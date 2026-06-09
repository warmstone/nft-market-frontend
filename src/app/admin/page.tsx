"use client";

import { FormEvent, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { toast } from "sonner";
import { config } from "@/config";
import {
  collectionManagerABI,
  protocolManagerABI,
  royaltyManagerABI,
} from "@/lib/contract";
import { isZeroAddress, shortenAddress } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-[#e8e2d8] bg-white px-3 py-2.5 font-mono text-sm text-[#1a1a1a] placeholder-[#c4bfb8] outline-none transition focus:border-[#b8860b]";
const labelClass =
  "mb-1.5 block font-mono text-xs uppercase tracking-wider text-[#8c8580]";

function isSame(a?: string, b?: string) {
  return !!a && !!b && a.toLowerCase() === b.toLowerCase();
}

function ConfigRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#f0ebe3] py-2 last:border-0">
      <span className="font-mono text-xs uppercase tracking-wider text-[#8c8580]">
        {label}
      </span>
      <span className="font-mono text-xs text-[#1a1a1a]">
        {value && value.startsWith("0x") ? shortenAddress(value) : value || "-"}
      </span>
    </div>
  );
}

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { isLoading: txPending } = useWaitForTransactionReceipt({ hash: txHash });

  const [collectionAddress, setCollectionAddress] = useState("");
  const [paymentToken, setPaymentToken] = useState(config.wethAddress);
  const [feeBps, setFeeBps] = useState("");
  const [feeRecipient, setFeeRecipient] = useState("");
  const [protocolOperator, setProtocolOperator] = useState("");
  const [collectionOperator, setCollectionOperator] = useState("");
  const [royaltyCollection, setRoyaltyCollection] = useState("");
  const [royaltyReceiver, setRoyaltyReceiver] = useState("");
  const [royaltyBps, setRoyaltyBps] = useState("");

  const { data: protocolOwner } = useReadContract({
    address: config.protocolManagerAddress,
    abi: protocolManagerABI,
    functionName: "owner",
    query: { enabled: !isZeroAddress(config.protocolManagerAddress) },
  });
  const { data: protocolOperatorCurrent } = useReadContract({
    address: config.protocolManagerAddress,
    abi: protocolManagerABI,
    functionName: "operator",
    query: { enabled: !isZeroAddress(config.protocolManagerAddress) },
  });
  const { data: protocolFee } = useReadContract({
    address: config.protocolManagerAddress,
    abi: protocolManagerABI,
    functionName: "protocolFeeBPS",
    query: { enabled: !isZeroAddress(config.protocolManagerAddress) },
  });
  const { data: currentFeeRecipient } = useReadContract({
    address: config.protocolManagerAddress,
    abi: protocolManagerABI,
    functionName: "feeRecipient",
    query: { enabled: !isZeroAddress(config.protocolManagerAddress) },
  });
  const { data: tokenAllowed } = useReadContract({
    address: config.protocolManagerAddress,
    abi: protocolManagerABI,
    functionName: "paymentTokenAllowed",
    args: [paymentToken as `0x${string}`],
    query: {
      enabled:
        !isZeroAddress(config.protocolManagerAddress) &&
        paymentToken.startsWith("0x"),
    },
  });

  const { data: collectionOwner } = useReadContract({
    address: config.collectionManagerAddress,
    abi: collectionManagerABI,
    functionName: "owner",
    query: { enabled: !isZeroAddress(config.collectionManagerAddress) },
  });
  const { data: collectionOperatorCurrent } = useReadContract({
    address: config.collectionManagerAddress,
    abi: collectionManagerABI,
    functionName: "operator",
    query: { enabled: !isZeroAddress(config.collectionManagerAddress) },
  });
  const { data: allowlistCount } = useReadContract({
    address: config.collectionManagerAddress,
    abi: collectionManagerABI,
    functionName: "allowlistCount",
    query: { enabled: !isZeroAddress(config.collectionManagerAddress) },
  });
  const { data: collectionAllowed } = useReadContract({
    address: config.collectionManagerAddress,
    abi: collectionManagerABI,
    functionName: "collectionAllowed",
    args: [collectionAddress as `0x${string}`],
    query: {
      enabled:
        !isZeroAddress(config.collectionManagerAddress) &&
        collectionAddress.startsWith("0x"),
    },
  });
  const { data: collectionBlocked } = useReadContract({
    address: config.collectionManagerAddress,
    abi: collectionManagerABI,
    functionName: "collectionBlocked",
    args: [collectionAddress as `0x${string}`],
    query: {
      enabled:
        !isZeroAddress(config.collectionManagerAddress) &&
        collectionAddress.startsWith("0x"),
    },
  });

  const { data: royaltyOwner } = useReadContract({
    address: config.royaltyManagerAddress,
    abi: royaltyManagerABI,
    functionName: "owner",
    query: { enabled: !isZeroAddress(config.royaltyManagerAddress) },
  });

  const isProtocolOwner = isSame(address, protocolOwner);
  const isProtocolOperator = isSame(address, protocolOperatorCurrent);
  const isCollectionOwner = isSame(address, collectionOwner);
  const isCollectionOperator = isSame(address, collectionOperatorCurrent);
  const isRoyaltyOwner = isSame(address, royaltyOwner);

  async function sendTx(label: string, action: () => Promise<`0x${string}`>) {
    try {
      const hash = await action();
      setTxHash(hash);
      toast(`${label} submitted`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `${label} rejected`);
    }
  }

  function requireAddress(value: string, label: string) {
    if (!value.startsWith("0x") || value.length !== 42) {
      toast.error(`${label} must be a 20-byte address`);
      return false;
    }
    return true;
  }

  async function updateProtocolFee(e: FormEvent) {
    e.preventDefault();
    const bps = Number(feeBps);
    if (!Number.isInteger(bps) || bps < 0 || bps > 500) {
      toast.error("Protocol fee must be 0-500 bps");
      return;
    }
    await sendTx("Protocol fee update", () =>
      writeContractAsync({
        address: config.protocolManagerAddress,
        abi: protocolManagerABI,
        functionName: "setProtocolFeeBPS",
        args: [BigInt(bps)],
      })
    );
  }

  async function updateFeeRecipient(e: FormEvent) {
    e.preventDefault();
    if (!requireAddress(feeRecipient, "Fee recipient")) return;
    await sendTx("Fee recipient update", () =>
      writeContractAsync({
        address: config.protocolManagerAddress,
        abi: protocolManagerABI,
        functionName: "setFeeRecipient",
        args: [feeRecipient as `0x${string}`],
      })
    );
  }

  async function updateProtocolOperator(e: FormEvent) {
    e.preventDefault();
    if (!requireAddress(protocolOperator, "Protocol operator")) return;
    await sendTx("Protocol operator update", () =>
      writeContractAsync({
        address: config.protocolManagerAddress,
        abi: protocolManagerABI,
        functionName: "setOperator",
        args: [protocolOperator as `0x${string}`],
      })
    );
  }

  async function updateCollectionOperator(e: FormEvent) {
    e.preventDefault();
    if (!requireAddress(collectionOperator, "Collection operator")) return;
    await sendTx("Collection operator update", () =>
      writeContractAsync({
        address: config.collectionManagerAddress,
        abi: collectionManagerABI,
        functionName: "setOperator",
        args: [collectionOperator as `0x${string}`],
      })
    );
  }

  async function setCollectionAllowed(allowed: boolean) {
    if (!requireAddress(collectionAddress, "Collection")) return;
    await sendTx(allowed ? "Allow collection" : "Remove collection allow", () =>
      writeContractAsync({
        address: config.collectionManagerAddress,
        abi: collectionManagerABI,
        functionName: "setCollectionAllowed",
        args: [collectionAddress as `0x${string}`, allowed],
      })
    );
  }

  async function setCollectionBlocked(blocked: boolean) {
    if (!requireAddress(collectionAddress, "Collection")) return;
    await sendTx(blocked ? "Block collection" : "Unblock collection", () =>
      writeContractAsync({
        address: config.collectionManagerAddress,
        abi: collectionManagerABI,
        functionName: "setCollectionBlocked",
        args: [collectionAddress as `0x${string}`, blocked],
      })
    );
  }

  async function setPaymentTokenAllowed(allowed: boolean) {
    if (!requireAddress(paymentToken, "Payment token")) return;
    await sendTx(allowed ? "Allow payment token" : "Disable payment token", () =>
      writeContractAsync({
        address: config.protocolManagerAddress,
        abi: protocolManagerABI,
        functionName: "setPaymentTokenAllowed",
        args: [paymentToken as `0x${string}`, allowed],
      })
    );
  }

  async function updateRoyalty(e: FormEvent) {
    e.preventDefault();
    if (!requireAddress(royaltyCollection, "Collection")) return;
    if (!requireAddress(royaltyReceiver, "Royalty receiver")) return;
    const bps = Number(royaltyBps);
    if (!Number.isInteger(bps) || bps < 0 || bps > 1000) {
      toast.error("Royalty must be 0-1000 bps");
      return;
    }
    await sendTx("Royalty update", () =>
      writeContractAsync({
        address: config.royaltyManagerAddress,
        abi: royaltyManagerABI,
        functionName: "setRoyalty",
        args: [royaltyCollection as `0x${string}`, royaltyReceiver as `0x${string}`, BigInt(bps)],
      })
    );
  }

  if (!isConnected) {
    return (
      <div className="py-32 text-center">
        <h1 className="font-serif text-4xl font-semibold italic text-[#1a1a1a]">
          Admin
        </h1>
        <p className="mt-4 font-serif text-base text-[#c4bfb8]">
          Connect an owner or operator wallet to manage the market.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-4xl font-semibold italic text-[#1a1a1a]">
            Admin
          </h1>
          <p className="mt-2 font-serif text-sm text-[#8c8580]">
            Manage on-chain market configuration.
          </p>
        </div>
        {txPending && (
          <span className="rounded-md border border-[#e8e2d8] bg-white px-3 py-2 font-mono text-xs text-[#8c8580]">
            Transaction pending
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-md border border-[#e8e2d8] bg-white p-5">
          <h2 className="font-serif text-xl font-semibold text-[#1a1a1a]">
            Protocol
          </h2>
          <div className="mt-4">
            <ConfigRow label="Contract" value={config.protocolManagerAddress} />
            <ConfigRow label="Owner" value={protocolOwner} />
            <ConfigRow label="Operator" value={protocolOperatorCurrent} />
            <ConfigRow label="Fee BPS" value={protocolFee?.toString()} />
            <ConfigRow label="Recipient" value={currentFeeRecipient} />
          </div>
          <div className="mt-4 rounded-md bg-[#f5efe4] px-3 py-2 font-serif text-xs text-[#8c8580]">
            {isProtocolOwner
              ? "Owner controls fees and operator."
              : isProtocolOperator
                ? "Operator can manage payment tokens."
                : "This wallet has no protocol permissions."}
          </div>
        </section>

        <section className="rounded-md border border-[#e8e2d8] bg-white p-5">
          <h2 className="font-serif text-xl font-semibold text-[#1a1a1a]">
            Collections
          </h2>
          <div className="mt-4">
            <ConfigRow label="Contract" value={config.collectionManagerAddress} />
            <ConfigRow label="Owner" value={collectionOwner} />
            <ConfigRow label="Operator" value={collectionOperatorCurrent} />
            <ConfigRow label="Allowlist Count" value={allowlistCount?.toString()} />
          </div>
          <div className="mt-4 rounded-md bg-[#f5efe4] px-3 py-2 font-serif text-xs text-[#8c8580]">
            {isCollectionOwner
              ? "Owner controls operator."
              : isCollectionOperator
                ? "Operator can allow or block collections."
                : "This wallet has no collection permissions."}
          </div>
        </section>

        <section className="rounded-md border border-[#e8e2d8] bg-white p-5">
          <h2 className="font-serif text-xl font-semibold text-[#1a1a1a]">
            Royalties
          </h2>
          <div className="mt-4">
            <ConfigRow label="Contract" value={config.royaltyManagerAddress} />
            <ConfigRow label="Owner" value={royaltyOwner} />
          </div>
          <div className="mt-4 rounded-md bg-[#f5efe4] px-3 py-2 font-serif text-xs text-[#8c8580]">
            {isRoyaltyOwner
              ? "Owner can set fallback royalties."
              : "This wallet has no royalty permissions."}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border border-[#e8e2d8] bg-white p-5">
          <h2 className="font-serif text-xl font-semibold text-[#1a1a1a]">
            Collection Access
          </h2>
          <div className="mt-4">
            <label className={labelClass}>Collection Address</label>
            <input
              value={collectionAddress}
              onChange={(e) => setCollectionAddress(e.target.value)}
              placeholder="0x..."
              className={inputClass}
            />
            {collectionAddress.startsWith("0x") && (
              <div className="mt-3 rounded-md bg-[#f5efe4] px-3 py-2 font-mono text-xs text-[#8c8580]">
                allowed: {String(collectionAllowed)} / blocked: {String(collectionBlocked)}
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setCollectionAllowed(true)}
              disabled={!isCollectionOperator || txPending}
              className="rounded-md bg-[#1a1a1a] px-4 py-2 font-serif text-sm text-[#faf7f2] disabled:opacity-40"
            >
              Allow
            </button>
            <button
              onClick={() => setCollectionAllowed(false)}
              disabled={!isCollectionOperator || txPending}
              className="rounded-md border border-[#e8e2d8] px-4 py-2 font-serif text-sm text-[#6b6560] disabled:opacity-40"
            >
              Remove Allow
            </button>
            <button
              onClick={() => setCollectionBlocked(true)}
              disabled={!isCollectionOperator || txPending}
              className="rounded-md border border-[#c53030] px-4 py-2 font-serif text-sm text-[#c53030] disabled:opacity-40"
            >
              Block
            </button>
            <button
              onClick={() => setCollectionBlocked(false)}
              disabled={!isCollectionOperator || txPending}
              className="rounded-md border border-[#e8e2d8] px-4 py-2 font-serif text-sm text-[#6b6560] disabled:opacity-40"
            >
              Unblock
            </button>
          </div>
        </section>

        <section className="rounded-md border border-[#e8e2d8] bg-white p-5">
          <h2 className="font-serif text-xl font-semibold text-[#1a1a1a]">
            Payment Token
          </h2>
          <div className="mt-4">
            <label className={labelClass}>Token Address</label>
            <input
              value={paymentToken}
              onChange={(e) => setPaymentToken(e.target.value)}
              placeholder="0x..."
              className={inputClass}
            />
            {paymentToken.startsWith("0x") && (
              <div className="mt-3 rounded-md bg-[#f5efe4] px-3 py-2 font-mono text-xs text-[#8c8580]">
                allowed: {String(tokenAllowed)}
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setPaymentTokenAllowed(true)}
              disabled={!isProtocolOperator || txPending}
              className="rounded-md bg-[#1a1a1a] px-4 py-2 font-serif text-sm text-[#faf7f2] disabled:opacity-40"
            >
              Allow Token
            </button>
            <button
              onClick={() => setPaymentTokenAllowed(false)}
              disabled={!isProtocolOperator || txPending}
              className="rounded-md border border-[#e8e2d8] px-4 py-2 font-serif text-sm text-[#6b6560] disabled:opacity-40"
            >
              Disable Token
            </button>
          </div>
        </section>

        <section className="rounded-md border border-[#e8e2d8] bg-white p-5">
          <h2 className="font-serif text-xl font-semibold text-[#1a1a1a]">
            Protocol Settings
          </h2>
          <form onSubmit={updateProtocolFee} className="mt-4 space-y-3">
            <div>
              <label className={labelClass}>Protocol Fee BPS</label>
              <input
                value={feeBps}
                onChange={(e) => setFeeBps(e.target.value)}
                placeholder="50"
                className={inputClass}
              />
            </div>
            <button
              disabled={!isProtocolOwner || txPending}
              className="rounded-md bg-[#1a1a1a] px-4 py-2 font-serif text-sm text-[#faf7f2] disabled:opacity-40"
            >
              Update Fee
            </button>
          </form>
          <form onSubmit={updateFeeRecipient} className="mt-6 space-y-3">
            <div>
              <label className={labelClass}>Fee Recipient</label>
              <input
                value={feeRecipient}
                onChange={(e) => setFeeRecipient(e.target.value)}
                placeholder="0x..."
                className={inputClass}
              />
            </div>
            <button
              disabled={!isProtocolOwner || txPending}
              className="rounded-md bg-[#1a1a1a] px-4 py-2 font-serif text-sm text-[#faf7f2] disabled:opacity-40"
            >
              Update Recipient
            </button>
          </form>
        </section>

        <section className="rounded-md border border-[#e8e2d8] bg-white p-5">
          <h2 className="font-serif text-xl font-semibold text-[#1a1a1a]">
            Operators
          </h2>
          <form onSubmit={updateProtocolOperator} className="mt-4 space-y-3">
            <div>
              <label className={labelClass}>Protocol Operator</label>
              <input
                value={protocolOperator}
                onChange={(e) => setProtocolOperator(e.target.value)}
                placeholder="0x..."
                className={inputClass}
              />
            </div>
            <button
              disabled={!isProtocolOwner || txPending}
              className="rounded-md bg-[#1a1a1a] px-4 py-2 font-serif text-sm text-[#faf7f2] disabled:opacity-40"
            >
              Set Protocol Operator
            </button>
          </form>
          <form onSubmit={updateCollectionOperator} className="mt-6 space-y-3">
            <div>
              <label className={labelClass}>Collection Operator</label>
              <input
                value={collectionOperator}
                onChange={(e) => setCollectionOperator(e.target.value)}
                placeholder="0x..."
                className={inputClass}
              />
            </div>
            <button
              disabled={!isCollectionOwner || txPending}
              className="rounded-md bg-[#1a1a1a] px-4 py-2 font-serif text-sm text-[#faf7f2] disabled:opacity-40"
            >
              Set Collection Operator
            </button>
          </form>
        </section>

        <section className="rounded-md border border-[#e8e2d8] bg-white p-5 lg:col-span-2">
          <h2 className="font-serif text-xl font-semibold text-[#1a1a1a]">
            Fallback Royalty
          </h2>
          <form onSubmit={updateRoyalty} className="mt-4 grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Collection</label>
              <input
                value={royaltyCollection}
                onChange={(e) => setRoyaltyCollection(e.target.value)}
                placeholder="0x..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Receiver</label>
              <input
                value={royaltyReceiver}
                onChange={(e) => setRoyaltyReceiver(e.target.value)}
                placeholder="0x..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>BPS</label>
              <input
                value={royaltyBps}
                onChange={(e) => setRoyaltyBps(e.target.value)}
                placeholder="250"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-4">
              <button
                disabled={!isRoyaltyOwner || txPending}
                className="rounded-md bg-[#1a1a1a] px-4 py-2 font-serif text-sm text-[#faf7f2] disabled:opacity-40"
              >
                Set Royalty
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
