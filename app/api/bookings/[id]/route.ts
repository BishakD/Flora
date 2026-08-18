import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * DELETE /api/bookings/[id]
 *
 * Called client-side when the guest closes the Razorpay modal without completing
 * payment. Deletes the draft booking row so it does not hold the room as
 * unavailable. Safety guard: only deletes rows with payment_status = 'awaiting_payment'
 * so a confirmed/paid booking can never be accidentally wiped.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing booking id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id)
      .eq("payment_status", "awaiting_payment"); // safety guard

    if (error) {
      console.error("[Booking DELETE] Supabase error:", error);
      return NextResponse.json(
        { error: "Could not remove draft booking." },
        { status: 500 },
      );
    }

    console.log(`[Booking DELETE] Cleaned up abandoned booking ${id}`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Booking DELETE] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
