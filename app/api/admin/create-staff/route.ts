/**
 * POST /api/admin/create-staff
 *
 * Creates a new Supabase Auth user and inserts a matching staff row.
 * Only authenticated admins (role = 'admin' in the staff table) may call this.
 *
 * Body: { email: string; password: string; role: 'admin' | 'reception' }
 *
 * This route runs server-side only and uses the service-role key which is
 * never exposed to the browser.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin, assertServiceRoleConfigured } from "@/lib/supabaseServiceRole";
import type { StaffRole } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    // Guard: ensure SUPABASE_SERVICE_ROLE_KEY is configured
    try {
      assertServiceRoleConfigured();
    } catch {
      return NextResponse.json(
        { error: "Staff management is not yet configured — SUPABASE_SERVICE_ROLE_KEY is missing from .env.local." },
        { status: 503 }
      );
    }

    // ── 1. Verify the caller is an authenticated admin ─────────────────────
    const authHeader = request.headers.get("authorization");
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized — no token provided." }, { status: 401 });
    }

    // Use the anon key to validate the caller's JWT and look up their role.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify the token by fetching the current user
    const { data: { user }, error: userError } = await callerClient.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized — invalid session." }, { status: 401 });
    }

    // Check the caller's role in the staff table
    const { data: callerStaff, error: staffError } = await callerClient
      .from("staff")
      .select("role")
      .eq("id", user.id)
      .single();

    if (staffError || !callerStaff || callerStaff.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden — only admins can create staff accounts." },
        { status: 403 }
      );
    }

    // ── 2. Parse and validate the request body ─────────────────────────────
    const body = await request.json();
    const { email, password, role } = body as {
      email?: string;
      password?: string;
      role?: string;
    };

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, role." },
        { status: 400 }
      );
    }

    if (role !== "admin" && role !== "reception") {
      return NextResponse.json(
        { error: "Invalid role. Must be 'admin' or 'reception'." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // ── 3. Create the Supabase Auth user (bypasses email confirmation) ─────
    const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true, // Mark email as confirmed immediately
    });

    if (createError || !newUserData.user) {
      const msg = createError?.message ?? "Failed to create user.";
      return NextResponse.json({ error: msg }, { status: 422 });
    }

    const newUserId = newUserData.user.id;

    // ── 4. Insert the staff row (service-role bypasses RLS) ────────────────
    const { error: insertError } = await supabaseAdmin
      .from("staff")
      .insert({
        id: newUserId,
        email: email.trim().toLowerCase(),
        role: role as StaffRole,
      });

    if (insertError) {
      // Rollback: delete the auth user so we don't leave orphaned accounts
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return NextResponse.json(
        { error: "Created auth user but failed to save staff record. Rolled back." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, userId: newUserId }, { status: 201 });
  } catch (err) {
    console.error("[create-staff] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
