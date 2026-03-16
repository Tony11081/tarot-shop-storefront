"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useEffectEvent, useMemo, useState } from "react";
import {
  CART_CLEAR_EVENT,
  CART_STORAGE_KEY,
  CHECKOUT_SESSION_KEY,
} from "@/lib/cart-storage";
import { trackEvent } from "@/lib/analytics";

type CheckoutSession = {
  orderId?: string;
  orderRef?: string;
  paymentUrl?: string;
};

type CheckoutStatusResponse = {
  cartId?: string | null;
  found: boolean;
  medusaSync?: {
    alreadyCompleted?: boolean;
    displayId?: number | null;
    error?: string;
    orderId?: string | null;
    ok: boolean;
  } | null;
  paid: boolean;
  paymentUrl?: string | null;
  status: "paid" | "pending";
  order?: {
    amount?: number | string | null;
    createdAt?: string | null;
    currency?: string | null;
    orderId?: string | null;
    orderNumber?: string | null;
    orderRef?: string | null;
    paymentStatus?: string | null;
  };
};

function formatAmount(amount?: number | string | null, currency = "USD") {
  const rawAmount = typeof amount === "string" ? Number(amount) : amount;
  if (typeof rawAmount !== "number" || Number.isNaN(rawAmount)) return null;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(rawAmount);
}

function getStoredSession(orderId: string, orderRef: string) {
  const raw = sessionStorage.getItem(CHECKOUT_SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as CheckoutSession;
    if (!session.orderId && !session.orderRef) return null;
    if (orderId && session.orderId && session.orderId !== orderId) return null;
    if (orderRef && session.orderRef && session.orderRef !== orderRef) return null;
    return session;
  } catch {
    return null;
  }
}

function markCartPaid() {
  localStorage.removeItem(CART_STORAGE_KEY);
  sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
  window.dispatchEvent(new Event(CART_CLEAR_EVENT));
}

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const cartId = searchParams.get("cartId") || "";
  const orderId = searchParams.get("orderId") || "";
  const orderRef = searchParams.get("orderRef") || "";
  const paymentUrlParam = searchParams.get("paymentUrl") || "";
  const [paymentUrl, setPaymentUrl] = useState(paymentUrlParam);
  const [status, setStatus] = useState<CheckoutStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasTrackedPaid, setHasTrackedPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);

  useEffect(() => {
    setPaymentUrl(paymentUrlParam);
    setStatus(null);
    setError(null);
    setHasTrackedPaid(false);
    setLoading(true);
    setLastCheckedAt(null);
  }, [cartId, orderId, orderRef, paymentUrlParam]);

  useEffect(() => {
    const storedSession = getStoredSession(orderId, orderRef);
    if (storedSession?.paymentUrl) {
      setPaymentUrl((current) => current || storedSession.paymentUrl || "");
    }
  }, [orderId, orderRef]);

  const statusQuery = useMemo(() => {
    if (!orderId && !orderRef) return "";

    const params = new URLSearchParams();
    if (cartId) params.set("cartId", cartId);
    if (orderId) params.set("orderId", orderId);
    if (orderRef) params.set("orderRef", orderRef);
    if (paymentUrl) params.set("paymentUrl", paymentUrl);
    return params.toString();
  }, [cartId, orderId, orderRef, paymentUrl]);

  const isPaid = status?.paid ?? false;
  const amountLabel = formatAmount(status?.order?.amount, status?.order?.currency || "USD");

  useEffect(() => {
    if (!isPaid || hasTrackedPaid) return;

    trackEvent("payment_confirmed", {
      amount: typeof status?.order?.amount === "number" ? status.order.amount : undefined,
      order_id: status?.order?.orderId || orderId,
      order_ref: status?.order?.orderRef || orderRef,
    });
    setHasTrackedPaid(true);
  }, [hasTrackedPaid, isPaid, orderId, orderRef, status?.order?.amount, status?.order?.orderId, status?.order?.orderRef]);

  const loadStatus = useEffectEvent(async () => {
    if (!statusQuery) return;

    const response = await fetch(`/api/checkout/status?${statusQuery}`, {
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Could not load payment status");
    }

    const checkoutStatus = data as CheckoutStatusResponse;
    setStatus(checkoutStatus);
    setError(null);
    setLastCheckedAt(new Date().toISOString());

    if (checkoutStatus.paymentUrl) {
      setPaymentUrl((current) => current || checkoutStatus.paymentUrl || "");
    }

    if (checkoutStatus.paid) {
      markCartPaid();
    }
  });

  useEffect(() => {
    if (!statusQuery) {
      setLoading(false);
      return;
    }

    let active = true;

    const run = async () => {
      try {
        await loadStatus();
      } catch (error) {
        if (active) {
          setError(error instanceof Error ? error.message : "Could not load payment status");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    run();

    if (isPaid) {
      return () => {
        active = false;
      };
    }

    const interval = window.setInterval(run, 5000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [statusQuery, isPaid]);

  if (!orderId && !orderRef) {
    return (
      <main className="px-6 py-8 md:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl rounded-[2.25rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-8 md:p-10">
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
            Checkout status
          </div>
          <h1 className="font-display mt-4 text-5xl leading-none text-[color:var(--foreground)]">
            We could not find a payment session.
          </h1>
          <p className="text-ink-soft mt-5 max-w-2xl text-sm leading-8">
            Start from a product page or your cart, and we will generate a secure payment step for you.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-full bg-[color:var(--foreground)] px-6 py-3 text-sm font-semibold text-[color:var(--background)]"
          >
            Return to shop
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-8 md:px-10 lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2.25rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-8 shadow-[0_30px_80px_rgba(23,48,43,0.08)] md:p-10">
          <div className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
            Secure checkout
          </div>
          <h1 className="font-display mt-4 text-6xl leading-[0.94] text-[color:var(--foreground)]">
            {isPaid ? "Payment confirmed." : "Complete your tarot order securely."}
          </h1>
          <p className="text-ink-soft mt-6 max-w-2xl text-base leading-8">
            {isPaid
              ? "Your payment has been received. Keep this reference until the order is packed and on its way."
              : "Your shipping details are already attached to this order. Open the secure payment page to finish checkout, and keep this page open while we watch for confirmation."}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.6rem] border border-[color:var(--border)] bg-white/65 p-5">
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Order ref
              </div>
              <div className="mt-3 text-sm font-semibold text-[color:var(--foreground)]">
                {status?.order?.orderRef || orderRef}
              </div>
            </div>
            <div className="rounded-[1.6rem] border border-[color:var(--border)] bg-white/65 p-5">
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Payment status
              </div>
              <div className="mt-3 text-sm font-semibold text-[color:var(--foreground)]">
                {loading
                  ? "Checking..."
                  : status?.found === false
                    ? "Registering order"
                    : status?.order?.paymentStatus || (isPaid ? "PAID" : "PENDING")}
              </div>
            </div>
            <div className="rounded-[1.6rem] border border-[color:var(--border)] bg-white/65 p-5">
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Payment order
              </div>
              <div className="mt-3 text-sm font-semibold text-[color:var(--foreground)]">
                {status?.order?.orderId || orderId}
              </div>
            </div>
            <div className="rounded-[1.6rem] border border-[color:var(--border)] bg-white/65 p-5">
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Amount
              </div>
              <div className="mt-3 text-sm font-semibold text-[color:var(--foreground)]">
                {amountLabel || "Will update after lookup"}
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-[1.6rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              {error}
            </div>
          ) : null}

          {status?.medusaSync?.ok ? (
            <div className="mt-6 rounded-[1.6rem] border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-950">
              {status.medusaSync.orderId
                ? `Your order is confirmed in our system${status.medusaSync.displayId ? ` as #${status.medusaSync.displayId}` : ""}.`
                : "Your payment is synced and ready for fulfillment."}
            </div>
          ) : null}

          {status?.medusaSync && status.medusaSync.ok === false ? (
            <div className="mt-6 rounded-[1.6rem] border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
              Payment is confirmed, but the internal order record still needs attention: {status.medusaSync.error}
            </div>
          ) : null}

          {status?.found === false && !isPaid ? (
            <div className="mt-6 rounded-[1.6rem] border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
              Your payment record is still being indexed. The page keeps polling automatically, so you can stay here and
              continue to the secure payment page.
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            {paymentUrl ? (
              <a
                href={paymentUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[color:var(--foreground)] px-6 py-3 text-sm font-semibold text-[color:var(--background)] transition hover:translate-y-[-1px]"
              >
                {isPaid ? "Open payment record" : "Open secure payment"}
              </a>
            ) : null}
            <Link
              href="/shop"
              className="rounded-full border border-[color:var(--border)] bg-white/65 px-6 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-white"
            >
              Continue browsing
            </Link>
          </div>
        </section>

        <section className="grid gap-6">
          <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--foreground)] p-7 text-[color:var(--background)]">
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:rgba(243,234,216,0.65)]">
              What happens next
            </div>
            <div className="mt-4 grid gap-4">
              {[
                "Use the secure payment page to choose the available payment method and finish the order.",
                "Keep this page open while we poll for payment confirmation every 5 seconds.",
                "Once confirmed, your cart is cleared locally so the next visit starts fresh.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4 text-sm leading-7 text-[color:rgba(243,234,216,0.82)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-7">
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
              Live status
            </div>
            <h2 className="font-display mt-4 text-4xl leading-none text-[color:var(--foreground)]">
              {isPaid ? "This order is paid." : "Waiting for confirmation."}
            </h2>
            <p className="text-ink-soft mt-5 text-sm leading-8">
              {lastCheckedAt
                ? `Last checked at ${new Date(lastCheckedAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                  })}.`
                : "The first payment status check is still running."}
            </p>
            <p className="text-ink-soft mt-4 text-sm leading-8">
              If the payment page did not open automatically in a new tab, use the button above. The same checkout link
              remains valid while the order stays pending.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function CheckoutPageFallback() {
  return (
    <main className="px-6 py-8 md:px-10 lg:px-16">
      <div className="mx-auto max-w-4xl rounded-[2.25rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-8 md:p-10">
        <div className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Checkout status
        </div>
        <h1 className="font-display mt-4 text-5xl leading-none text-[color:var(--foreground)]">
          Loading your payment session...
        </h1>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutPageFallback />}>
      <CheckoutPageContent />
    </Suspense>
  );
}
