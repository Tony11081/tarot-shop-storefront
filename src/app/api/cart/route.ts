import { NextResponse } from "next/server";
import { medusaServerFetch } from "@/lib/medusa-server";

export async function POST() {
  try {
    const data = await medusaServerFetch("/store/carts", {
      method: "POST",
      body: JSON.stringify({ currency_code: "usd" }),
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create cart" },
      { status: 500 }
    );
  }
}
