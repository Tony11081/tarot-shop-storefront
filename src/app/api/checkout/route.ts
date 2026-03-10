import { NextRequest, NextResponse } from "next/server";
import { medusaServerFetch } from "@/lib/medusa-server";

const INFLYWAY_API_URL = "https://inflyway-api.openaigrowth.com";
const INFLYWAY_API_KEY = "c24258da8211526bc68eba2093f4fb99";

export async function POST(request: NextRequest) {
  try {
    const { cartId, checkout, useInflyway = true } = await request.json();

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

    // 如果使用 Inflyway 支付，创建支付链接
    if (useInflyway) {
      const finalCart = await medusaServerFetch(`/store/carts/${cartId}`);
      const total = finalCart?.cart?.total || 0;
      const currency = finalCart?.cart?.region?.currency_code?.toUpperCase() || "USD";
      
      // 获取商品标题
      const items = finalCart?.cart?.items || [];
      const title = items.length > 0 
        ? items.map((item: any) => item.title).join(", ")
        : "Tarot Deck Purchase";

      // 创建 Inflyway 支付链接
      const inflywayResponse = await fetch(`${INFLYWAY_API_URL}/checkout/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": INFLYWAY_API_KEY,
        },
        body: JSON.stringify({
          amount: total / 100, // Medusa 使用分为单位，Inflyway 使用元
          currency,
          orderRef: cartId,
          title: `Order ${cartId}`,
          description: title,
          metadata: {
            cartId,
            source: "tarot-shop",
            email: checkout?.email,
          },
        }),
      });

      if (!inflywayResponse.ok) {
        const error = await inflywayResponse.text();
        console.error("Inflyway API error:", error);
        return NextResponse.json(
          { message: "Failed to create payment link" },
          { status: 500 }
        );
      }

      const inflywayData = await inflywayResponse.json();

      return NextResponse.json({
        success: true,
        paymentUrl: inflywayData.paymentUrl || inflywayData.orderUrl,
        orderId: inflywayData.orderId,
        cartId,
        total,
        currency,
      });
    }

    // 原有的 Medusa 支付流程（作为备用）
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
