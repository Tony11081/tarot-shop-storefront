#!/usr/bin/env node

const base = process.env.SITE_URL || "http://localhost:3000";

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

async function main() {
  const cart = await expectJson(`${base}/api/cart`, { method: "POST" });
  const cartId = cart?.cart?.id;
  if (!cartId) throw new Error("cart id missing");

  await expectJson(`${base}/api/cart/${cartId}/line-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variant_id: "variant_01KK8SARHR2Z50TFSJYHKCHKY0", quantity: 1 }),
  });

  const cartUpdate = await expectJson(`${base}/api/cart/${cartId}`, {
    method: "GET",
  });

  const currency = cartUpdate?.cart?.currency_code || "eur";
  if (!cartUpdate?.cart?.items?.length) throw new Error("line item missing after add");

  const medusaCartUpdate = await fetch(`${base}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartId }),
  });

  const completed = await medusaCartUpdate.json();
  if (!medusaCartUpdate.ok) throw new Error(JSON.stringify(completed).slice(0, 300));
  if (completed?.type !== "order" || !completed?.order?.id) throw new Error("order not created");

  console.log(JSON.stringify({ ok: true, currency, orderId: completed.order.id, displayId: completed.order.display_id }, null, 2));
}

main().catch((error) => {
  console.error("ORDER_FLOW_FAIL", error.message);
  process.exit(1);
});
