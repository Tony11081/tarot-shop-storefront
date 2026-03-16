import Link from "next/link";
import { ProductVisual } from "@/components/product-visual";
import { formatPrice, Product } from "@/lib/medusa";
import { getProductStory } from "@/lib/site";

export function ProductCard({ product }: { product: Product }) {
  const category = product.categories?.[0]?.name || "Tarot deck";
  const story = getProductStory(product.handle);

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(23,48,43,0.12)]"
    >
      <ProductVisual handle={product.handle} title={product.title} category={category} />

      <div className="space-y-4 p-3 pb-2 pt-5">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.32em] text-[color:var(--muted)]">
              {category}
            </div>
            <h3 className="font-display mt-2 text-3xl leading-none text-[color:var(--foreground)]">
              {product.title}
            </h3>
          </div>
          <div className="rounded-full border border-[color:var(--border)] bg-white/60 px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]">
            {formatPrice(product)}
          </div>
        </div>

        <p className="text-ink-soft text-sm leading-7">
          {product.description || story.note}
        </p>

        <div className="flex flex-wrap gap-2">
          {(product.options ?? []).map((option) => (
            <span
              key={option.id}
              className="text-ink-soft rounded-full border border-[color:var(--border)] bg-white/55 px-3 py-1 text-xs"
            >
              {option.title}: {option.values.map((value) => value.value).join(" / ")}
            </span>
          ))}
        </div>

        <div className="pt-1 text-sm font-semibold text-[color:var(--foreground)]">View deck details</div>
      </div>
    </Link>
  );
}
