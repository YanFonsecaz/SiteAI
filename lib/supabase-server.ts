import { cookies } from "next/headers";
import * as AuthHelpers from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";

export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  try {
    const cookieStore = cookies();
    const anyCreate = (AuthHelpers as any).createServerClient;
    if (typeof anyCreate === "function") {
      return anyCreate(url, key, {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.delete(name);
          },
        },
      });
    }
  } catch {}
  return createClient(url, key);
}
