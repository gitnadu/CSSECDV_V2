import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export function proxy(req) {
  const publicPaths = [
    "/login",
    "/api/auth/login",
    "/api/auth/register",
    "/_next",
  ];

  // Allow public routes
  if (publicPaths.some((p) => req.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session")?.value || null;

  // No token → redirect
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = verifyToken(token);

  // Invalid token → redirect
  if (!payload) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Token OK → allow access
  return NextResponse.next();
}
