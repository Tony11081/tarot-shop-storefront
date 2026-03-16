import type { Metadata } from "next";
import { faqItems } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common tarot shopping questions, from choosing a first deck to shipping, gifting, and returns.",
};

export default function FaqPage() {
  return (
    <main className="px-6 py-8 md:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-5xl">
        <section className="rounded-[2.25rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-8 md:p-10">
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
            Frequently asked questions
          </div>
          <h1 className="font-display mt-4 max-w-4xl text-6xl leading-[0.94] text-[color:var(--foreground)]">
            Remove friction before a tarot shopper talks themselves out of the order.
          </h1>
        </section>

        <div className="mt-10 space-y-4">
          {faqItems.map((item) => (
            <div key={item.question} className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-6">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)]">{item.question}</h2>
              <p className="text-ink-soft mt-3 text-sm leading-7">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
