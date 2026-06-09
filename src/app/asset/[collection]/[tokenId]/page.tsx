"use client";

import { useParams } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { shortenAddress } from "@/lib/utils";
import NFTViewer from "@/components/asset/NFTViewer";
import OrderPanel from "@/components/asset/OrderPanel";

export default function AssetPage() {
  const params = useParams();
  const collection = params.collection as string;
  const tokenId = params.tokenId as string;

  useWebSocket([collection]);

  return (
    <div>
      <div className="grid gap-12 lg:grid-cols-2">
        <NFTViewer
          name={`Work #${tokenId}`}
          imageUrl=""
        />
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#1a1a1a]">
            #{tokenId}
          </h1>
          <p className="mt-3 font-mono text-sm text-[#8c8580] break-all">
            {shortenAddress(collection)}
          </p>
          <div className="mt-8">
            <OrderPanel collection={collection} tokenId={tokenId} />
          </div>
        </div>
      </div>
    </div>
  );
}
