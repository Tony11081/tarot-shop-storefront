"use client";

import { useCart } from "@/components/cart-provider";

export function CartButton() {
  const { itemCount, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      className="rounded-full border border-[color:var(--border)] bg-[color:var(--foreground)] px-4 py-2 text-sm font-semibold text-[color:var(--background)] transition hover:translate-y-[-1px]"
    >
      Cart {itemCount > 0 ? `(${itemCount})` : ""}
    </button>
  );
}
