import { siteConfig } from "@/lib/site";

export default function PrivacyPage() {
  return (
    <main className="px-6 py-8 md:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl rounded-[2.25rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-8 md:p-10">
        <div className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Privacy Policy
        </div>
        <h1 className="font-display mt-4 text-5xl leading-none text-[color:var(--foreground)] md:text-6xl">
          How {siteConfig.name} handles shopper data.
        </h1>

        <div className="mt-8 space-y-8 text-sm leading-8 text-[color:var(--foreground)]">
          <section>
            <h2 className="font-display text-3xl leading-none">What we collect</h2>
            <p className="mt-4">
              When you browse the shop or begin checkout, the storefront may collect your email address, shipping
              details, cart contents, and basic technical data such as browser type and IP address.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl leading-none">How it is used</h2>
            <p className="mt-4">
              We use this information to present the catalog, prepare orders, prevent abuse, and support customer
              service. Payment details are processed through Inflyway and are not stored directly inside this
              storefront.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl leading-none">Third-party services</h2>
            <p className="mt-4">
              Product and cart data are handled through Medusa. Payment collection is handled through Inflyway. Your
              browser may also load fonts, static assets, and analytics or infrastructure services required to operate
              the storefront securely.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl leading-none">Your requests</h2>
            <p className="mt-4">
              To request access, correction, or deletion of personal data associated with an order, contact{" "}
              {siteConfig.supportEmail}. We respond as quickly as practical based on the order information you provide.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
