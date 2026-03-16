import { siteConfig } from "@/lib/site";
import { supportedShippingCountries, supportedShippingCountriesText } from "@/lib/shipping";

export default function ShippingPage() {
  return (
    <main className="px-6 py-8 md:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[2.25rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-8 md:p-10">
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
            Shipping & Returns
          </div>
          <h1 className="font-display mt-4 text-5xl leading-none text-[color:var(--foreground)] md:text-6xl">
            Clear delivery expectations before the order is placed.
          </h1>
          <p className="text-ink-soft mt-6 max-w-3xl text-sm leading-8">
            {siteConfig.name} currently accepts checkout orders for {supportedShippingCountriesText}. We keep shipping
            coverage, timing, and return expectations visible so shoppers know exactly what to expect before paying.
          </p>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-8">
            <h2 className="font-display text-4xl leading-none text-[color:var(--foreground)]">
              Shipping coverage
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-[color:var(--foreground)]">
              {supportedShippingCountries.map((country) => (
                <li key={country.code}>{country.name}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--foreground)] p-8 text-[color:var(--background)]">
            <h2 className="font-display text-4xl leading-none">Fulfillment timing</h2>
            <p className="mt-5 text-sm leading-8 text-[color:rgba(243,234,216,0.82)]">
              Paid orders are typically prepared within 1-2 business days. Tracking details, when available, are shared
              once the parcel is with the carrier.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-8">
          <h2 className="font-display text-4xl leading-none text-[color:var(--foreground)]">
            Returns and damaged items
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-white/65 p-5 text-sm leading-7 text-[color:var(--foreground)]">
              Contact {siteConfig.supportEmail} within 7 days of delivery if an item arrives damaged or materially
              incorrect.
            </div>
            <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-white/65 p-5 text-sm leading-7 text-[color:var(--foreground)]">
              Unused decks or accessories may be eligible for return approval within 14 days of delivery. Return
              shipping is the buyer&apos;s responsibility unless the order was incorrect.
            </div>
            <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-white/65 p-5 text-sm leading-7 text-[color:var(--foreground)]">
              Digital guides, custom bundles, and opened ritual items are treated as final sale unless there is a
              product defect.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
