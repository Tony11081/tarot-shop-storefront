#!/usr/bin/env node

const storefront = process.env.SITE_URL || "https://shop.rube.club";
const adminBase = process.env.MEDUSA_ADMIN_BASE_URL || "http://medusa-store-ga7di9-4e3642-23-94-38-181.traefik.me";
const adminKey = process.env.MEDUSA_ADMIN_SECRET_KEY || "sk_ad55414a5b44aac95492afdf718ee5a579448a75af1f59f9c70eb99d96586984";

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

(async () => {
  const report = [];

  const createdCart = await json(`${storefront}/api/cart`, { method: "POST" });
  const cartId = createdCart.data?.cart?.id;
  report.push({ step: "create-cart", ok: !!cartId, status: createdCart.status });
  if (!cartId) throw new Error("cart creation failed");

  const addItem = await json(`${storefront}/api/cart/${cartId}/line-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variant_id: "variant_01KK8SARHR2Z50TFSJYHKCHKY0", quantity: 1 }),
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
        city: "Copenhagen",
        postal_code: "2100",
        country_code: "dk",
      },
    }),
  });

  const orderId = checkout.data?.order?.id;
  report.push({ step: "checkout-to-order", ok: checkout.status === 200 && !!orderId, status: checkout.status, orderId });
  if (!orderId) throw new Error("order creation failed");

  const adminOrder = await json(`${adminBase}/admin/orders/${orderId}`, {
    headers: { Authorization: `Basic ${adminKey}` },
  });
  report.push({
    step: "admin-order-visible",
    ok: adminOrder.status === 200 && adminOrder.data?.order?.id === orderId,
    status: adminOrder.status,
    orderStatus: adminOrder.data?.order?.status,
  });

  const shippingTotal = adminOrder.data?.order?.shipping_total ?? 0;
  report.push({ step: "shipping-applied", ok: shippingTotal > 0, shippingTotal });

  console.log(JSON.stringify(report, null, 2));
  if (!report.every((item) => item.ok)) process.exit(1);
})();
