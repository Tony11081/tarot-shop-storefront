import Link from "next/link";
import { CartButton } from "@/components/cart-button";
import { ProductConfigurator } from "@/components/product-configurator";
import { notFound } from "next/navigation";
import { formatPrice, getProduct } from "@/lib/medusa";
import { siteConfig } from "@/lib/site";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen px-6 py-8 md:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-sm text-white/55 transition hover:text-white/85">
            ← Back to storefront
          </Link>
          <CartButton />
        </div>

        <section className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-fuchsia-500/20 via-zinc-900 to-black p-8">
            <div className="flex h-full min-h-[500px] items-end">
              <div className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60">
                Signature piece
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-white">
            <div className="text-xs uppercase tracking-[0.3em] text-white/45">{siteConfig.name}</div>
            <h1 className="mt-3 text-3xl font-semibold md:text-4xl">{product.title}</h1>
            <div className="mt-4 text-2xl font-semibold">{formatPrice(product)}</div>
            <p className="mt-6 text-base leading-7 text-white/65">
              {product.description || "A premium custom piece designed for bold graphics, creator drops, and limited-edition streetwear moments."}
            </p>

            <ProductConfigurator product={product} />

            <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-black/20 p-5">
              <div className="text-sm font-medium text-white/85">MVP note</div>
              <p className="mt-2 text-sm leading-6 text-white/55">
                This page now supports real variant selection and add-to-cart against Medusa. Next layer is shipping, payment, and full custom design upload flow.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
