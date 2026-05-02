/**
 * Absolute origin for links in emails and password reset (no trailing slash).
 * Prefer AUTH_URL / NEXTAUTH_URL in production; VERCEL_URL is a fallback for preview deploys.
 */
export function getPublicAppUrl(): string {
  const explicit =
    process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? ""
  const trimmed = explicit.replace(/\/$/, "")
  if (trimmed) return trimmed

  const vercel = process.env.VERCEL_URL
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`

  return ""
}
