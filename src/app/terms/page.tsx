import { siteConfig } from "@/lib/site";

export default function TermsPage() {
  return (
    <main className="px-6 py-8 md:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl rounded-[2.25rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-8 md:p-10">
        <div className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Terms of Service
        </div>
        <h1 className="font-display mt-4 text-5xl leading-none text-[color:var(--foreground)] md:text-6xl">
          The basic rules for ordering from {siteConfig.name}.
        </h1>

        <div className="mt-8 space-y-8 text-sm leading-8 text-[color:var(--foreground)]">
          <section>
            <h2 className="font-display text-3xl leading-none">Orders</h2>
            <p className="mt-4">
              Submitting payment through the storefront is a request to purchase the items shown in your cart. Orders
              may be reviewed for availability, fraud prevention, and shipping eligibility before fulfillment is
              completed.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl leading-none">Pricing and availability</h2>
            <p className="mt-4">
              Product listings, pricing, bundles, and shipping coverage may change at any time. If a listing error or
              inventory issue appears after payment, we may cancel and refund the affected order.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl leading-none">Use of the site</h2>
            <p className="mt-4">
              You agree not to misuse the storefront, interfere with checkout, attempt unauthorized access, or submit
              false purchasing or identity information.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl leading-none">Support</h2>
            <p className="mt-4">
              Questions about an order, return eligibility, or policy interpretation should be sent to{" "}
              {siteConfig.supportEmail}.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
