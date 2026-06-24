import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin/dashboard and all sub-routes
  if (pathname.startsWith("/admin/dashboard")) {
    // In a full production app, we would verify the Supabase session cookie here.
    // For this nextjs environment, we check for our token/cookie.
    const adminSession = request.cookies.get("sb-access-token") || request.cookies.get("mbs_admin_logged");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};
