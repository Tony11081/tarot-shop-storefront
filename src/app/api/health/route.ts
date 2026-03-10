import { NextResponse } from "next/server";
import { medusaServerFetch } from "@/lib/medusa-server";

export async function GET() {
  try {
    const data = await medusaServerFetch("/store/products?limit=1");

    return NextResponse.json({
      ok: true,
      service: "medusa-storefront",
      backendReachable: Array.isArray(data?.products),
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        service: "medusa-storefront",
        message: error instanceof Error ? error.message : "Health check failed",
        checkedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
