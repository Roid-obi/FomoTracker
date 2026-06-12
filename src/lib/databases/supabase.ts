import { CapacitorCookies } from "@capacitor/core";
import { createBrowserClient, createServerClient } from "@supabase/ssr";

const isMobile = process.env.NEXT_PUBLIC_BUILD_TARGET === "mobile";

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        // Jika di HP (Capacitor), kita override cara Supabase membaca/menulis cookie
        get: (name) => {
          if (isMobile) {
            // CapacitorCookies berjalan secara sinkronus/asinkronus, untuk 'get' di client:
            const match = document.cookie.match(
              new RegExp(`(^| )${name}=([^;]*)`),
            );
            return match ? decodeURIComponent(match[2]) : null;
          }
          return typeof document !== "undefined" ? document.cookie : null;
        },
        set: async (name, value, options) => {
          if (isMobile) {
            let expires: string | undefined = undefined;
            if (options?.expires) {
              expires = options.expires.toUTCString();
            } else if (options?.maxAge) {
              expires = new Date(
                Date.now() + options.maxAge * 1000,
              ).toUTCString();
            }

            await CapacitorCookies.setCookie({
              url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
              key: name,
              value: value,
              expires: expires,
              path: options?.path,
            });
          }
        },
        remove: async (name, _options) => {
          if (isMobile) {
            await CapacitorCookies.deleteCookie({
              url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
              key: name,
            });
          }
        },
      },
    },
  );
};

export const createSupabaseServer = async () => {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              const isProd = process.env.NODE_ENV === "production";
              const cookieOptions = isProd
                ? { ...options, sameSite: "none" as const, secure: true }
                : options;
              cookieStore.set(name, value, cookieOptions);
            }
          } catch {
            // Route Handler may not be able to set cookies after streaming starts
          }
        },
      },
    },
  );
};
