import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center bg-background px-4 py-16">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <header className="mb-8 flex flex-col items-center gap-2 text-center">
        <Link
          href="/"
          className="font-heading text-2xl font-bold tracking-tight text-foreground transition-all duration-200 hover:text-primary"
        >
          Finora
        </Link>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Start managing your money the smart way
        </p>
      </header>

      {children}

      <footer className="relative z-10 mt-12 border-t border-border pt-6">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Finora. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
