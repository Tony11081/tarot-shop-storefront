import { NextRequest, NextResponse } from "next/server";
import { medusaServerFetch } from "@/lib/medusa-server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; lineItemId: string }> }
) {
  try {
    const { id, lineItemId } = await params;
    const data = await medusaServerFetch(`/store/carts/${id}/line-items/${lineItemId}`, {
      method: "DELETE",
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to remove line item" },
      { status: 500 }
    );
  }
}
