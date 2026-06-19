import { CapacitorCookies } from "@capacitor/core";
import { createBrowserClient, createServerClient } from "@supabase/ssr";

const isMobile = process.env.NEXT_PUBLIC_BUILD_TARGET === "mobile";

export const createClient = () => {
  if (isMobile) {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          get: (name) => {
            const match = document.cookie.match(
              new RegExp(`(^| )${name}=([^;]*)`),
            );
            return match ? decodeURIComponent(match[2]) : null;
          },
          set: async (name, value, options) => {
            let expires: string | undefined;
            if (options?.expires) {
              expires = options.expires.toUTCString();
            } else if (options?.maxAge) {
              expires = new Date(
                Date.now() + options.maxAge * 1000,
              ).toUTCString();
            }

            // Sync with local domain so get() can read it!
            document.cookie = `${name}=${encodeURIComponent(value)}; path=${
              options?.path || "/"
            }${expires ? `; expires=${expires}` : ""}`;

            // Sync with Supabase domain
            await CapacitorCookies.setCookie({
              url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
              key: name,
              value: value,
              expires: expires,
              path: options?.path,
            });

            // Sync with our backend API domain
            await CapacitorCookies.setCookie({
              url: "https://fomotracker.vercel.app",
              key: name,
              value: value,
              expires: expires,
              path: options?.path,
            });
          },
          remove: async (name, _options) => {
            // Remove from local domain
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            // Remove from Supabase domain
            await CapacitorCookies.deleteCookie({
              url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
              key: name,
            });

            // Remove from our backend API domain
            await CapacitorCookies.deleteCookie({
              url: "https://fomotracker.vercel.app",
              key: name,
            });
          },
        },
      },
    );
  }

  // Web (Default Supabase Client behavior)
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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
