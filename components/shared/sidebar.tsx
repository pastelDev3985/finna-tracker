"use client";

import {
  ArrowLeftRight,
  BarChart2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Moon,
  Settings,
  Sparkles,
  Sun,
  Target,
  Wallet,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarUser {
  name: string | null;
  email: string | null;
}

interface SidebarProps {
  user: SidebarUser;
}

// ─── Nav item lists ────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Budgets", href: "/budgets", icon: Wallet },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Reports", href: "/reports", icon: BarChart2 },
  { label: "Rates", href: "/currency-tools", icon: CircleDollarSign },
  { label: "Insights", href: "/insights", icon: Sparkles },
  { label: "Settings", href: "/settings", icon: Settings },
];

// Items shown directly in bottom bar
const BOTTOM_NAV_ITEMS = NAV_ITEMS.slice(0, 4);
// Help & legal — More sheet + desktop sidebar footer
const MORE_SHEET_EXTRA: NavItem[] = [
  { label: "User guide", href: "/guide", icon: BookOpen },
  { label: "Terms of service", href: "/terms", icon: FileText },
];

// ─── Theme toggle hook ────────────────────────────────────────────────────────

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

// ─── Desktop NavLink ───────────────────────────────────────────────────────────

function NavLink({
  item,
  collapsed,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-[background-color,color,transform] duration-150",
        isActive
          ? "bg-primary/10 text-primary active:bg-primary/20 active:scale-[0.98]"
          : "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] active:bg-muted/80",
        collapsed && "justify-center px-0",
      )}
    >
      {isActive && (
        <span
          className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary"
          aria-hidden
        />
      )}
      <item.icon
        className={cn(
          "size-5 shrink-0 transition-colors duration-200",
          isActive
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground",
        )}
        aria-hidden
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

// ─── Desktop sidebar content ───────────────────────────────────────────────────

function SidebarContent({
  user,
  collapsed,
  onCollapse,
  onNavClick,
}: {
  user: SidebarUser;
  collapsed: boolean;
  onCollapse?: () => void;
  onNavClick?: () => void;
}) {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useIsClient();
  const isDark = resolvedTheme === "dark";

  const initials = (user.name ?? user.email ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("flex h-full flex-col", collapsed ? "w-16" : "w-56")}>
      {/* Logo + collapse toggle */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-border",
          collapsed ? "justify-center px-0" : "justify-between px-4",
        )}
      >
        {!collapsed && (
          <Link
            href="/dashboard"
            className="font-heading text-lg font-bold tracking-tight text-foreground transition-colors duration-200 hover:text-primary"
          >
            Finora
          </Link>
        )}
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="size-4" aria-hidden />
            ) : (
              <ChevronLeft className="size-4" aria-hidden />
            )}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-border px-2 py-3 space-y-1">
        <div className="space-y-0.5 pb-1">
          {MORE_SHEET_EXTRA.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex h-9 items-center gap-3 rounded-xl px-3 text-xs font-medium transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-0",
                )}
              >
                <item.icon
                  className={cn(
                    "size-4 shrink-0",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                  aria-hidden
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {mounted && (
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
              "flex h-10 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-0",
            )}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="size-5 shrink-0" aria-hidden />
            ) : (
              <Moon className="size-5 shrink-0" aria-hidden />
            )}
            {!collapsed && <span>Appearance</span>}
          </button>
        )}

        <Separator className="my-2" />

        <div
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-2 py-2",
            collapsed && "justify-center px-0",
          )}
        >
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                {user.name ?? "Account"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {user.email}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className="ml-auto flex size-7 cursor-pointer shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
            aria-label="Sign out"
          >
            <LogOut className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Desktop sidebar ───────────────────────────────────────────────────────────

function DesktopSidebar({ user }: { user: SidebarUser }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex shrink-0 flex-col border-r border-border bg-card transition-all duration-200",
        collapsed ? "w-16" : "w-56",
      )}
    >
      <SidebarContent
        user={user}
        collapsed={collapsed}
        onCollapse={() => setCollapsed((v) => !v)}
      />
    </aside>
  );
}

// ─── Mobile bottom tab bar ────────────────────────────────────────────────────

function BottomTabItem({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-[color,transform,opacity] duration-150 active:scale-95 active:opacity-80",
        isActive ? "text-primary" : "text-muted-foreground",
      )}
    >
      <item.icon
        className={cn("size-[22px] shrink-0", isActive && "text-primary")}
        strokeWidth={isActive ? 2.2 : 1.8}
        aria-hidden
      />
      <span
        className={cn(
          "text-[10px] font-medium leading-none",
          isActive ? "text-primary" : "text-muted-foreground",
        )}
      >
        {item.label === "Transactions" ? "Txns" : item.label}
      </span>
    </Link>
  );
}

function MobileBottomNav({ user }: { user: SidebarUser }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();
  const morePages = NAV_ITEMS.slice(4);
  const isMoreActive =
    morePages.some(
      (item) =>
        pathname === item.href || pathname.startsWith(item.href + "/"),
    ) ||
    MORE_SHEET_EXTRA.some(
      (item) =>
        pathname === item.href || pathname.startsWith(item.href + "/"),
    );
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useIsClient();
  const isDark = resolvedTheme === "dark";

  const initials = (user.name ?? user.email ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        aria-label="Bottom navigation"
      >
        <div className="flex h-16 items-stretch border-t border-border/60 bg-card/90 backdrop-blur-xl backdrop-saturate-150">
          {BOTTOM_NAV_ITEMS.map((item) => (
            <BottomTabItem key={item.href} item={item} />
          ))}

          {/* More button */}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-[color,transform,opacity] duration-150 active:scale-95 active:opacity-80",
              isMoreActive ? "text-primary" : "text-muted-foreground",
            )}
            aria-label="More navigation"
            aria-expanded={moreOpen}
          >
            <MoreHorizontal
              className={cn(
                "size-[22px] shrink-0",
                isMoreActive && "text-primary",
              )}
              strokeWidth={isMoreActive ? 2.2 : 1.8}
              aria-hidden
            />
            <span
              className={cn(
                "text-[10px] font-medium leading-none",
                isMoreActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              More
            </span>
          </button>
        </div>
        {/* Native safe-area support */}
        <div className="bg-card/90 pb-[env(safe-area-inset-bottom)]" />
      </nav>

      {/* "More" bottom sheet */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl border-t border-border p-0"
          aria-label="More navigation"
        >
          <SheetTitle className="sr-only">More</SheetTitle>

          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1 w-10 rounded-full bg-muted-foreground/25" />
          </div>

          {/* Overflow nav items */}
          <div className="px-4 pt-2 pb-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Pages
            </p>
            <div className="space-y-0.5">
              {morePages.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "size-5 shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )}
                      aria-hidden
                    />
                    {item.label}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="px-4 pb-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Help &amp; legal
            </p>
            <div className="space-y-0.5">
              {MORE_SHEET_EXTRA.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "size-5 shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )}
                      aria-hidden
                    />
                    {item.label}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* User controls */}
          <div className="px-4 py-3">
            {/* User info */}
            <div className="mb-3 flex items-center gap-3">
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {user.name ?? "Account"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Theme toggle */}
              {mounted && (
                <button
                  type="button"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted"
                  aria-label={
                    isDark ? "Switch to light mode" : "Switch to dark mode"
                  }
                >
                  {isDark ? (
                    <Sun className="size-4" aria-hidden />
                  ) : (
                    <Moon className="size-4" aria-hidden />
                  )}
                  {isDark ? "Light mode" : "Dark mode"}
                </button>
              )}

              {/* Sign out */}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 py-2.5 text-sm font-medium text-destructive transition-all duration-200 hover:bg-destructive/10"
                aria-label="Sign out"
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </button>
            </div>
          </div>

          {/* Safe area bottom */}
          <div className="pb-[env(safe-area-inset-bottom)]" />
        </SheetContent>
      </Sheet>
    </>
  );
}

// ─── Combined sidebar / nav wrapper ───────────────────────────────────────────

export function AppSidebar({ user }: SidebarProps) {
  return (
    <>
      <DesktopSidebar user={user} />
      <MobileBottomNav user={user} />
    </>
  );
}
