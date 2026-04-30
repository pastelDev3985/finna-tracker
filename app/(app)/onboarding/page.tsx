import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { listCategories } from "@/lib/services/categories"
import { seedDefaultCategories } from "@/lib/services/categories"
import { OnboardingClient } from "@/components/onboarding/onboarding-client"

export default async function OnboardingPage() {
  const session = await auth()
  const userId = session!.user.id

  const categoriesResult = await listCategories(userId)
  const hasCategories = (categoriesResult.data?.length ?? 0) > 0

  // If user already has categories, skip onboarding
  if (hasCategories) {
    redirect("/dashboard")
  }

  // Seed default categories for the new user
  await seedDefaultCategories(userId)

  return <OnboardingClient userName={session?.user?.name?.split(" ")[0] ?? "there"} />
}
