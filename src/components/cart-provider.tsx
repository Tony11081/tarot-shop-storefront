"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CART_CLEAR_EVENT,
  CART_STORAGE_KEY,
  CHECKOUT_SESSION_KEY,
} from "@/lib/cart-storage";
import { trackEvent } from "@/lib/analytics";
import {
  defaultShippingCountry,
  supportedShippingCountries,
  supportedShippingCountriesText,
} from "@/lib/shipping";

type CartItem = {
  id: string;
  title: string;
  variant_title: string;
  quantity: number;
  unit_price: number;
  product_handle: string;
};

type Cart = {
  id: string;
  total: number;
  currency_code: string;
  items: CartItem[];
  shipping_methods?: Array<{ id: string }>;
};

type CheckoutPayment = {
  amount: number;
  cartId: string;
  checkoutUrl: string;
  currency: string;
  orderId: string;
  orderRef: string;
  paymentUrl: string;
  statusUrl: string;
};

type CheckoutForm = {
  email: string;
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  postal_code: string;
  country_code: string;
};

type CartContextValue = {
  cart: Cart | null;
  loading: boolean;
  adding: boolean;
  checkingOut: boolean;
  isOpen: boolean;
  itemCount: number;
  totalFormatted: string;
  checkoutError: string | null;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  checkout: (form: CheckoutForm) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function formatMoney(amount = 0, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with ${response.status}`);
  }

  return data;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const loadCart = useCallback(async (cartId: string) => {
    const data = await apiRequest<{ cart: Cart }>(`/api/cart/${cartId}`);
    setCart(data.cart);
    return data.cart;
  }, []);

  const ensureCart = useCallback(async () => {
    const storedId = typeof window !== "undefined" ? localStorage.getItem(CART_STORAGE_KEY) : null;

    if (storedId) {
      try {
        return await loadCart(storedId);
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }

    const data = await apiRequest<{ cart: Cart }>("/api/cart", {
      method: "POST",
    });

    localStorage.setItem(CART_STORAGE_KEY, data.cart.id);
    setCart(data.cart);
    return data.cart;
  }, [loadCart]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const storedId = localStorage.getItem(CART_STORAGE_KEY);
        if (storedId) {
          const loaded = await loadCart(storedId);
          if (!mounted) return;
          setCart(loaded);
        }
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [loadCart]);

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      setAdding(true);
      try {
        const activeCart = await ensureCart();
        const data = await apiRequest<{ cart: Cart }>(`/api/cart/${activeCart.id}/line-items`, {
          method: "POST",
          body: JSON.stringify({ variant_id: variantId, quantity }),
        });
        sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
        setCheckoutError(null);
        setCart(data.cart);
        setIsOpen(true);
      } finally {
        setAdding(false);
      }
    },
    [ensureCart]
  );

  const removeItem = useCallback(
    async (lineItemId: string) => {
      if (!cart) return;
      const data = await apiRequest<{ cart: Cart }>(`/api/cart/${cart.id}/line-items/${lineItemId}`, {
        method: "DELETE",
      });
      setCart(data.cart);
    },
    [cart]
  );

  const checkout = useCallback(
    async (form: CheckoutForm) => {
      if (!cart) return;

      setCheckingOut(true);
      setCheckoutError(null);
      const paymentWindow = window.open("", "_blank");

      try {
        const data = await apiRequest<{ payment?: CheckoutPayment }>(`/api/checkout`, {
          method: "POST",
          body: JSON.stringify({ cartId: cart.id, checkout: form }),
        });

        if (data.payment) {
          sessionStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify(data.payment));
          setIsOpen(false);
          trackEvent("begin_checkout", {
            cart_id: cart.id,
            country_code: form.country_code,
            item_count: cart.items.length,
            total: cart.total / 100,
          });
          if (paymentWindow) {
            paymentWindow.location.href = data.payment.paymentUrl;
          } else {
            window.open(data.payment.paymentUrl, "_blank", "noopener,noreferrer");
          }
          router.push(data.payment.checkoutUrl);
        }
      } catch (error) {
        paymentWindow?.close();
        setCheckoutError(error instanceof Error ? error.message : "Checkout failed");
      } finally {
        setCheckingOut(false);
      }
    },
    [cart, router]
  );

  useEffect(() => {
    const clearCart = () => {
      setCart(null);
      setIsOpen(false);
      setCheckoutError(null);
    };

    window.addEventListener(CART_CLEAR_EVENT, clearCart);
    return () => {
      window.removeEventListener(CART_CLEAR_EVENT, clearCart);
    };
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

    return {
      cart,
      loading,
      adding,
      checkingOut,
      isOpen,
      itemCount,
      totalFormatted: formatMoney(cart?.total, cart?.currency_code),
      checkoutError,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      removeItem,
      checkout,
    };
  }, [cart, loading, adding, checkingOut, isOpen, checkoutError, addItem, removeItem, checkout]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

function CartDrawer() {
  const {
    cart,
    isOpen,
    closeCart,
    itemCount,
    totalFormatted,
    loading,
    removeItem,
    checkout,
    checkingOut,
    checkoutError,
  } = useCart();

  const [form, setForm] = useState<CheckoutForm>({
    email: "",
    first_name: "",
    last_name: "",
    address_1: "",
    city: "",
    postal_code: "",
    country_code: defaultShippingCountry,
  });

  return (
    <>
      <button
        onClick={() => (isOpen ? closeCart() : undefined)}
        className={`fixed inset-0 z-40 bg-[color:rgba(17,28,24,0.45)] transition ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isOpen}
      />
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-[color:var(--border)] bg-[color:var(--panel-strong)] p-6 shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
              Ritual cart
            </div>
            <div className="font-display mt-2 text-4xl leading-none text-[color:var(--foreground)]">
              {`${itemCount} item${itemCount === 1 ? "" : "s"}`}
            </div>
          </div>
          <button
            onClick={closeCart}
            className="rounded-full border border-[color:var(--border)] bg-white/70 px-4 py-2 text-sm text-[color:var(--foreground)] hover:bg-white"
          >
            Close
          </button>
        </div>

        <div className="mt-8 space-y-3">
          {loading ? (
            <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-white/60 p-4 text-sm text-[color:var(--muted)]">
              Loading cart...
            </div>
          ) : cart?.items?.length ? (
            cart.items.map((item) => (
              <div
                key={item.id}
                className="rounded-[1.5rem] border border-[color:var(--border)] bg-white/70 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-[color:var(--foreground)]">{item.title}</div>
                    <div className="text-ink-subtle mt-1 text-sm">{item.variant_title}</div>
                    <div className="text-ink-soft mt-3 text-sm">Qty {item.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-[color:var(--foreground)]">
                      {formatMoney(item.unit_price * item.quantity, cart.currency_code)}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="mt-3 font-mono text-[0.68rem] uppercase tracking-[0.26em] text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-ink-muted rounded-[1.5rem] border border-dashed border-[color:var(--border)] bg-white/55 p-5 text-sm leading-7">
              Your cart is empty. Pick a deck, a bundle, or a supporting ritual piece to begin.
            </div>
          )}
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--foreground)] p-5 text-[color:var(--background)]">
          <div className="flex items-center justify-between text-sm text-[color:rgba(243,234,216,0.7)]">
            <span>Subtotal</span>
            <span className="text-lg font-semibold text-[color:var(--background)]">{totalFormatted}</span>
          </div>

          <div className="mt-5 grid gap-3">
            <input
              value={form.email}
              onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
              placeholder="Email"
              className="rounded-[1.25rem] border border-white/12 bg-white/10 px-4 py-3 text-sm text-[color:var(--background)] outline-none placeholder:text-[color:rgba(243,234,216,0.55)]"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={form.first_name}
                onChange={(e) => setForm((current) => ({ ...current, first_name: e.target.value }))}
                placeholder="First name"
                className="rounded-[1.25rem] border border-white/12 bg-white/10 px-4 py-3 text-sm text-[color:var(--background)] outline-none placeholder:text-[color:rgba(243,234,216,0.55)]"
              />
              <input
                value={form.last_name}
                onChange={(e) => setForm((current) => ({ ...current, last_name: e.target.value }))}
                placeholder="Last name"
                className="rounded-[1.25rem] border border-white/12 bg-white/10 px-4 py-3 text-sm text-[color:var(--background)] outline-none placeholder:text-[color:rgba(243,234,216,0.55)]"
              />
            </div>
            <input
              value={form.address_1}
              onChange={(e) => setForm((current) => ({ ...current, address_1: e.target.value }))}
              placeholder="Address"
              className="rounded-[1.25rem] border border-white/12 bg-white/10 px-4 py-3 text-sm text-[color:var(--background)] outline-none placeholder:text-[color:rgba(243,234,216,0.55)]"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                value={form.city}
                onChange={(e) => setForm((current) => ({ ...current, city: e.target.value }))}
                placeholder="City"
                className="rounded-[1.25rem] border border-white/12 bg-white/10 px-4 py-3 text-sm text-[color:var(--background)] outline-none placeholder:text-[color:rgba(243,234,216,0.55)]"
              />
              <input
                value={form.postal_code}
                onChange={(e) => setForm((current) => ({ ...current, postal_code: e.target.value }))}
                placeholder="Postal"
                className="rounded-[1.25rem] border border-white/12 bg-white/10 px-4 py-3 text-sm text-[color:var(--background)] outline-none placeholder:text-[color:rgba(243,234,216,0.55)]"
              />
              <select
                value={form.country_code}
                onChange={(e) => setForm((current) => ({ ...current, country_code: e.target.value.toLowerCase() }))}
                className="rounded-[1.25rem] border border-white/12 bg-white/10 px-4 py-3 text-sm text-[color:var(--background)] outline-none"
              >
                {supportedShippingCountries.map((country) => (
                  <option key={country.code} value={country.code} className="text-[color:var(--foreground)]">
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="mt-4 text-xs leading-6 text-[color:rgba(243,234,216,0.68)]">
            You will review a secure payment page next. We currently ship to {supportedShippingCountriesText}, and
            unused decks can request return approval within 14 days of delivery.
          </p>
          <button
            onClick={() => checkout(form)}
            disabled={!cart?.items?.length || checkingOut}
            className="mt-5 w-full rounded-full bg-[color:var(--background)] px-6 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checkingOut ? "Preparing secure payment..." : "Continue to secure payment"}
          </button>
          {checkoutError ? <p className="mt-4 text-sm text-rose-200">{checkoutError}</p> : null}
        </div>
      </div>
    </>
  );
}
