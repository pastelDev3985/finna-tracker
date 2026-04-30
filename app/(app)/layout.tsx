import { auth } from "@/lib/auth"
import { AppSidebar } from "@/components/shared/sidebar"

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
      <AppSidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
