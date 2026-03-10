"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CART_STORAGE_KEY = "rube-club-cart-id";

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

type CompletedOrder = {
  id: string;
  display_id?: number;
  status?: string;
  total?: number;
  currency_code?: string;
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
  order: CompletedOrder | null;
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
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [order, setOrder] = useState<CompletedOrder | null>(null);
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
        setCheckoutError(null);
        setOrder(null);
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

      try {
        const data = await apiRequest<{ order?: CompletedOrder; type?: string }>(`/api/checkout`, {
          method: "POST",
          body: JSON.stringify({ cartId: cart.id, checkout: form }),
        });

        if (data.order) {
          setOrder(data.order);
          setCart(null);
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      } catch (error) {
        setCheckoutError(error instanceof Error ? error.message : "Checkout failed");
      } finally {
        setCheckingOut(false);
      }
    },
    [cart]
  );

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
      order,
      checkoutError,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      removeItem,
      checkout,
    };
  }, [cart, loading, adding, checkingOut, isOpen, order, checkoutError, addItem, removeItem, checkout]);

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
    order,
    checkoutError,
  } = useCart();

  const [form, setForm] = useState<CheckoutForm>({
    email: "test@example.com",
    first_name: "Tony",
    last_name: "Buyer",
    address_1: "123 Main St",
    city: "Copenhagen",
    postal_code: "2100",
    country_code: "dk",
  });

  return (
    <>
      <button
        onClick={() => (isOpen ? closeCart() : undefined)}
        className={`fixed inset-0 z-40 bg-black/50 transition ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden={!isOpen}
      />
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#0a0a0a] p-6 shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/45">Cart</div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {order ? "Order placed" : `${itemCount} item${itemCount === 1 ? "" : "s"}`}
            </div>
          </div>
          <button
            onClick={closeCart}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            Close
          </button>
        </div>

        {order ? (
          <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm text-emerald-100">
            <div className="text-lg font-semibold">Order #{order.display_id ?? order.id}</div>
            <p className="mt-2 leading-6 text-emerald-100/80">
              Checkout flow completed against Medusa. Current status: {order.status ?? "pending"}.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
                  Loading cart…
                </div>
              ) : cart?.items?.length ? (
                cart.items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-white">{item.title}</div>
                        <div className="mt-1 text-sm text-white/55">{item.variant_title}</div>
                        <div className="mt-3 text-sm text-white/75">Qty {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-white">
                          {formatMoney(item.unit_price * item.quantity, cart.currency_code)}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="mt-3 text-xs uppercase tracking-[0.2em] text-white/45 hover:text-white/75"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-white/55">
                  Cart is empty. Pick a size and color, then drop it in here.
                </div>
              )}
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between text-sm text-white/55">
                <span>Subtotal</span>
                <span className="text-lg font-semibold text-white">{totalFormatted}</span>
              </div>

              <div className="mt-5 grid gap-3">
                <input
                  value={form.email}
                  onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                  placeholder="Email"
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={form.first_name}
                    onChange={(e) => setForm((current) => ({ ...current, first_name: e.target.value }))}
                    placeholder="First name"
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                  />
                  <input
                    value={form.last_name}
                    onChange={(e) => setForm((current) => ({ ...current, last_name: e.target.value }))}
                    placeholder="Last name"
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                  />
                </div>
                <input
                  value={form.address_1}
                  onChange={(e) => setForm((current) => ({ ...current, address_1: e.target.value }))}
                  placeholder="Address"
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    value={form.city}
                    onChange={(e) => setForm((current) => ({ ...current, city: e.target.value }))}
                    placeholder="City"
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                  />
                  <input
                    value={form.postal_code}
                    onChange={(e) => setForm((current) => ({ ...current, postal_code: e.target.value }))}
                    placeholder="Postal"
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                  />
                  <input
                    value={form.country_code}
                    onChange={(e) => setForm((current) => ({ ...current, country_code: e.target.value.toLowerCase() }))}
                    placeholder="Country"
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-white/40">
                Current MVP checkout uses Medusa payment collections + default provider, then completes the cart into an order.
              </p>
              <button
                onClick={() => checkout(form)}
                disabled={!cart?.items?.length || checkingOut}
                className="mt-5 w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checkingOut ? "Processing checkout…" : "Checkout now"}
              </button>
              {checkoutError ? <p className="mt-4 text-sm text-rose-300">{checkoutError}</p> : null}
            </div>
          </>
        )}
      </div>
    </>
  );
}
