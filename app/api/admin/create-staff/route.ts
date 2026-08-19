/**
 * /api/admin/create-staff
 *
 * GET: Returns list of all staff accounts.
 *      If no admins exist in the staff table, auto-seeds the current authenticated user as admin.
 * POST: Creates a new staff user or seeds admin.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin, assertServiceRoleConfigured } from "@/lib/supabaseServiceRole";
import type { StaffRole } from "@/types/database";

// ── Auth helper ───────────────────────────────────────────────────────────────

async function getCallerUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!accessToken) return null;

  const callerClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );

  const { data: { user }, error } = await callerClient.auth.getUser();
  return error || !user ? null : user;
}

// ── GET ───────────────────────────────────────────────────────────────────────

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

    const user = await getCallerUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: allStaff, error: listError } = await supabaseAdmin
      .from("staff")
      .select("*")
      .order("created_at", { ascending: false });

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const adminRows = (allStaff ?? []).filter((s) => s.role === "admin");
    const callerRow = (allStaff ?? []).find((s) => s.id === user.id);

    // ── AUTO-BOOTSTRAP ────────────────────────────────────────────────────────
    // If no admin rows exist yet in the staff table, automatically register the
    // current authenticated user as the first admin.
    if (adminRows.length === 0 && user.email) {
      console.log("[create-staff] Auto-bootstrapping first admin user:", user.email);
      await supabaseAdmin.from("staff").upsert({
        id: user.id,
        email: user.email.toLowerCase(),
        role: "admin",
      });

      const { data: refreshedStaff } = await supabaseAdmin
        .from("staff")
        .select("*")
        .order("created_at", { ascending: false });

      return NextResponse.json({ staff: refreshedStaff ?? [] });
    }

    if (callerRow?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden — only admins can manage staff accounts." },
        { status: 403 }
      );
    }

    return NextResponse.json({ staff: allStaff ?? [] });
  } catch (err) {
    console.error("[get-staff] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────

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

    // 1. Verify caller JWT
    const user = await getCallerUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized — invalid or missing session." }, { status: 401 });
    }

    // 2. Fetch current staff table
    const { data: allStaff } = await supabaseAdmin
      .from("staff")
      .select("*");

    const adminRows = (allStaff ?? []).filter((s) => s.role === "admin");
    const callerRow = (allStaff ?? []).find((s) => s.id === user.id);
    const isBootstrap = adminRows.length === 0;
    const isAdmin = callerRow?.role === "admin";

    // In bootstrap mode, ensure caller is saved as admin
    if (isBootstrap && user.email) {
      await supabaseAdmin.from("staff").upsert({
        id: user.id,
        email: user.email.toLowerCase(),
        role: "admin",
      });
    } else if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden — only admins can manage staff accounts." },
        { status: 403 }
      );
    }

    // 3. Parse body
    const body = await request.json();
    const { email, password, role } = body as {
      email?: string;
      password?: string;
      role?: string;
    };

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields: email, password, role." }, { status: 400 });
    }
    if (role !== "admin" && role !== "reception") {
      return NextResponse.json({ error: "Invalid role. Must be 'admin' or 'reception'." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 4. If adding themselves, it's already done in bootstrap
    if (user.email && normalizedEmail === user.email.toLowerCase()) {
      await supabaseAdmin.from("staff").upsert({
        id: user.id,
        email: normalizedEmail,
        role: role as StaffRole,
      });
      return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
    }

    // 5. Create a new Supabase Auth user
    const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
    });

    if (createError || !newUserData.user) {
      return NextResponse.json({ error: createError?.message ?? "Failed to create user." }, { status: 422 });
    }

    const newUserId = newUserData.user.id;

    // 6. Insert staff row
    const { error: insertError } = await supabaseAdmin.from("staff").insert({
      id: newUserId,
      email: normalizedEmail,
      role: role as StaffRole,
    });

    if (insertError) {
      await supabaseAdmin.auth.admin.deleteUser(newUserId); // rollback
      return NextResponse.json({ error: "Staff insert failed: " + insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, userId: newUserId }, { status: 201 });
  } catch (err) {
    console.error("[create-staff] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
