import { auth } from "@/lib/auth"
import { AppSidebar } from "@/components/shared/sidebar"
import { GlassEffect } from "@/components/shared/glass-effect"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const user = {
    name: session?.user?.name ?? null,
    email: session?.user?.email ?? null,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <GlassEffect />
      <AppSidebar user={user} />
      {/* pb-16 on mobile creates space above the fixed bottom nav */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
    </div>
  )
}
