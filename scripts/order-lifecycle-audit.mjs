#!/usr/bin/env node

const storefront = process.env.SITE_URL || "http://localhost:3000";
const medusaBase =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://medusa-store-ga7di9-4e3642-23-94-38-181.traefik.me";
const publishableKey =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  "pk_1680d70a6d1559ca982e784f4f4bd3557a8d2a1a10872376febf48b1ec86e6d3";

async function json(url, init = {}) {
  const res = await fetch(url, init);
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  return { status: res.status, data };
}

async function getSeededVariant() {
  const res = await fetch(`${medusaBase}/store/products?limit=1`, {
    headers: {
      "x-publishable-api-key": publishableKey,
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  const variantId = data?.products?.[0]?.variants?.[0]?.id;
  if (!variantId) throw new Error("variant id missing");
  return variantId;
}

(async () => {
  const variantId = await getSeededVariant();
  const report = [];

  const createdCart = await json(`${storefront}/api/cart`, { method: "POST" });
  const cartId = createdCart.data?.cart?.id;
  report.push({ step: "create-cart", ok: !!cartId, status: createdCart.status });
  if (!cartId) throw new Error("cart creation failed");

  const addItem = await json(`${storefront}/api/cart/${cartId}/line-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variant_id: variantId, quantity: 1 }),
  });
  report.push({ step: "add-item", ok: addItem.status === 200, status: addItem.status });

  const checkout = await json(`${storefront}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cartId,
      checkout: {
        email: "audit@example.com",
        first_name: "Audit",
        last_name: "Buyer",
        address_1: "123 Main St",
        city: "New York",
        postal_code: "10001",
        country_code: "us",
      },
    }),
  });

  const payment = checkout.data?.payment;
  report.push({
    step: "checkout-to-payment-link",
    ok: checkout.status === 200 && !!payment?.orderId && !!payment?.paymentUrl,
    status: checkout.status,
    orderId: payment?.orderId,
    orderRef: payment?.orderRef,
  });
  if (!payment?.orderId || !payment?.statusUrl) throw new Error("payment link creation failed");

  const statusLookup = await json(`${storefront}${payment.statusUrl}`);
  report.push({
    step: "inflyway-status-visible",
    ok: statusLookup.status === 200 && statusLookup.data?.order?.orderId === payment.orderId,
    status: statusLookup.status,
    paymentStatus: statusLookup.data?.order?.paymentStatus,
  });

  const pendingState = statusLookup.data?.status;
  report.push({
    step: "payment-pending-or-paid",
    ok: pendingState === "pending" || pendingState === "paid",
    state: pendingState,
  });

  console.log(JSON.stringify(report, null, 2));
  if (!report.every((item) => item.ok)) process.exit(1);
})();
