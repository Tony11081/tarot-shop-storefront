import Link from "next/link";
import { CartButton } from "@/components/cart-button";
import { ProductCard } from "@/components/product-card";
import { getCategories, getProducts } from "@/lib/medusa";
import { siteConfig } from "@/lib/site";

const fallbackCategories = [
  "Tarot Decks",
  "Oracle Cards",
  "Divination Tools",
];

export default async function Home() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const visibleCategories = categories.length
    ? categories.map((category) => category.name)
    : fallbackCategories;

  return (
    <main className="min-h-screen px-6 py-8 text-white md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-white/45">{siteConfig.domain}</div>
            <h1 className="mt-3 text-2xl font-semibold md:text-3xl">{siteConfig.name}</h1>
          </div>
          <nav className="flex flex-wrap gap-3 text-sm text-white/70">
            <a href="#products" className="rounded-full border border-white/10 px-4 py-2 hover:bg-white/5">Shop</a>
            <a href="#how-it-works" className="rounded-full border border-white/10 px-4 py-2 hover:bg-white/5">How it works</a>
            <a href="#categories" className="rounded-full border border-white/10 px-4 py-2 hover:bg-white/5">Categories</a>
            <CartButton />
          </nav>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 via-white/[0.04] to-transparent p-8 shadow-2xl shadow-fuchsia-950/20 md:p-12">
            <div className="mb-4 inline-flex rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-fuchsia-200">
              {siteConfig.heroBadge}
            </div>
            <h2 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
              {siteConfig.heroTitle}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
              {siteConfig.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#products"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
              >
                Explore Collection
              </a>
              <Link
                href="/products/demo-product"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/5"
              >
                View Featured Deck
              </Link>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-white/45">Why Choose Us</div>
              <div className="mt-4 space-y-4">
                {[
                  "Authentic tarot decks from renowned artists and publishers",
                  "Carefully curated collection for all experience levels",
                  "Fast worldwide shipping with secure packaging",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/75">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-white/45">Current catalog</div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-3xl font-semibold">{products.length}</div>
                  <div className="mt-2 text-white/55">Products live</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-3xl font-semibold">{visibleCategories.length}</div>
                  <div className="mt-2 text-white/55">Categories seeded</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="categories" className="mt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/45">Categories</div>
              <h2 className="mt-3 text-2xl font-semibold">Explore Our Collection</h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {visibleCategories.map((category) => (
              <div
                key={category}
                className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white/80"
              >
                {category}
              </div>
            ))}
          </div>
        </section>

        <section id="products" className="mt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/45">Featured products</div>
              <h2 className="mt-3 text-2xl font-semibold">Premium Tarot Decks</h2>
            </div>
            <div className="text-sm text-white/45">Powered by Medusa</div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mt-16 grid gap-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 lg:grid-cols-3">
          {[
            {
              title: "1. Choose Your Deck",
              text: "Browse our curated collection of authentic tarot and oracle decks from renowned artists and publishers worldwide.",
            },
            {
              title: "2. Secure Checkout",
              text: "Safe and secure payment processing with Inflyway. We accept all major payment methods for your convenience.",
            },
            {
              title: "3. Fast Delivery",
              text: "Your deck ships within 24 hours with tracking. Carefully packaged to ensure it arrives in perfect condition.",
            },
          ].map((step) => (
            <div key={step.title} className="rounded-[1.5rem] border border-white/8 bg-black/20 p-6">
              <div className="text-lg font-semibold">{step.title}</div>
              <p className="mt-3 text-sm leading-6 text-white/60">{step.text}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
