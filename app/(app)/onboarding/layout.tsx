export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <main className="w-full overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
