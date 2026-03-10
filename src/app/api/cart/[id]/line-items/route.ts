import { NextRequest, NextResponse } from "next/server";
import { medusaServerFetch } from "@/lib/medusa-server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await medusaServerFetch(`/store/carts/${id}/line-items`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to add line item" },
      { status: 500 }
    );
  }
}
