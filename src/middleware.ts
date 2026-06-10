import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const isApi = request.nextUrl.pathname.startsWith("/api");

  // Allowed CORS origins
  const allowedOrigins = [
    "http://localhost",
    "https://localhost",
    "https://fomotracker.vercel.app",
  ];

  const isAllowedOrigin = origin && (
    allowedOrigins.includes(origin) ||
    origin.endsWith(".vercel.app") ||
    /^http:\/\/localhost:\d+$/.test(origin)
  );

  // Handle preflight OPTIONS requests for APIs
  if (request.method === "OPTIONS" && isApi) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "",
        "Access-Control-Allow-Methods": "GET,DELETE,PATCH,POST,PUT,OPTIONS",
        "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
      },
    });
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({
          request,
        });
        for (const { name, value, options } of cookiesToSet) {
          const isProd = process.env.NODE_ENV === "production";
          const cookieOptions = isProd
            ? { ...options, sameSite: "none" as const, secure: true }
            : options;
          response.cookies.set(name, value, cookieOptions);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isAppPage =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/statistik") ||
    request.nextUrl.pathname.startsWith("/insight") ||
    request.nextUrl.pathname.startsWith("/notifications") ||
    request.nextUrl.pathname.startsWith("/pengaturan");

  if (!user && isAppPage) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Append CORS headers to dynamic API responses
  if (isApi && isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT,OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Content-Type");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
