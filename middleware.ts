import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// auth desabilitada temporariamente

export async function middleware(_: NextRequest) {
  const res = NextResponse.next();
  return res;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
