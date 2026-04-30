import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main className="flex flex-1 flex-col gap-2 p-8">
      <h1 className="font-heading text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Signed in as{" "}
        <span className="font-medium text-foreground">{session?.user?.email}</span>
      </p>
    </main>
  );
}
