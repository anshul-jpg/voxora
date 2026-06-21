import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 🛡️ CSRF PROTECTION: Verify Origin/Referer headers on state-changing API endpoints
  if (path.startsWith("/api") && !["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    // Exclude webhooks that use custom header authentication (e.g. x-vapi-secret)
    if (path !== "/api/vapi-webhook") {
      const origin = req.headers.get("origin");
      const referer = req.headers.get("referer");
      const host = req.headers.get("host");

      if (origin && host) {
        try {
          const originUrl = new URL(origin);
          if (originUrl.host !== host) {
            return NextResponse.json(
              { message: "CSRF verification failed: invalid origin." },
              { status: 403 }
            );
          }
        } catch {
          return NextResponse.json(
            { message: "CSRF verification failed: malformed origin." },
            { status: 403 }
          );
        }
      } else if (referer && host) {
        try {
          const refererUrl = new URL(referer);
          if (refererUrl.host !== host) {
            return NextResponse.json(
              { message: "CSRF verification failed: invalid referer." },
              { status: 403 }
            );
          }
        } catch {
          return NextResponse.json(
            { message: "CSRF verification failed: malformed referer." },
            { status: 403 }
          );
        }
      }
    }
  }

  // Protect all dashboard routes
  if (path.startsWith("/dashboards")) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    try {
      verifyToken(token);
    } catch (err) {
      // Invalid/expired token: clear cookie and redirect to login page
      const res = NextResponse.redirect(new URL("/login", req.nextUrl));
      res.cookies.delete("token");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboards/:path*", "/api/:path*"],
};
