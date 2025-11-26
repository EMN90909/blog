// supabase.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = createClient(
  "https://YOUR-SUPABASE-PROJECT.supabase.co",
  "YOUR_PUBLIC_ANON_KEY"
);

// Quick helpers
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) window.location.href = "auth.html";
}
