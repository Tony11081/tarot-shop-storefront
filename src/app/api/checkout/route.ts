import { NextRequest, NextResponse } from "next/server";
import { createInflywayCheckout } from "@/lib/inflyway";
import { rememberInflywayCheckout } from "@/lib/medusa-checkout";
import { medusaServerFetch } from "@/lib/medusa-server";
import {
  isSupportedShippingCountry,
  supportedShippingCountriesText,
} from "@/lib/shipping";

function formatAmount(total = 0) {
  return Number((total / 100).toFixed(2));
}

function buildCheckoutTitle(cart: {
  items?: Array<{ quantity: number; title: string }>;
}) {
  const items = cart.items ?? [];
  const firstTitle = items[0]?.title || "TarotDeck.online order";

  if (items.length <= 1) {
    return firstTitle;
  }

  return `${firstTitle} + ${items.length - 1} more`;
}

function buildCheckoutNote(orderRef: string, cartId: string, email?: string) {
  return [`TarotDeck.online order ${orderRef}`, `cartId=${cartId}`, email ? `Buyer: ${email}` : ""]
    .filter(Boolean)
    .join(" | ");
}

function buildCheckoutRaw(
  orderRef: string,
  cartId: string,
  cart: {
    currency_code?: string;
    items?: Array<{ quantity: number; title: string }>;
    total?: number;
  },
  checkout?: {
    address_1?: string;
    city?: string;
    country_code?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    postal_code?: string;
  }
) {
  const items = (cart.items ?? [])
    .map((item) => `${item.title} x${item.quantity}`)
    .join(", ");

  const name = [checkout?.first_name, checkout?.last_name].filter(Boolean).join(" ").trim();
  const address = [
    checkout?.address_1,
    checkout?.city,
    checkout?.postal_code,
    checkout?.country_code?.toUpperCase(),
  ]
    .filter(Boolean)
    .join(", ");

  return [
    `Store: TarotDeck.online`,
    `Order Ref: ${orderRef}`,
    `Cart ID: ${cartId}`,
    items ? `Items: ${items}` : "",
    name ? `Customer: ${name}` : "",
    checkout?.email ? `Email: ${checkout.email}` : "",
    address ? `Ship to: ${address}` : "",
    `Amount: ${formatAmount(cart.total)} ${(cart.currency_code || "USD").toUpperCase()}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const { cartId, checkout } = await request.json();

    if (!cartId) {
      return NextResponse.json({ message: "cartId is required" }, { status: 400 });
    }

    const cartResponse = await medusaServerFetch(`/store/carts/${cartId}`);
    const cart = cartResponse?.cart;

    if (!cart) {
      return NextResponse.json({ message: "Cart not found" }, { status: 404 });
    }

    if (!cart.items?.length) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    const countryCode = String(checkout?.country_code || "").trim().toLowerCase();
    if (countryCode && !isSupportedShippingCountry(countryCode)) {
      return NextResponse.json(
        {
          message: `We currently ship to ${supportedShippingCountriesText}.`,
        },
        { status: 400 }
      );
    }

    if (checkout?.email || checkout?.address_1) {
      const address = checkout
        ? {
            first_name: checkout.first_name,
            last_name: checkout.last_name,
            address_1: checkout.address_1,
            city: checkout.city,
            postal_code: checkout.postal_code,
            country_code: checkout.country_code,
          }
        : undefined;

      await medusaServerFetch(`/store/carts/${cartId}`, {
        method: "POST",
        body: JSON.stringify({
          email: checkout?.email,
          shipping_address: address,
          billing_address: address,
        }),
      });
    }

    let checkoutCart = await medusaServerFetch(`/store/carts/${cartId}`);

    if (!checkoutCart?.cart?.shipping_methods?.length) {
      const shippingOptions = await medusaServerFetch(`/store/shipping-options?cart_id=${cartId}`);
      const optionId = shippingOptions?.shipping_options?.[0]?.id;

      if (!optionId) {
        return NextResponse.json({ message: "No shipping option available for cart" }, { status: 400 });
      }

      await medusaServerFetch(`/store/carts/${cartId}/shipping-methods`, {
        method: "POST",
        body: JSON.stringify({ option_id: optionId }),
      });

      checkoutCart = await medusaServerFetch(`/store/carts/${cartId}`);
    }

    const readyCart = checkoutCart?.cart;
    const total = readyCart?.total ?? 0;

    if (!total) {
      return NextResponse.json({ message: "Cart total is empty after shipping update" }, { status: 400 });
    }

    const orderRef = cartId;
    const payment = await createInflywayCheckout({
      amount: formatAmount(total),
      currency: readyCart?.currency_code || "USD",
      email: checkout?.email,
      note: buildCheckoutNote(orderRef, cartId, checkout?.email),
      orderRef,
      productKey: readyCart?.items?.[0]?.product_handle,
      raw: buildCheckoutRaw(orderRef, cartId, readyCart, checkout),
      title: buildCheckoutTitle(readyCart),
      type: "default",
    });

    await rememberInflywayCheckout(cartId, {
      inflyway_order_id: payment.orderId,
      inflyway_order_ref: orderRef,
      inflyway_payment_status: "pending",
      inflyway_payment_url: payment.orderUrl,
    });

    const searchParams = new URLSearchParams({
      cartId,
      orderId: payment.orderId,
      orderRef,
      paymentUrl: payment.orderUrl,
    });

    return NextResponse.json({
      payment: {
        amount: formatAmount(total),
        cartId,
        checkoutUrl: `/checkout?${searchParams.toString()}`,
        currency: (readyCart?.currency_code || "USD").toUpperCase(),
        orderId: payment.orderId,
        orderRef,
        paymentUrl: payment.orderUrl,
        statusUrl: `/api/checkout/status?${searchParams.toString()}`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
