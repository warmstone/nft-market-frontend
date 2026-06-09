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

export default function NFTViewer({ name, imageUrl, description, attributes }: Props) {
  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-xl bg-gray-900 ring-1 ring-gray-800">
        <img
          src={ipfsURL(imageUrl)}
          alt={name}
          className="h-full w-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect fill='%23374151' width='200' height='200'/></svg>";
          }}
        />
      </div>
      <h2 className="mt-4 text-xl font-bold text-white">{name}</h2>
      {description && (
        <p className="mt-2 text-sm text-gray-400">{description}</p>
      )}
      {attributes && attributes.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {attributes.map((attr) => (
            <div
              key={attr.trait_type}
              className="rounded-lg bg-gray-900 p-3 ring-1 ring-gray-800"
            >
              <p className="text-xs text-gray-500 uppercase">{attr.trait_type}</p>
              <p className="text-sm text-gray-200 truncate">{attr.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
