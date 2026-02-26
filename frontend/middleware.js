import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isLoggedIn = !!req.auth;
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isDashboard = pathname.startsWith("/dashboard");

  // Not logged in → trying to access dashboard → redirect to login
  if (!isLoggedIn && isDashboard) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in → trying to access auth pages → redirect to dashboard
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  // /landing is PUBLIC — not listed here so it's always accessible
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
