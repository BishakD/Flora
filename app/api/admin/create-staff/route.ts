/**
 * /api/admin/create-staff
 *
 * GET: Returns list of all staff accounts (Admin only).
 * POST: Creates a new Supabase Auth user and inserts matching staff row (Admin only).
 *
 * Runs server-side only with service-role privileges, securely verified by caller JWT.
 *
 * BOOTSTRAP MODE: If the staff table has zero rows, the first authenticated Supabase
 * user is treated as admin so they can seed the table. Once any admin row exists,
 * normal role-checking applies.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin, assertServiceRoleConfigured } from "@/lib/supabaseServiceRole";
import type { StaffRole } from "@/types/database";

async function verifyAdminCaller(request: NextRequest): Promise<
  | { error: string; status: number }
  | { user: { id: string; email?: string }; isBootstrap: boolean }
> {
  assertServiceRoleConfigured();

  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!accessToken) {
    return { error: "Unauthorized — no token provided.", status: 401 };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Verify the JWT with Supabase Auth
  const { data: { user }, error: userError } = await callerClient.auth.getUser();
  if (userError || !user) {
    return { error: "Unauthorized — invalid session.", status: 401 };
  }

  // ── Check how many admin rows exist (service-role, bypasses RLS) ──────────
  const { count: adminCount, error: countError } = await supabaseAdmin
    .from("staff")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  // If the table is completely empty (no admin rows at all) → bootstrap mode.
  // Allow the authenticated user through so they can create the first admin row.
  if (!countError && adminCount === 0) {
    console.log("[create-staff] Bootstrap mode: no admin rows found, allowing authenticated user.");
    return { user, isBootstrap: true };
  }

  // ── Normal mode: check if this specific user is an admin ─────────────────
  const { data: callerStaff, error: staffError } = await supabaseAdmin
    .from("staff")
    .select("role")
    .eq("id", user.id)
    .single();

  if (staffError || !callerStaff || callerStaff.role !== "admin") {
    return { error: "Forbidden — only admins can manage staff accounts.", status: 403 };
  }

  return { user, isBootstrap: false };
}

export async function GET(request: NextRequest) {
  try {
    try {
      assertServiceRoleConfigured();
    } catch {
      return NextResponse.json(
        { error: "Staff management is not yet configured — SUPABASE_SERVICE_ROLE_KEY is missing from .env.local." },
        { status: 503 }
      );
    }

    const authResult = await verifyAdminCaller(request);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { data: staffList, error: listError } = await supabaseAdmin
      .from("staff")
      .select("*")
      .order("created_at", { ascending: false });

    if (listError) {
      return NextResponse.json({ error: "Failed to load staff list." }, { status: 500 });
    }

    return NextResponse.json({ staff: staffList ?? [] });
  } catch (err) {
    console.error("[get-staff] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    try {
      assertServiceRoleConfigured();
    } catch {
      return NextResponse.json(
        { error: "Staff management is not yet configured — SUPABASE_SERVICE_ROLE_KEY is missing from .env.local." },
        { status: 503 }
      );
    }

    // ── 1. Verify caller is an authenticated admin (or bootstrap user) ─────
    const authResult = await verifyAdminCaller(request);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
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

    const normalizedEmail = email.trim().toLowerCase();

    // ── BOOTSTRAP SPECIAL CASE: Register the current caller themselves ──────
    // In bootstrap mode, if the caller is trying to add themselves as admin,
    // use their existing auth ID rather than creating a duplicate user.
    if (authResult.isBootstrap && normalizedEmail === authResult.user.email?.toLowerCase()) {
      const { error: insertError } = await supabaseAdmin
        .from("staff")
        .insert({
          id: authResult.user.id,
          email: normalizedEmail,
          role: role as StaffRole,
        });

      if (insertError && !insertError.message.includes("duplicate")) {
        return NextResponse.json(
          { error: "Failed to register admin in staff table: " + insertError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true, userId: authResult.user.id }, { status: 201 });
    }

    // ── 3. Create the Supabase Auth user (email confirmed immediately) ──────
    const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
    });

    if (createError || !newUserData.user) {
      const msg = createError?.message ?? "Failed to create user.";
      return NextResponse.json({ error: msg }, { status: 422 });
    }

    const newUserId = newUserData.user.id;

    // ── 4. Insert the staff row ────────────────────────────────────────────
    const { error: insertError } = await supabaseAdmin
      .from("staff")
      .insert({
        id: newUserId,
        email: normalizedEmail,
        role: role as StaffRole,
      });

    if (insertError) {
      // Rollback auth user if staff row fails
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
