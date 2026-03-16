import Link from "next/link";
import { ShareButtons } from "@/components/share-buttons";
import { footerGroups, siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="relative mt-20 border-t border-[color:var(--border)] bg-[color:rgba(17,38,33,0.96)] text-[#f6ecd9]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.2fr_0.8fr] md:px-10 lg:px-16">
        <div className="max-w-xl">
          <div className="font-mono text-[0.72rem] uppercase tracking-[0.38em] text-[#f6ecd9]/55">
            Tarot boutique
          </div>
          <h2 className="font-display mt-4 text-4xl leading-none">
            Modern decks, quiet ritual, and a calmer way to shop tarot.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#f6ecd9]/72">
            Beginner-safe recommendations, collector-ready picks, and giftable bundles curated for shoppers who want a
            little more confidence before they buy.
          </p>
          <div className="mt-6">
            <div className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-[#f6ecd9]/45">
              Share the boutique
            </div>
            <p className="mt-3 text-sm leading-7 text-[#f6ecd9]/72">
              Pass the shop to a friend, save it for a gift list, or keep it handy for your next deck decision.
            </p>
            <div className="mt-4">
              <ShareButtons
                placement="footer"
                title={siteConfig.name}
                text={siteConfig.description}
                url={`https://${siteConfig.domain}`}
                imageUrl={`https://${siteConfig.domain}/opengraph-image`}
                tone="dark"
              />
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-[#f6ecd9]/72">Support: {siteConfig.supportEmail}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <div className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-[#f6ecd9]/45">
                {group.title}
              </div>
              <div className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm text-[#f6ecd9]/72 transition hover:text-[#f6ecd9]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
