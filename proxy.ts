import { NextRequest, NextResponse } from "next/server";

// Next 16 renamed middleware -> proxy. Optimistic check only: presence of the
// session cookie. The admin layout does the authoritative JWT verify.
export default function proxy(req: NextRequest) {
  const hasSession = req.cookies.has("session");
  const path = req.nextUrl.pathname;

  if (path.startsWith("/admin") && !hasSession) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (path === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
