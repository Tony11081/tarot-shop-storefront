import Link from "next/link";
import { formatPrice, Product } from "@/lib/medusa";

function getFallbackVisual(index: number) {
  const themes = [
    "from-fuchsia-500/30 via-zinc-900 to-zinc-950",
    "from-cyan-500/30 via-zinc-900 to-zinc-950",
    "from-amber-400/30 via-zinc-900 to-zinc-950",
  ];

  return themes[index % themes.length];
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return (
    <Link
      href={`/products/${product.handle}`}
      className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08]"
    >
      <div
        className={`flex aspect-[4/5] items-end bg-gradient-to-br p-6 ${getFallbackVisual(index)}`}
      >
        <div className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/70 backdrop-blur">
          Custom drop
        </div>
      </div>
      <div className="space-y-3 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{product.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-white/60">
              {product.description || "Built for bold artwork, creator drops, and one-off custom pieces."}
            </p>
          </div>
          <div className="text-sm font-semibold text-white/90">{formatPrice(product)}</div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(product.options ?? []).map((option) => (
            <span
              key={option.id}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50"
            >
              {option.title}: {option.values.map((value) => value.value).join(" / ")}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
