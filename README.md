# TarotDeck.online

TarotDeck.online is a tarot storefront built from the local OpenClaw ecommerce template, with Medusa powering catalog and cart data and Inflyway handling payment collection.

## Stack

- Next.js 16 App Router
- Tailwind CSS 4
- Medusa store API for products and cart state
- Inflyway payment-link checkout
- Vercel Analytics page views and custom events

## Local development

```bash
npm install
npm run dev
```

The storefront reads Medusa connection values from `.env.local`.

## Lead capture

The site now includes an email capture flow for first-deck shoppers, gift buyers, and collectors.

- If `LEAD_CAPTURE_WEBHOOK_URL` is set, lead submissions post there.
- If `RESEND_API_KEY` and `LEAD_CAPTURE_TO_EMAIL` are set, the lead is also emailed to your inbox.
- Without either, submissions still succeed and are written to server logs so you do not lose the request during testing.

## Verification

```bash
npm run build
npm run lint
npm run smoke
```

`npm run smoke` expects the app to be running on `http://localhost:3000`.

`npm run order:smoke` and `npm run order:lifecycle` now create real Inflyway payment-link orders, so use them only when you want a live checkout verification.

## Catalog seed

The tarot catalog that seeded the Medusa backend lives in [medusa-site-config.json](/Users/chengyadong/Documents/tarotdeck.online/medusa-site-config.json).

## Launch note

The storefront now creates live Inflyway payment links from the Medusa cart. Before public launch, confirm your fulfillment workflow and shipping settings for your target region.
