import { NextResponse } from "next/server";

export function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/maintenance") {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/maintenance", request.url));
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};