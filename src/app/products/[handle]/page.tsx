import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductConfigurator } from "@/components/product-configurator";
import { ProductVisual } from "@/components/product-visual";
import { TrackProductView } from "@/components/track-product-view";
import { TrustBar } from "@/components/trust-bar";
import { formatPrice, getProduct, getProductPriceRange, getProducts } from "@/lib/medusa";
import { getProductStory, productTrustHighlights, siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    return {};
  }

  const description = product.description || `Shop ${product.title} on ${siteConfig.name}.`;
  const imageUrl = `/products/${handle}/opengraph-image`;

  return {
    title: product.title,
    description,
    alternates: {
      canonical: `/products/${handle}`,
    },
    openGraph: {
      title: product.title,
      description,
      type: "website",
      url: `/products/${handle}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const [product, products] = await Promise.all([getProduct(handle), getProducts()]);

  if (!product) {
    notFound();
  }

  const story = getProductStory(product.handle);
  const category = product.categories?.[0]?.name || "Tarot deck";
  const priceLabel = formatPrice(product);
  const priceRange = getProductPriceRange(product);
  const relatedProducts = products
    .filter((item) => item.handle !== product.handle)
    .sort((left, right) => {
      const leftScore = (left.categories ?? []).some((item) => item.name === category) ? 1 : 0;
      const rightScore = (right.categories ?? []).some((item) => item.name === category) ? 1 : 0;
      return rightScore - leftScore;
    })
    .slice(0, 3);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || story.note,
    category,
    image: [`https://${siteConfig.domain}/products/${product.handle}/opengraph-image`],
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    offers: priceRange
      ? {
          "@type": "AggregateOffer",
          availability: "https://schema.org/InStock",
          highPrice: (priceRange.max / 100).toFixed(2),
          lowPrice: (priceRange.min / 100).toFixed(2),
          priceCurrency: priceRange.currency_code.toUpperCase(),
          url: `https://${siteConfig.domain}/products/${product.handle}`,
        }
      : undefined,
  };

  return (
    <main className="px-6 py-8 md:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <TrackProductView category={category} handle={product.handle} priceLabel={priceLabel} title={product.title} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--muted)]">
          <Link href="/shop" className="transition hover:text-[color:var(--foreground)]">
            Shop
          </Link>
          <span>/</span>
          <span>{category}</span>
        </div>

        <section className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.92fr]">
          <ProductVisual handle={product.handle} title={product.title} category={category} size="detail" />

          <div className="rounded-[2.1rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-8">
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
              {siteConfig.name}
            </div>
            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                  {category}
                </div>
                <h1 className="font-display mt-3 text-5xl leading-none text-[color:var(--foreground)] md:text-6xl">
                  {product.title}
                </h1>
              </div>
              <div className="rounded-full border border-[color:var(--border)] bg-white/70 px-5 py-2 text-sm font-semibold text-[color:var(--foreground)]">
                {priceLabel}
              </div>
            </div>

            <p className="text-ink-soft mt-6 text-base leading-8">
              {product.description || story.note}
            </p>

            <ProductConfigurator product={product} />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-white/65 p-5">
                <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                  Ideal for
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--foreground)]">
                  {story.idealFor.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-white/65 p-5">
                <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                  What arrives
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--foreground)]">
                  {story.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--foreground)] p-8 text-[color:var(--background)]">
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-paper-muted">Ritual cue</div>
            <h2 className="font-display mt-4 text-5xl leading-none">Make the deck part of a repeatable habit.</h2>
            <p className="text-paper-soft mt-5 text-sm leading-8">{story.ritual}</p>
          </div>

          <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-8">
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
              Shipping & support
            </div>
            <h2 className="font-display mt-4 text-5xl leading-none text-[color:var(--foreground)]">
              Feel clear before you place the order.
            </h2>
            <p className="text-ink-soft mt-5 text-sm leading-8">
              Every deck page is designed to answer the questions that normally slow a tarot order down: which edition
              fits, whether it is giftable, what arrives, and what support looks like if you need help.
            </p>
            <div className="mt-6">
              <TrustBar items={productTrustHighlights} />
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Continue browsing
              </div>
              <h2 className="font-display mt-3 text-5xl leading-none text-[color:var(--foreground)]">
                Related decks and supporting pieces
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
