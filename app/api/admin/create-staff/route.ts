/**
 * /api/admin/create-staff
 *
 * GET: Returns list of all staff accounts.
 * POST: Creates a new staff user.
 * GET /api/admin/create-staff?debug=1  → returns diagnostic info (dev only).
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
    assertServiceRoleConfigured();
  } catch {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured in .env.local" }, { status: 503 });
  }

  // Debug endpoint
  if (request.nextUrl.searchParams.get("debug") === "1") {
    const user = await getCallerUser(request);

    // Count all rows and admin rows
    const { count: totalCount, error: totalErr } = await supabaseAdmin
      .from("staff").select("*", { count: "exact", head: true });
    const { count: adminCount, error: adminErr } = await supabaseAdmin
      .from("staff").select("*", { count: "exact", head: true }).eq("role", "admin");

    let callerRow = null;
    if (user) {
      const { data } = await supabaseAdmin.from("staff").select("*").eq("id", user.id).single();
      callerRow = data;
    }

    return NextResponse.json({
      callerUserId: user?.id ?? null,
      callerEmail: user?.email ?? null,
      totalStaffRows: totalCount,
      totalStaffError: totalErr?.message ?? null,
      adminRows: adminCount,
      adminCountError: adminErr?.message ?? null,
      callerStaffRow: callerRow,
    });
  }

  // Normal GET: return staff list (requires admin)
  const user = await getCallerUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: callerRow } = await supabaseAdmin
    .from("staff").select("role").eq("id", user.id).single();

  if (!callerRow || callerRow.role !== "admin") {
    // Check bootstrap: allow if no admins exist yet
    const { count: adminCount } = await supabaseAdmin
      .from("staff").select("*", { count: "exact", head: true }).eq("role", "admin");
    if (adminCount !== 0) {
      return NextResponse.json({ error: "Forbidden — only admins can manage staff accounts." }, { status: 403 });
    }
  }

  const { data: staffList, error } = await supabaseAdmin
    .from("staff").select("*").order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ staff: staffList ?? [] });
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    assertServiceRoleConfigured();
  } catch {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured in .env.local" }, { status: 503 });
  }

  // 1. Verify caller JWT
  const user = await getCallerUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized — invalid or missing session." }, { status: 401 });

  // 2. Check if caller is admin OR we are in bootstrap (zero admin rows)
  const { data: callerRow } = await supabaseAdmin
    .from("staff").select("role").eq("id", user.id).single();

  const { count: adminCount, error: adminCountError } = await supabaseAdmin
    .from("staff").select("*", { count: "exact", head: true }).eq("role", "admin");

  const isBootstrap = !adminCountError && adminCount === 0;
  const isAdmin = callerRow?.role === "admin";

  if (!isAdmin && !isBootstrap) {
    return NextResponse.json(
      {
        error: "Forbidden — only admins can manage staff accounts.",
        debug: {
          callerUserId: user.id,
          callerEmail: user.email,
          callerRow,
          adminCount,
          adminCountError: adminCountError?.message ?? null,
          isBootstrap,
        },
      },
      { status: 403 }
    );
  }

  // 3. Parse body
  const body = await request.json();
  const { email, password, role } = body as { email?: string; password?: string; role?: string };

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

  // 4. Bootstrap self-registration: if adding yourself (existing auth user), just upsert staff row
  if (isBootstrap) {
    // Find auth user matching the submitted email
    const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = authUsers.find(u => u.email?.toLowerCase() === normalizedEmail);

    if (existingAuthUser) {
      // Upsert existing user into staff table as admin
      const { error: upsertError } = await supabaseAdmin.from("staff").upsert({
        id: existingAuthUser.id,
        email: normalizedEmail,
        role: role as StaffRole,
      });
      if (upsertError) {
        return NextResponse.json({ error: "Staff row upsert failed: " + upsertError.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, userId: existingAuthUser.id, bootstrapped: true }, { status: 201 });
    }
  }

  // 5. Create a brand new Supabase Auth user
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
}
