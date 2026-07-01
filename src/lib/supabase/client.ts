import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export function createClient() {
  if (!isSupabaseConfigured) {
    // Return a stub client when Supabase is not configured (local dev without cloud)
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ error: { message: "Supabase chưa được cấu hình. Vui lòng thêm NEXT_PUBLIC_SUPABASE_URL vào .env.local" } }),
        signUp: async () => ({ error: { message: "Supabase chưa được cấu hình." } }),
        signOut: async () => ({}),
        signInWithOAuth: async () => ({ error: { message: "Supabase chưa được cấu hình." } }),
      },
    } as ReturnType<typeof createBrowserClient>;
  }
  return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}
