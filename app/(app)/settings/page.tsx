import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsSection } from "@/components/settings/settings-section";
import { SettingsProfile } from "@/components/settings/settings-profile";
import { SettingsPassword } from "@/components/settings/settings-password";
import { SettingsCurrency } from "@/components/settings/settings-currency";
import { SettingsAppearance } from "@/components/settings/settings-appearance";
import { SettingsCategories } from "@/components/settings/settings-categories";
import { SettingsDangerZone } from "@/components/settings/settings-danger-zone";
import { listCategories } from "@/lib/services/categories";
import { getUserProfileStats } from "@/lib/services/user-stats";
import { Separator } from "@/components/ui/separator";
import type { CategoryData } from "@/types";
import { SettingsProfileStats } from "@/components/settings/settings-profile-stats";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const categoriesResult = await listCategories(session.user.id);
  const categories = (categoriesResult.data ?? []) as CategoryData[];
  const statsResult = await getUserProfileStats(session.user.id);
  const profileStats = statsResult.data ?? null;

  return (
    <div className="flex flex-col gap-8 p-4 sm:gap-12 sm:p-6 lg:p-8">
      <PageHeader
        title="Settings"
        description="Manage your profile, currency, and preferences — scroll to each section below."
        titleClassName="bg-linear-to-br from-foreground via-foreground/95 to-primary bg-clip-text pb-px text-transparent sm:text-3xl"
      />

      <div className="flex flex-col gap-10 sm:gap-14">
        <SettingsSection
          id="profile"
          title="Profile"
          description="Your display name and email used for your account."
        >
          <div className="flex flex-col gap-6">
            {profileStats ? (
              <SettingsProfileStats stats={profileStats} />
            ) : null}
            <SettingsProfile user={session.user} />
          </div>
        </SettingsSection>

        <Separator className="bg-linear-to-r from-transparent via-primary/25 to-transparent" />

        <SettingsSection
          id="password"
          title="Password"
          description="Change your password. Use a strong, unique password you do not reuse elsewhere."
        >
          <SettingsPassword />
        </SettingsSection>

        <Separator className="bg-linear-to-r from-transparent via-primary/25 to-transparent" />

        <SettingsSection
          id="currency"
          title="Currency"
          description="How amounts are formatted across the app. Stored values are not converted when you switch."
        >
          <SettingsCurrency defaultCurrency={session.user.currency ?? "GHS"} />
        </SettingsSection>

        <Separator className="bg-linear-to-r from-transparent via-primary/25 to-transparent" />

        <SettingsSection
          id="appearance"
          title="Appearance"
          description="Choose light or dark mode for the interface."
        >
          <SettingsAppearance />
        </SettingsSection>

        <Separator className="bg-linear-to-r from-transparent via-primary/25 to-transparent" />

        <SettingsSection
          id="categories"
          title="Categories"
          description="Customise income and expense categories. Deleting a category may be blocked if transactions still use it."
        >
          <SettingsCategories initialCategories={categories} />
        </SettingsSection>

        <Separator className="bg-linear-to-r from-transparent via-primary/25 to-transparent" />

        <SettingsSection
          id="danger"
          accent="danger"
          title="Danger zone"
          description="Irreversible actions. Proceed only if you intend to remove your account and data."
        >
          <SettingsDangerZone />
        </SettingsSection>
      </div>
    </div>
  );
}
