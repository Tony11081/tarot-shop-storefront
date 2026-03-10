import { NextRequest, NextResponse } from "next/server";
import { medusaServerFetch } from "@/lib/medusa-server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await medusaServerFetch(`/store/carts/${id}`);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to load cart" },
      { status: 500 }
    );
  }
}
