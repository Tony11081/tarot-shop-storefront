import Link from "next/link";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { ProductCard } from "@/components/product-card";
import { ProductVisual } from "@/components/product-visual";
import { TrustBar } from "@/components/trust-bar";
import { getCategories, getProducts } from "@/lib/medusa";
import {
  faqItems,
  getCategoryCopy,
  homeBenefits,
  homeTrustHighlights,
  ritualSteps,
  siteConfig,
} from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const featuredProducts = products.slice(0, 4);
  const categoryBlocks = categories.length
    ? categories
    : [
        { id: "beginner", name: "Beginner Tarot Decks", handle: "beginner-tarot-decks" },
        { id: "collector", name: "Collector Decks", handle: "collector-decks" },
        { id: "bundle", name: "Ritual Bundles", handle: "ritual-bundles" },
      ];
  const bundleProduct = products.find((product) => product.handle === "first-spread-ritual-bundle") || products[0];

  return (
    <main className="px-6 py-8 md:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2.25rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-8 shadow-[0_30px_80px_rgba(23,48,43,0.08)] md:p-10">
            <div className="inline-flex rounded-full border border-[color:var(--border)] bg-white/65 px-4 py-2 font-mono text-[0.72rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
              {siteConfig.heroBadge}
            </div>
            <h1 className="font-display mt-6 max-w-4xl text-6xl leading-[0.94] text-[color:var(--foreground)] md:text-7xl">
              {siteConfig.heroTitle}
            </h1>
            <p className="text-ink-soft mt-6 max-w-2xl text-base leading-8 md:text-lg">
              {siteConfig.heroDescription}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-full bg-[color:var(--foreground)] px-6 py-3 text-sm font-semibold text-[color:var(--background)] transition hover:translate-y-[-1px]"
              >
                Shop the collection
              </Link>
              <Link
                href="/shop#beginner-tarot-decks"
                className="rounded-full border border-[color:var(--border)] bg-white/65 px-6 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-white"
              >
                Shop beginner decks
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-white/60 p-5">
                <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                  Beginner-friendly
                </div>
                <div className="font-display mt-3 text-4xl leading-none text-[color:var(--foreground)]">
                  {products.length} picks
                </div>
                <div className="text-ink-muted mt-2 text-sm">Decks, bundles, and ritual add-ons picked to reduce overwhelm</div>
              </div>
              <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-white/60 p-5">
                <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                  Shipping coverage
                </div>
                <div className="font-display mt-3 text-4xl leading-none text-[color:var(--foreground)]">
                  US + EU
                </div>
                <div className="text-ink-muted mt-2 text-sm">Checkout is open for the United States and select European countries</div>
              </div>
              <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-white/60 p-5">
                <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                  Shopper support
                </div>
                <div className="font-display mt-3 text-4xl leading-none text-[color:var(--foreground)]">
                  14-day
                </div>
                <div className="text-ink-muted mt-2 text-sm">Return window on unused decks and accessories, plus human help when choosing</div>
              </div>
            </div>

            <div className="mt-6">
              <TrustBar items={homeTrustHighlights} />
            </div>
          </div>

          <div className="grid gap-6">
            <ProductVisual handle="moonwake-tarot" title="Moonwake Tarot" category="Hero deck" size="detail" />
            <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--foreground)] p-7 text-[color:var(--background)]">
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:rgba(243,234,216,0.65)]">
                Brand angle
              </div>
              <div className="mt-4 grid gap-4">
                {[
                  "Mood-led deck discovery instead of endless generic catalog pages.",
                  "Giftable bundles that help buyers choose without tarot expertise.",
                  "Editorial presentation that makes each product feel intentional and collectible.",
                ].map((item) => (
                  <div key={item} className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4 text-sm leading-7 text-[color:rgba(243,234,216,0.8)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Shop by intent
              </div>
              <h2 className="font-display mt-3 text-5xl leading-none text-[color:var(--foreground)]">
                Category lanes that guide the purchase
              </h2>
            </div>
            <Link href="/shop" className="text-sm font-semibold text-[color:var(--foreground)]">
              View the full shop
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {categoryBlocks.map((category) => {
              const copy = getCategoryCopy(category.name);
              return (
                <div
                  key={category.id}
                  className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-6"
                >
                  <div className="font-mono text-[0.68rem] uppercase tracking-[0.32em] text-[color:var(--muted)]">
                    {copy.eyebrow}
                  </div>
                  <h3 className="font-display mt-3 text-3xl leading-none text-[color:var(--foreground)]">
                    {category.name}
                  </h3>
                  <p className="text-ink-soft mt-4 text-sm leading-7">{copy.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Featured decks
              </div>
              <h2 className="font-display mt-3 text-5xl leading-none text-[color:var(--foreground)]">
                Start with the decks shoppers reach for first
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--foreground)] p-8 text-[color:var(--background)]">
            <div className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[color:rgba(243,234,216,0.6)]">
              Starter bundle
            </div>
            <h2 className="font-display mt-4 text-5xl leading-none">
              Give a first reading something to begin with.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-8 text-[color:rgba(243,234,216,0.8)]">
              Bundles work well for first-time readers and thoughtful gifts because they remove the guesswork. One order
              can cover the deck, the setup, and the feeling of being ready to begin.
            </p>
            {bundleProduct ? (
              <Link
                href={`/products/${bundleProduct.handle}`}
                className="mt-8 inline-flex rounded-full bg-[color:var(--background)] px-6 py-3 text-sm font-semibold text-[color:var(--foreground)]"
              >
                Open the starter bundle
              </Link>
            ) : null}
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {homeBenefits.map((item) => (
              <div key={item.title} className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-6">
                <h3 className="font-display text-3xl leading-none text-[color:var(--foreground)]">
                  {item.title}
                </h3>
                <p className="text-ink-soft mt-4 text-sm leading-7">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-[2.25rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-8 md:p-10">
          <div className="max-w-2xl">
            <div className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
              How choosing gets easier
            </div>
            <h2 className="font-display mt-3 text-5xl leading-none text-[color:var(--foreground)]">
              A calmer path from curiosity to confidence
            </h2>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {ritualSteps.map((step) => (
              <div key={step.title} className="rounded-[1.75rem] border border-[color:var(--border)] bg-white/65 p-6">
                <h3 className="font-display text-3xl leading-none text-[color:var(--foreground)]">
                  {step.title}
                </h3>
                <p className="text-ink-soft mt-4 text-sm leading-7">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-20" id="deck-finder">
          <LeadCaptureForm
            eyebrow="Deck finder"
            title="Not sure which deck to choose?"
            description="Tell us whether you are buying your first deck, shopping for a gift, or looking for something more collectible. We will save your email and follow up with a tighter shortlist."
            placement="home-deck-finder"
          />
        </div>

        <section className="mt-20 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
              FAQ snapshot
            </div>
            <h2 className="font-display mt-3 text-5xl leading-none text-[color:var(--foreground)]">
              Answer hesitation before it becomes abandonment.
            </h2>
            <p className="text-ink-soft mt-5 max-w-xl text-sm leading-8">
              Tarot buyers hesitate when they are unsure which deck fits, how gifting will land, or what shipping looks
              like. Clear answers help the order feel safe.
            </p>
            <Link href="/faq" className="mt-6 inline-flex text-sm font-semibold text-[color:var(--foreground)]">
              Read the full FAQ
            </Link>
          </div>
          <div className="grid gap-4">
            {faqItems.slice(0, 4).map((item) => (
              <div key={item.question} className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-6">
                <h3 className="font-semibold text-[color:var(--foreground)]">{item.question}</h3>
                <p className="text-ink-soft mt-3 text-sm leading-7">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
