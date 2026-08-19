import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: users, error: err1 } = await supabase.auth.admin.listUsers();
  if (err1) console.error("Error fetching users:", err1);
  
  const { data: staff, error: err2 } = await supabase.from('staff').select('*');
  if (err2) console.error("Error fetching staff:", err2);
  
  console.log("Users in auth.users:");
  users?.users?.forEach(u => console.log(u.email, "->", u.id));
  
  console.log("\nStaff in public.staff:");
  staff?.forEach(s => console.log(s.email, "->", s.id, "(Role:", s.role, ")"));
}

run();
