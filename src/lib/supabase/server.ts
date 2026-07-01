import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const stubClient = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    exchangeCodeForSession: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
  },
};

export async function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return stubClient as ReturnType<typeof createServerClient>;
  }

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component context — mutations ignored
        }
      },
    },
  });
}
