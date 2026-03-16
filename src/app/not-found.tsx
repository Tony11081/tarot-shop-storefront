import Link from "next/link";

export default function NotFound() {
  return (
    <main className="px-6 py-20 md:px-10 lg:px-16">
      <div className="mx-auto max-w-3xl rounded-[2.25rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-10 text-center">
        <div className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">Not found</div>
        <h1 className="font-display mt-4 text-6xl leading-none text-[color:var(--foreground)]">
          That page is not in the spread.
        </h1>
        <p className="text-ink-soft mt-5 text-sm leading-7">
          Head back to the storefront and choose a deck from the curated collection.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-[color:var(--foreground)] px-6 py-3 text-sm font-semibold text-[color:var(--background)]"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
