import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * DELETE /api/admin/bookings/[id]
 *
 * Permanently hard-deletes a booking row from Supabase.
 * Does NOT trigger a refund, email, or any other side effects.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing required booking id" }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization");
    const clientOptions = authHeader
      ? { global: { headers: { Authorization: authHeader } } }
      : undefined;

    const supabaseClient = createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      clientOptions,
    );

    console.log(`[Admin DELETE Booking] Deleting booking ${id}...`);

    const { error } = await supabaseClient
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[Admin DELETE Booking] Failed to delete booking:", error);
      return NextResponse.json(
        {
          error: error.message || "Failed to delete booking",
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
        { status: 500 },
      );
    }

    console.log(`[Admin DELETE Booking] Successfully deleted booking ${id}`);
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("[Admin DELETE Booking] Unexpected exception:", err);
    return NextResponse.json(
      { error: err?.message || "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
