import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsProfile } from "@/components/settings/settings-profile";
import { SettingsPassword } from "@/components/settings/settings-password";
import { SettingsCurrency } from "@/components/settings/settings-currency";
import { SettingsAppearance } from "@/components/settings/settings-appearance";
import { SettingsCategories } from "@/components/settings/settings-categories";
import { SettingsDangerZone } from "@/components/settings/settings-danger-zone";
import { listCategories } from "@/lib/services/categories";
import type { CategoryData } from "@/types";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const categoriesResult = await listCategories(session.user.id);
  const categories = (categoriesResult.data ?? []) as CategoryData[];

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="Settings"
        description="Manage your profile, currency, and preferences."
      />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 border-b bg-transparent mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="danger">Danger</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <SettingsProfile user={session.user} />
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password" className="mt-6">
          <SettingsPassword />
        </TabsContent>

        {/* Currency Tab */}
        <TabsContent value="currency" className="mt-6">
          <SettingsCurrency defaultCurrency={session.user.currency ?? "GHS"} />
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="mt-6">
          <SettingsAppearance />
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="mt-6">
          <SettingsCategories initialCategories={categories} />
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger" className="mt-6">
          <SettingsDangerZone />
        </TabsContent>
      </Tabs>
    </div>
  );
}
