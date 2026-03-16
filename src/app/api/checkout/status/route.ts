import { NextRequest, NextResponse } from "next/server";
import {
  InflywayRequestError,
  getInflywayOrder,
  isInflywayOrderPaid,
} from "@/lib/inflyway";
import { finalizeMedusaCart } from "@/lib/medusa-checkout";

function normalize(value: unknown) {
  return String(value ?? "").trim();
}

function isLookupMiss(error: unknown) {
  if (!(error instanceof InflywayRequestError)) return false;
  const bodyError =
    typeof error.body === "object" && error.body !== null && "error" in error.body
      ? normalize(error.body.error)
      : "";
  const message = `${error.message} ${bodyError}`.toLowerCase();
  return message.includes("not found") || message.includes("order not found") || message.includes("订单不存在");
}

export async function GET(request: NextRequest) {
  const cartId = normalize(request.nextUrl.searchParams.get("cartId"));
  const orderId = normalize(request.nextUrl.searchParams.get("orderId"));
  const orderRef = normalize(request.nextUrl.searchParams.get("orderRef"));
  const paymentUrl = normalize(request.nextUrl.searchParams.get("paymentUrl"));
  const query = orderId || orderRef;

  if (!query) {
    return NextResponse.json({ message: "orderId or orderRef is required" }, { status: 400 });
  }

  try {
    const order = await getInflywayOrder(query);
    const raw = order.raw ?? null;
    const paid = isInflywayOrderPaid(raw);
    const paymentStatus =
      normalize(raw?.paymentStatus) ||
      normalize(raw?.orderStatus) ||
      normalize(raw?.status) ||
      (paid ? "PAID" : "PENDING");
    let medusaSync: {
      alreadyCompleted?: boolean;
      displayId?: number | null;
      error?: string;
      orderId?: string | null;
      ok: boolean;
    } | null = null;

    if (paid && cartId) {
      try {
        const completed = await finalizeMedusaCart(cartId, {
          inflyway_order_id: order.orderId || orderId || undefined,
          inflyway_order_ref: orderRef || undefined,
          inflyway_paid_at:
            normalize(raw?.paymentSuccessTime) ||
            normalize(raw?.paySuccessTime) ||
            normalize(raw?.paymentTime) ||
            undefined,
          inflyway_payment_status: "paid",
          inflyway_payment_url: order.orderUrl || paymentUrl || undefined,
        });

        medusaSync = {
          ok: true,
          alreadyCompleted: completed.alreadyCompleted,
          orderId: completed.order?.id || null,
          displayId: completed.order?.display_id ?? null,
        };
      } catch (error) {
        medusaSync = {
          ok: false,
          error: error instanceof Error ? error.message : "Could not sync paid order to Medusa",
        };
      }
    }

    return NextResponse.json({
      success: true,
      found: true,
      cartId: cartId || null,
      medusaSync,
      paid,
      paymentUrl: order.orderUrl || paymentUrl || null,
      status: paid ? "paid" : "pending",
      order: {
        amount: order.amount ?? null,
        createdAt: order.createdAt ?? null,
        currency: order.currency || null,
        orderId: order.orderId || orderId || null,
        orderNumber: order.orderNumber || null,
        orderRef: orderRef || null,
        paymentStatus: paymentStatus || null,
      },
    });
  } catch (error) {
    if (isLookupMiss(error)) {
      return NextResponse.json({
        success: true,
        found: false,
        paid: false,
        paymentUrl: paymentUrl || null,
        status: "pending",
        order: {
          orderId: orderId || null,
          orderRef: orderRef || null,
        },
      });
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not load payment status" },
      { status: 502 }
    );
  }
}
