import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServiceRole";
import { getCallerUser } from "@/app/api/admin/create-staff/route"; // wait, getCallerUser is in create-staff. I should copy it or export it.

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "No auth header" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { data: staff, error: staffError } = await supabaseAdmin
      .from("staff")
      .select("role")
      .eq("id", user.id)
      .single();

    if (staffError) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

    return NextResponse.json({ role: staff.role });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
