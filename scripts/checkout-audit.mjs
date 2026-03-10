#!/usr/bin/env node

const base = process.env.MEDUSA_BACKEND_URL || 'http://medusa-store-ga7di9-4e3642-23-94-38-181.traefik.me';
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'pk_09366c13946417ef754c5f686e295be2dc1df6d2c3532dc2942d185772ed9698';
const variantId = process.env.TEST_VARIANT_ID || 'variant_01KK8SARHR2Z50TFSJYHKCHKY0';

async function request(path, init = {}) {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      'x-publishable-api-key': publishableKey,
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  return { status: res.status, data };
}

(async () => {
  const report = [];

  const cartCreate = await request('/store/carts', { method: 'POST', body: JSON.stringify({ currency_code: 'eur' }) });
  report.push({ step: 'create-cart', status: cartCreate.status, ok: cartCreate.status === 200 });
  const cartId = cartCreate.data?.cart?.id;
  if (!cartId) throw new Error('cart_id missing');

  const addItem = await request(`/store/carts/${cartId}/line-items`, {
    method: 'POST',
    body: JSON.stringify({ variant_id: variantId, quantity: 1 }),
  });
  report.push({ step: 'add-item', status: addItem.status, ok: addItem.status === 200 });

  const setEmail = await request(`/store/carts/${cartId}`, {
    method: 'POST',
    body: JSON.stringify({ email: 'audit@example.com' }),
  });
  report.push({ step: 'set-email', status: setEmail.status, ok: setEmail.status === 200 });

  const setAddress = await request(`/store/carts/${cartId}`, {
    method: 'POST',
    body: JSON.stringify({
      shipping_address: {
        first_name: 'Audit',
        last_name: 'Buyer',
        address_1: '123 Main St',
        city: 'Copenhagen',
        postal_code: '2100',
        country_code: 'dk',
      },
    }),
  });
  report.push({ step: 'set-address', status: setAddress.status, ok: setAddress.status === 200 });

  const shipping = await request(`/store/shipping-options?cart_id=${cartId}`);
  report.push({
    step: 'shipping-options',
    status: shipping.status,
    ok: shipping.status === 200 && Array.isArray(shipping.data?.shipping_options) && shipping.data.shipping_options.length > 0,
    count: shipping.data?.shipping_options?.length || 0,
  });

  const payments = await request('/store/payment-providers?region_id=reg_01KK6SYAG4ANA6V91PM92MX62S');
  report.push({
    step: 'payment-providers',
    status: payments.status,
    ok: payments.status === 200 && Array.isArray(payments.data?.payment_providers) && payments.data.payment_providers.length > 0,
    count: payments.data?.payment_providers?.length || 0,
  });

  console.log(JSON.stringify(report, null, 2));

  const failed = report.filter((r) => !r.ok);
  if (failed.length) process.exit(1);
})();
