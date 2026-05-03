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
  "/currency-tools",
  "/settings",
  "/guide",
  "/terms",
  "/onboarding",
];

// Routes that kick logged-in users back to the app
const AUTH_ONLY_ROUTES = ["/login", "/register"];

type SessionUser = { id?: string; isEmailVerified?: boolean };

export default auth(async (req: NextRequest & { auth: unknown }) => {
  const session = req.auth as { user?: SessionUser } | null;
  const isLoggedIn = !!session;
  const isEmailVerified = session?.user?.isEmailVerified ?? false;
  const { pathname } = req.nextUrl;

  // ── /verify-email ─────────────────────────────────────────────────────────
  // Must be logged-in (so the OTP API has a session to gate on).
  // Already-verified users go straight to the app.
  if (pathname === "/verify-email") {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    if (isEmailVerified) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    return NextResponse.next();
  }

  // ── Auth-only routes (/login, /register) ──────────────────────────────────
  // Logged-in users should never see these pages.
  if (AUTH_ONLY_ROUTES.includes(pathname) && isLoggedIn) {
    if (!isEmailVerified) {
      return NextResponse.redirect(new URL("/verify-email", req.nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // ── App routes (/dashboard, /transactions, …) ─────────────────────────────
  const isAppRoute = APP_ROUTES.some((route) => pathname.startsWith(route));

  if (isAppRoute) {
    // Must be logged in
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Must have verified email
    if (!isEmailVerified) {
      return NextResponse.redirect(new URL("/verify-email", req.nextUrl));
    }

    // New user with no categories → onboarding
    if (!pathname.startsWith("/onboarding")) {
      const userId = session?.user?.id;
      if (userId) {
        try {
          const categoryCount = await prisma.category.count({
            where: { userId },
          });
          if (categoryCount === 0) {
            return NextResponse.redirect(new URL("/onboarding", req.nextUrl));
          }
        } catch (error) {
          console.error("[proxy] Error checking categories:", error);
          // Fail open — don't break the app on DB errors
        }
      }
    }
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
