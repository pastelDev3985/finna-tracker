import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const APP_ROUTES = [
  "/dashboard",
  "/transactions",
  "/budgets",
  "/goals",
  "/reports",
  "/insights",
  "/settings",
  "/onboarding",
]

const AUTH_ROUTES = ["/login", "/register"]

export default auth((req: NextRequest & { auth: unknown }) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const isAuthRoute = AUTH_ROUTES.includes(pathname)
  const isAppRoute = APP_ROUTES.some((route) => pathname.startsWith(route))

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  if (isAppRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
}
