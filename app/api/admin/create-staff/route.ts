/**
 * /api/admin/create-staff
 *
 * GET: Returns list of all staff accounts.
 *      If no admins exist in the staff table, auto-seeds the current authenticated user as admin.
 * POST: Creates a new staff user or seeds admin.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  supabaseAdmin,
  assertServiceRoleConfigured,
} from "@/lib/supabaseServiceRole";
import type { StaffRole } from "@/types/database";
import { sendStaffWelcomeEmail, sendStaffRemovalEmail } from "@/lib/email";

// ── Auth helper ───────────────────────────────────────────────────────────────

export async function getCallerUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  if (!accessToken) return null;

  const callerClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );

  const {
    data: { user },
    error,
  } = await callerClient.auth.getUser();
  return error || !user ? null : user;
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    try {
      assertServiceRoleConfigured();
    } catch {
      return NextResponse.json(
        {
          error:
            "Staff management is not yet configured — SUPABASE_SERVICE_ROLE_KEY is missing from .env.local.",
        },
        { status: 503 },
      );
    }

    // Diagnostic endpoint: /api/admin/create-staff?debug=1
    if (request.nextUrl.searchParams.get("debug") === "1") {
      const user = await getCallerUser(request);

      const { data: rawStaffTable, error: dumpError } = await supabaseAdmin
        .from("staff")
        .select("*");

      const { data: authUsers, error: authUsersError } =
        await supabaseAdmin.auth.admin.listUsers();

      return NextResponse.json({
        diagnostic: {
          caller: {
            id: user?.id ?? "NO_USER",
            email: user?.email ?? "NO_EMAIL",
            isAuthenticated: !!user,
          },
          staffTableContent: rawStaffTable,
          staffTableFetchError: dumpError?.message || null,
          allAuthUsersCount: authUsers?.users?.length || 0,
          authUsersFetchError: authUsersError?.message || null,
          envVariablesPresent: {
            SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          },
        },
      });
    }

    const user = await getCallerUser(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: allStaff, error: listError } = await supabaseAdmin
      .from("staff")
      .select("*")
      .order("created_at", { ascending: false });

    if (listError) {
      console.error(
        "[create-staff API] Error fetching staff table:",
        listError,
      );
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const adminRows = (allStaff ?? []).filter((s) => s.role === "admin");
    const callerRow = (allStaff ?? []).find((s) => s.id === user.id);

    // ── AUTO-BOOTSTRAP ────────────────────────────────────────────────────────
    if (adminRows.length === 0 && user.email) {
      console.log(
        "[create-staff] Auto-bootstrapping first admin user:",
        user.email,
      );
      const { error: upsertErr } = await supabaseAdmin.from("staff").upsert({
        id: user.id,
        email: user.email.toLowerCase(),
        role: "admin",
      });

      if (upsertErr) {
        console.error(
          "[create-staff API] Error during auto-bootstrap upsert:",
          upsertErr,
        );
      }

      const { data: refreshedStaff } = await supabaseAdmin
        .from("staff")
        .select("*")
        .order("created_at", { ascending: false });

      return NextResponse.json({ staff: refreshedStaff ?? [] });
    }

    if (callerRow?.role !== "admin") {
      console.warn(
        "[create-staff API] Forbidden. Caller row:",
        callerRow,
        "Admin rows count:",
        adminRows.length,
      );
      return NextResponse.json(
        { error: "Forbidden — only admins can manage staff accounts." },
        { status: 403 },
      );
    }

    return NextResponse.json({ staff: allStaff ?? [] });
  } catch (err) {
    console.error("[get-staff] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    try {
      assertServiceRoleConfigured();
    } catch {
      return NextResponse.json(
        {
          error:
            "Staff management is not yet configured — SUPABASE_SERVICE_ROLE_KEY is missing from .env.local.",
        },
        { status: 503 },
      );
    }

    // 1. Verify caller JWT
    const user = await getCallerUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized — invalid or missing session." },
        { status: 401 },
      );
    }

    // 2. Fetch current staff table
    const { data: allStaff, error: fetchErr } = await supabaseAdmin
      .from("staff")
      .select("*");

    if (fetchErr) {
      console.error(
        "[create-staff POST] Error fetching staff table:",
        fetchErr,
      );
    }

    const adminRows = (allStaff ?? []).filter((s) => s.role === "admin");
    const callerRow = (allStaff ?? []).find((s) => s.id === user.id);
    const isBootstrap = adminRows.length === 0;
    const isAdmin = callerRow?.role === "admin";

    // In bootstrap mode, ensure caller is saved as admin
    if (isBootstrap && user.email) {
      console.log(
        "[create-staff POST] Bootstrap mode active. Upserting caller as admin:",
        user.id,
      );
      const { error: upsertErr } = await supabaseAdmin.from("staff").upsert({
        id: user.id,
        email: user.email.toLowerCase(),
        role: "admin",
      });
      if (upsertErr) {
        console.error("[create-staff POST] Bootstrap upsert error:", upsertErr);
      }
    } else if (!isAdmin) {
      console.warn(
        "[create-staff POST] Forbidden. Caller role is not admin. CallerRow:",
        callerRow,
      );
      return NextResponse.json(
        { error: "Forbidden — only admins can manage staff accounts." },
        { status: 403 },
      );
    }

    // 3. Parse body
    const body = await request.json();
    const { name, email, password, role } = body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, password, role." },
        { status: 400 },
      );
    }
    if (role !== "admin" && role !== "reception") {
      return NextResponse.json(
        { error: "Invalid role. Must be 'admin' or 'reception'." },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    // 4. If adding themselves, it's already done in bootstrap
    if (user.email && normalizedEmail === user.email.toLowerCase()) {
      const { error: upsertSelfErr } = await supabaseAdmin
        .from("staff")
        .upsert({
          id: user.id,
          email: normalizedEmail,
          role: role as StaffRole,
          name: normalizedName,
        });
      if (upsertSelfErr) {
        console.error(
          "[create-staff POST] Error upserting self:",
          upsertSelfErr,
        );
      }
      // Try to update auth metadata too
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: { full_name: normalizedName },
      });

      return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
    }

    // 5. Create a new Supabase Auth user
    const { data: newUserData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name: normalizedName },
      });

    if (createError || !newUserData.user) {
      console.error(
        "[create-staff POST] Error creating auth user:",
        createError,
      );
      return NextResponse.json(
        { error: createError?.message ?? "Failed to create user." },
        { status: 422 },
      );
    }

    const newUserId = newUserData.user.id;

    // 6. Insert staff row
    const { error: insertError } = await supabaseAdmin.from("staff").insert({
      id: newUserId,
      email: normalizedEmail,
      role: role as StaffRole,
      name: normalizedName,
    });

    if (insertError) {
      console.error(
        "[create-staff POST] Error inserting into staff table (rolling back user creation):",
        insertError,
      );
      await supabaseAdmin.auth.admin.deleteUser(newUserId); // rollback
      return NextResponse.json(
        { error: "Staff insert failed: " + insertError.message },
        { status: 500 },
      );
    }

    // Send Welcome Email (Wait for it so Vercel doesn't kill the lambda)
    try {
      await sendStaffWelcomeEmail({
        staffEmail: normalizedEmail,
        staffName: normalizedName,
        role: role as "admin" | "reception",
      });
    } catch (err) {
      console.error("[create-staff POST] Error sending welcome email:", err);
    }

    return NextResponse.json({ ok: true, userId: newUserId }, { status: 201 });
  } catch (err) {
    console.error("[create-staff] Unexpected POST error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    try {
      assertServiceRoleConfigured();
    } catch {
      return NextResponse.json(
        {
          error:
            "Staff management is not yet configured — SUPABASE_SERVICE_ROLE_KEY is missing from .env.local.",
        },
        { status: 503 },
      );
    }

    // 1. Verify caller JWT
    const user = await getCallerUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized — invalid or missing session." },
        { status: 401 },
      );
    }

    // 2. Verify caller is admin
    const { data: callerRow } = await supabaseAdmin
      .from("staff")
      .select("role")
      .eq("id", user.id)
      .single();

    if (callerRow?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden — only admins can manage staff accounts." },
        { status: 403 },
      );
    }

    // 3. Get target user ID to delete
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("id");

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Missing staff id parameter." },
        { status: 400 },
      );
    }

    // Prevent deleting oneself
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own admin account." },
        { status: 400 },
      );
    }

    // 4. Fetch the user details to send the email before deleting
    const { data: targetStaff } = await supabaseAdmin
      .from("staff")
      .select("email, name")
      .eq("id", targetUserId)
      .single();

    // 5. Delete the Auth user (this cascades and deletes the staff table row too)
    const { error: deleteError } =
      await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (deleteError) {
      console.error("[delete-staff API] Error deleting user:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete staff account." },
        { status: 500 },
      );
    }

    if (targetStaff && targetStaff.email) {
      try {
        await sendStaffRemovalEmail({
          staffEmail: targetStaff.email,
          staffName: targetStaff.name || "Staff Member",
        });
      } catch (err) {
        console.error("[delete-staff API] Error sending removal email:", err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[delete-staff] Unexpected DELETE error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
