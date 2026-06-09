import { ipfsURL } from "@/lib/utils";

interface Attribute {
  trait_type: string;
  value: string;
}

interface Props {
  name: string;
  imageUrl: string;
  description?: string;
  attributes?: Attribute[];
}

export default function NFTViewer({
  name,
  imageUrl,
  description,
  attributes,
}: Props) {
  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-[#e8e2d8] bg-[#f5efe4]">
        <img
          src={ipfsURL(imageUrl)}
          alt={name}
          className="h-full w-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect fill='%23ede3d3' width='200' height='200'/></svg>";
          }}
        />
      </div>
      <h2 className="mt-5 font-serif text-2xl font-semibold text-[#1a1a1a]">
        {name}
      </h2>
      {description && (
        <p className="mt-3 font-serif text-sm leading-relaxed text-[#6b6560]">
          {description}
        </p>
      )}
      {attributes && attributes.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {attributes.map((attr) => (
            <div
              key={attr.trait_type}
              className="rounded-md border border-[#e8e2d8] bg-white px-4 py-3"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#8c8580]">
                {attr.trait_type}
              </p>
              <p className="mt-1 font-serif text-sm text-[#1a1a1a] truncate">
                {attr.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
