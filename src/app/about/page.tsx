import type { Metadata } from "next";
import { aboutPrinciples } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Learn the brand principles behind TarotDeck.online and how the collection is curated for beginners, gift buyers, and collectors.",
};

export default function AboutPage() {
  return (
    <main className="px-6 py-8 md:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-6xl">
        <section className="rounded-[2.25rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-8 md:p-10">
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
            About the brand
          </div>
          <h1 className="font-display mt-4 max-w-4xl text-6xl leading-[0.94] text-[color:var(--foreground)]">
            TarotDeck.online treats tarot like a personal ritual object, not a generic catalog item.
          </h1>
          <p className="text-ink-soft mt-6 max-w-3xl text-base leading-8">
            The goal of this storefront is simple: help shoppers discover a deck that feels emotionally right, visually
            beautiful, and easy to begin using. That means less marketplace chaos, more guidance, and a brand voice that
            stays warm without becoming vague.
          </p>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          {aboutPrinciples.map((item) => (
            <div key={item.title} className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-6">
              <h2 className="font-display text-4xl leading-none text-[color:var(--foreground)]">
                {item.title}
              </h2>
              <p className="text-ink-soft mt-4 text-sm leading-7">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--foreground)] p-8 text-[color:var(--background)]">
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:rgba(243,234,216,0.6)]">
            Why this matters
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-[color:rgba(243,234,216,0.8)]">
            Tarot products convert best when the gap between interest and confidence is small. This store is built to
            close that gap with warmer guidance, cleaner choices, and shopping paths that make sense for first-time
            buyers, gift shoppers, and collectors alike.
          </p>
        </section>
      </div>
    </main>
  );
}
