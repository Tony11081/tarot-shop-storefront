import { NextRequest, NextResponse } from "next/server";

const INFLYWAY_API_URL = "https://inflyway-api.openaigrowth.com";
const INFLYWAY_API_KEY = "c24258da8211526bc68eba2093f4fb99";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, amount, currency = "USD", orderRef, title, description } = body;

    if (!cartId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: cartId, amount" },
        { status: 400 }
      );
    }

    // 创建 Inflyway 支付链接
    const response = await fetch(`${INFLYWAY_API_URL}/checkout/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": INFLYWAY_API_KEY,
      },
      body: JSON.stringify({
        amount: parseFloat(amount),
        currency,
        orderRef: orderRef || cartId,
        title: title || "Tarot Deck Purchase",
        description: description || "Purchase from Mystic Tarot",
        metadata: {
          cartId,
          source: "tarot-shop",
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Inflyway API error:", error);
      return NextResponse.json(
        { error: "Failed to create payment link" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      paymentUrl: data.paymentUrl || data.orderUrl,
      orderId: data.orderId,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
