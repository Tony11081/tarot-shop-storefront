"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartButton } from "@/components/cart-button";
import { navLinks, siteConfig } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:rgba(243,234,216,0.75)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4 md:px-10 lg:px-16">
        <Link href="/" className="min-w-0">
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.38em] text-[color:var(--muted)]">
            {siteConfig.domain}
          </div>
          <div className="font-display truncate text-2xl leading-none text-[color:var(--foreground)]">
            {siteConfig.name}
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-2 rounded-full border border-[color:var(--border)] bg-white/45 px-2 py-2 md:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    active
                      ? "bg-[color:var(--foreground)] text-[color:var(--background)]"
                      : "text-ink-soft hover:bg-white/70"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
