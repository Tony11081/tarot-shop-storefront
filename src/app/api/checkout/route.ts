import { NextRequest, NextResponse } from "next/server";
import { medusaServerFetch } from "@/lib/medusa-server";

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

    const refreshedCart = await medusaServerFetch(`/store/carts/${cartId}`);

    if (!refreshedCart?.cart?.shipping_methods?.length) {
      const shippingOptions = await medusaServerFetch(`/store/shipping-options?cart_id=${cartId}`);
      const optionId = shippingOptions?.shipping_options?.[0]?.id;

      if (!optionId) {
        return NextResponse.json({ message: "No shipping option available for cart" }, { status: 400 });
      }

      await medusaServerFetch(`/store/carts/${cartId}/shipping-methods`, {
        method: "POST",
        body: JSON.stringify({ option_id: optionId }),
      });
    }

    const paymentCollection = await medusaServerFetch(`/store/payment-collections`, {
      method: "POST",
      body: JSON.stringify({ cart_id: cartId }),
    });

    const paymentCollectionId = paymentCollection?.payment_collection?.id;

    if (!paymentCollectionId) {
      return NextResponse.json({ message: "Payment collection was not created" }, { status: 500 });
    }

    await medusaServerFetch(`/store/payment-collections/${paymentCollectionId}/payment-sessions`, {
      method: "POST",
      body: JSON.stringify({ provider_id: "pp_system_default" }),
    });

    const completed = await medusaServerFetch(`/store/carts/${cartId}/complete`, {
      method: "POST",
      body: JSON.stringify({}),
    });

    return NextResponse.json(completed);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
