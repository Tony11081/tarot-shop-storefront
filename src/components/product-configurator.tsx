"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { Product } from "@/lib/medusa";

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
      ) ?? null
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
      setError("This combination is not available yet.");
      setMessage(null);
      return;
    }

    try {
      setError(null);
      await addItem(activeVariant.id, 1);
      setMessage(`${product.title} · ${activeVariant.title} added to cart.`);
    } catch (err) {
      setMessage(null);
      setError(err instanceof Error ? err.message : "Failed to add item.");
    }
  }

  const price = activeVariant?.prices?.[0];

  return (
    <div className="mt-8 space-y-4">
      {(product.options ?? []).map((option) => (
        <div key={option.id} className="rounded-2xl border border-white/8 bg-black/20 p-4">
          <div className="text-sm font-medium text-white/80">{option.title}</div>
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
                  className={`rounded-full border px-4 py-2 text-sm transition ${selected ? "border-white bg-white text-black" : available ? "border-white/10 text-white/70 hover:bg-white/5" : "cursor-not-allowed border-white/5 text-white/25 line-through"}`}
                >
                  {value.value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-white/45">Selected variant</div>
            <div className="mt-2 text-lg font-semibold text-white">{activeVariant?.title || "Unavailable"}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/45">Price</div>
            <div className="mt-2 text-lg font-semibold text-white">
              {price ? formatCurrency(price.amount, price.currency_code) : "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={handleAddToCart}
          disabled={!activeVariant || adding}
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {adding ? "Adding…" : "Add to cart"}
        </button>
        <button className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/5">
          Request custom artwork
        </button>
      </div>

      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
