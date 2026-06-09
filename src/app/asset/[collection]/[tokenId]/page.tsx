"use client";

import { useParams } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import NFTViewer from "@/components/asset/NFTViewer";
import OrderPanel from "@/components/asset/OrderPanel";

export default function AssetPage() {
  const params = useParams();
  const collection = params.collection as string;
  const tokenId = params.tokenId as string;

  useWebSocket([collection]);

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-2">
        <NFTViewer
          name={`${collection.slice(0, 8)}... #${tokenId}`}
          imageUrl=""
        />
        <div>
          <h1 className="mb-4 text-2xl font-bold text-white">
            NFT #{tokenId}
          </h1>
          <p className="mb-6 text-sm text-gray-400 break-all">
            Collection: {collection}
          </p>
          <OrderPanel collection={collection} tokenId={tokenId} />
        </div>
      </div>
    </div>
  );
}
