#!/usr/bin/env node

const base = process.env.SITE_URL || "http://localhost:3000";
const apiBase = process.env.API_BASE || base;

function log(step, message) {
  console.log(`[${step}] ${message}`);
}

async function expectOk(url, init) {
  const res = await fetch(url, init);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${url} -> ${res.status} ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : {};
}

async function main() {
  log("0/6", `Check health endpoint ${base}/api/health`);
  const health = await fetch(`${base}/api/health`);
  if (!health.ok) throw new Error(`Health endpoint failed: ${health.status}`);
  const healthJson = await health.json();
  if (!healthJson.ok) throw new Error(`Health endpoint returned not ok: ${JSON.stringify(healthJson)}`);

  log("1/5", `Check homepage ${base}`);
  const home = await fetch(base);
  if (!home.ok) throw new Error(`Homepage failed: ${home.status}`);
  const homeHtml = await home.text();
  if (!homeHtml.includes("Shop") && !homeHtml.includes("Rube Club")) {
    throw new Error("Homepage rendered unexpected content");
  }

  log("2/5", "Check product page");
  const product = await fetch(`${base}/products/custom-graphic-hoodie`);
  if (!product.ok) throw new Error(`Product page failed: ${product.status}`);
  const productHtml = await product.text();
  if (!productHtml.includes("Add to cart")) {
    throw new Error("Product page missing add to cart UI");
  }

  log("3/5", "Create cart via app API");
  const created = await expectOk(`${apiBase}/api/cart`, { method: "POST" });
  const cartId = created?.cart?.id;
  if (!cartId) throw new Error("Cart id missing");

  log("4/5", "Add line item via app API");
  const added = await expectOk(`${apiBase}/api/cart/${cartId}/line-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      variant_id: "variant_01KK8SARHR2Z50TFSJYHKCHKY0",
      quantity: 1,
    }),
  });

  if (!added?.cart?.items?.length) throw new Error("Cart item was not added");

  log("5/5", "Remove line item and confirm clean cart");
  const lineItemId = added.cart.items[0].id;
  const removed = await expectOk(`${apiBase}/api/cart/${cartId}/line-items/${lineItemId}`, {
    method: "DELETE",
  });

  if (removed?.cart?.items?.length) throw new Error("Cart item still present after delete");

  console.log("SMOKE_TEST_OK");
}

main().catch((error) => {
  console.error("SMOKE_TEST_FAIL", error.message);
  process.exit(1);
});
