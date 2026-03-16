"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { trackEvent } from "@/lib/analytics";
import { getVariantPrice, Product } from "@/lib/medusa";

function formatCurrency(amount = 0, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export function ProductConfigurator({ product }: { product: Product }) {
  const variants = useMemo(() => product.variants ?? [], [product.variants]);
  const initialOptions = Object.fromEntries(
    (variants[0]?.options ?? []).map((optionValue) => [optionValue.option?.title || "", optionValue.value])
  );
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(initialOptions);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addItem, adding } = useCart();

  const activeVariant = useMemo(() => {
    return (
      variants.find((variant) =>
        (variant.options ?? []).every(
          (optionValue) => selectedOptions[optionValue.option?.title || ""] === optionValue.value
        )
      ) ?? variants[0] ?? null
    );
  }, [selectedOptions, variants]);

  function isValueAvailable(optionTitle: string, value: string) {
    return variants.some((variant) => {
      const optionMap = Object.fromEntries(
        (variant.options ?? []).map((optionValue) => [optionValue.option?.title || "", optionValue.value])
      );

      if (optionMap[optionTitle] !== value) return false;

      return Object.entries(selectedOptions).every(([key, selected]) => {
        if (key === optionTitle) return true;
        return !selected || optionMap[key] === selected;
      });
    });
  }

  async function handleAddToCart() {
    if (!activeVariant) {
      setError("This edition is not available yet.");
      setMessage(null);
      return;
    }

    try {
      setError(null);
      await addItem(activeVariant.id, 1);
      setMessage(`${product.title} added to cart.`);
      const price = getVariantPrice(activeVariant, product.handle);
      trackEvent("add_to_cart", {
        handle: product.handle,
        price: price?.amount ? price.amount / 100 : undefined,
        title: product.title,
        variant: activeVariant.title,
      });
    } catch (err) {
      setMessage(null);
      setError(err instanceof Error ? err.message : "Failed to add item.");
    }
  }

  const price = getVariantPrice(activeVariant, product.handle);

  return (
    <div className="mt-8 space-y-4">
      {(product.options ?? []).map((option) => (
        <div key={option.id} className="rounded-[1.5rem] border border-[color:var(--border)] bg-white/60 p-4">
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
            {option.title}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {option.values.map((value) => {
              const selected = selectedOptions[option.title] === value.value;
              const available = isValueAvailable(option.title, value.value);

              return (
                <button
                  key={value.id}
                  type="button"
                  disabled={!available}
                  onClick={() => {
                    setSelectedOptions((current) => ({ ...current, [option.title]: value.value }));
                    setMessage(null);
                    setError(null);
                  }}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    selected
                      ? "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--background)]"
                      : available
                        ? "border-[color:var(--border)] bg-[color:var(--panel-strong)] text-[color:var(--foreground)] hover:bg-white"
                        : "cursor-not-allowed border-[color:var(--border)] bg-white/30 text-[color:var(--muted)] line-through"
                  }`}
                >
                  {value.value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--foreground)] p-5 text-[color:var(--background)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:rgba(243,234,216,0.62)]">
              Selected edition
            </div>
            <div className="mt-2 text-lg font-semibold">{activeVariant?.title || "Unavailable"}</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:rgba(243,234,216,0.62)]">
              Price
            </div>
            <div className="mt-2 text-lg font-semibold">
              {price ? formatCurrency(price.amount, price.currency_code) : "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={handleAddToCart}
          disabled={!activeVariant || adding}
          className="rounded-full bg-[color:var(--foreground)] px-6 py-3 text-sm font-semibold text-[color:var(--background)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {adding ? "Adding..." : "Add to cart"}
        </button>
        <Link
          href="/#deck-finder"
          className="rounded-full border border-[color:var(--border)] bg-white/55 px-6 py-3 text-center text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-white"
        >
          Need help choosing?
        </Link>
      </div>

      <p className="text-ink-soft text-sm leading-7">
        Clear shipping coverage, secure payment, and return help for unused decks if the pick is not right.
      </p>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
