import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

const APP_ROUTES = [
  "/dashboard",
  "/transactions",
  "/budgets",
  "/goals",
  "/reports",
  "/insights",
  "/settings",
  "/onboarding",
];

const AUTH_ROUTES = ["/login", "/register"];

export default auth(async (req: NextRequest & { auth: unknown }) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isAppRoute = APP_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (isAppRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and accessing an app route (except onboarding), check if user has categories
  // If no categories, redirect to onboarding
  if (isLoggedIn && isAppRoute && !pathname.startsWith("/onboarding")) {
    const userId = (req.auth as { user?: { id?: string } })?.user?.id;
    if (userId) {
      try {
        const categoryCount = await prisma.category.count({
          where: { userId },
        });

        // New user with no categories → redirect to onboarding
        if (categoryCount === 0) {
          return NextResponse.redirect(new URL("/onboarding", req.nextUrl));
        }
      } catch (error) {
        console.error("[proxy] Error checking categories:", error);
        // On error, allow the request through (fail open, don't break the app)
      }
    }
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
