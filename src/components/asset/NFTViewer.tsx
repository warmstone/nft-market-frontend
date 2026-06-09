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
  const placeholder =
    "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'><rect fill='%23ede3d3' width='800' height='800'/><circle cx='400' cy='360' r='120' fill='%23d8c9b1'/><rect x='220' y='520' width='360' height='36' rx='18' fill='%23d8c9b1'/></svg>";

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-lg border border-[#e8e2d8] bg-[#f5efe4]">
        <img
          src={imageUrl ? ipfsURL(imageUrl) : placeholder}
          alt={name}
          className="h-full w-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholder;
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
