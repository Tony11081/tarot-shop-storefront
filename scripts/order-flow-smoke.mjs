#!/usr/bin/env node

const base = process.env.SITE_URL || "http://localhost:3000";
const medusaBase =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://medusa-store-ga7di9-4e3642-23-94-38-181.traefik.me";
const publishableKey =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  "pk_1680d70a6d1559ca982e784f4f4bd3557a8d2a1a10872376febf48b1ec86e6d3";

async function expectJson(url, init) {
  const res = await fetch(url, init);
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) throw new Error(`${url} -> ${res.status} ${JSON.stringify(data).slice(0, 300)}`);
  return data;
}

async function getSeededVariant() {
  const res = await fetch(`${medusaBase}/store/products?limit=1`, {
    headers: {
      "x-publishable-api-key": publishableKey,
    },
  });
  const data = await res.json();
  const variantId = data?.products?.[0]?.variants?.[0]?.id;

  if (!variantId) throw new Error("variant id missing");
  return variantId;
}

async function main() {
  const variantId = await getSeededVariant();
  const cart = await expectJson(`${base}/api/cart`, { method: "POST" });
  const cartId = cart?.cart?.id;
  if (!cartId) throw new Error("cart id missing");

  await expectJson(`${base}/api/cart/${cartId}/line-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variant_id: variantId, quantity: 1 }),
  });

  const cartUpdate = await expectJson(`${base}/api/cart/${cartId}`, {
    method: "GET",
  });

  const currency = cartUpdate?.cart?.currency_code || "eur";
  if (!cartUpdate?.cart?.items?.length) throw new Error("line item missing after add");

  const checkoutResponse = await fetch(`${base}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cartId,
      checkout: {
        email: "smoke@example.com",
        first_name: "Smoke",
        last_name: "Test",
        address_1: "123 Main St",
        city: "New York",
        postal_code: "10001",
        country_code: "us",
      },
    }),
  });

  const checkout = await checkoutResponse.json();
  if (!checkoutResponse.ok) throw new Error(JSON.stringify(checkout).slice(0, 300));
  const payment = checkout?.payment;
  if (!payment?.orderId || !payment?.paymentUrl || !payment?.orderRef) {
    throw new Error("payment link not created");
  }

  const status = await expectJson(`${base}${payment.statusUrl}`);
  if (status?.order?.orderId !== payment.orderId) {
    throw new Error("payment status lookup failed");
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        currency,
        orderId: payment.orderId,
        orderRef: payment.orderRef,
        paymentUrl: payment.paymentUrl,
        status: status.status,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("ORDER_FLOW_FAIL", error.message);
  process.exit(1);
});
