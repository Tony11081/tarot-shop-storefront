import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { getCategories, getProducts } from "@/lib/medusa";
import { getCategoryCopy } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop tarot decks",
  description: "Browse beginner tarot decks, collector editions, bundles, and reading tools by the kind of buying decision you are trying to make.",
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const visibleCategories = categories.length
    ? categories
    : [
        { id: "beginner", name: "Beginner Tarot Decks", handle: "beginner-tarot-decks" },
        { id: "collector", name: "Collector Decks", handle: "collector-decks" },
        { id: "bundle", name: "Ritual Bundles", handle: "ritual-bundles" },
        { id: "tools", name: "Reading Tools", handle: "reading-tools" },
      ];

  return (
    <main className="px-6 py-8 md:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <section className="rounded-[2.25rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-8 md:p-10">
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
            Shop all decks and ritual pieces
          </div>
          <h1 className="font-display mt-4 max-w-4xl text-6xl leading-[0.94] text-[color:var(--foreground)]">
            Explore decks, bundles, and supporting ritual pieces.
          </h1>
          <p className="text-ink-soft mt-5 max-w-2xl text-base leading-8">
            Browse by first-deck confidence, collector atmosphere, giftability, or the supporting pieces that make the
            reading table feel complete.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {visibleCategories.map((category) => (
              <a
                key={category.id}
                href={`#${category.handle}`}
                className="rounded-full border border-[color:var(--border)] bg-white/60 px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
              >
                {category.name}
              </a>
            ))}
          </div>
        </section>

        <div className="mt-10 space-y-10">
          {visibleCategories.map((category) => {
            const categoryProducts = products.filter((product) =>
              (product.categories ?? []).some((item) => item.name === category.name)
            );
            const copy = getCategoryCopy(category.name);

            return (
              <section key={category.id} id={category.handle}>
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                      {copy.eyebrow}
                    </div>
                    <h2 className="font-display mt-3 text-5xl leading-none text-[color:var(--foreground)]">
                      {category.name}
                    </h2>
                    <p className="text-ink-soft mt-4 max-w-2xl text-sm leading-7">{copy.text}</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {categoryProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
