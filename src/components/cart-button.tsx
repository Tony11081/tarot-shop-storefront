"use client";

import { useCart } from "@/components/cart-provider";

export function CartButton() {
  const { itemCount, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/75 transition hover:bg-white/5"
    >
      Cart {itemCount > 0 ? `(${itemCount})` : ""}
    </button>
  );
}
