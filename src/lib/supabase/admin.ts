import { createClient } from "@supabase/supabase-js";

const url    = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin =
  url && secret
    ? createClient(url, secret, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;
