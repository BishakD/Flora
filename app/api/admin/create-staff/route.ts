/**
 * /api/admin/create-staff
 *
 * GET: Returns list of all staff accounts (Admin only).
 * POST: Creates a new Supabase Auth user and inserts matching staff row (Admin only).
 *
 * Runs server-side only with service-role privileges, securely verified by caller JWT.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin, assertServiceRoleConfigured } from "@/lib/supabaseServiceRole";
import type { StaffRole } from "@/types/database";

async function verifyAdminCaller(request: NextRequest) {
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

  // Check the caller's role in the staff table using supabaseAdmin (bypasses RLS on server)
  const { data: callerStaff, error: staffError } = await supabaseAdmin
    .from("staff")
    .select("role")
    .eq("id", user.id)
    .single();

  if (staffError || !callerStaff || callerStaff.role !== "admin") {
    return { error: "Forbidden — only admins can manage staff accounts.", status: 403 };
  }

  return { user, callerStaff };
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

    // ── 1. Verify caller is an authenticated admin ─────────────────────────
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

    // ── 3. Create the Supabase Auth user (email confirmed immediately) ──────
    const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
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
        email: email.trim().toLowerCase(),
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
