import { Settings } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="Settings"
        description="Manage your profile, currency, and preferences."
      />
      <EmptyState
        icon={Settings}
        title="Settings coming soon"
        description="Profile, password, currency and appearance settings are in progress."
      />
    </div>
  )
}
