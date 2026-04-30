"use client"

import {
  ArrowLeftRight,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Sparkles,
  Sun,
  Target,
  Wallet,
  X,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSyncExternalStore, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

interface SidebarUser {
  name: string | null
  email: string | null
}

interface SidebarProps {
  user: SidebarUser
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",    href: "/dashboard",    icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight  },
  { label: "Budgets",      href: "/budgets",      icon: Wallet          },
  { label: "Goals",        href: "/goals",        icon: Target          },
  { label: "Reports",      href: "/reports",      icon: BarChart2       },
  { label: "Insights",     href: "/insights",     icon: Sparkles        },
  { label: "Settings",     href: "/settings",     icon: Settings        },
]

// ─── Theme toggle hook ────────────────────────────────────────────────────────

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

// ─── Nav link ─────────────────────────────────────────────────────────────────

function NavLink({
  item,
  collapsed,
  onClick,
}: {
  item: NavItem
  collapsed: boolean
  onClick?: () => void
}) {
  const pathname = usePathname()
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/")

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      {/* Active left bar */}
      {isActive && (
        <span
          className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary"
          aria-hidden
        />
      )}
      <item.icon
        className={cn("size-5 shrink-0 transition-colors duration-200",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
        aria-hidden
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  )
}

// ─── Sidebar content ──────────────────────────────────────────────────────────

function SidebarContent({
  user,
  collapsed,
  onCollapse,
  onNavClick,
}: {
  user: SidebarUser
  collapsed: boolean
  onCollapse?: () => void
  onNavClick?: () => void
}) {
  const { setTheme, resolvedTheme } = useTheme()
  const mounted = useIsClient()
  const isDark = resolvedTheme === "dark"

  const initials = (user.name ?? user.email ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={cn(
        "flex h-full flex-col",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo + collapse toggle */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-border",
          collapsed ? "justify-center px-0" : "justify-between px-4"
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
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
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
        {/* Theme toggle */}
        {mounted && (
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={cn(
              "flex h-10 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-0"
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

        {/* User + sign out */}
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-2 py-2",
            collapsed && "justify-center px-0"
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
  )
}

// ─── Desktop sidebar ──────────────────────────────────────────────────────────

function DesktopSidebar({ user }: { user: SidebarUser }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "hidden md:flex shrink-0 flex-col border-r border-border bg-card transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <SidebarContent
        user={user}
        collapsed={collapsed}
        onCollapse={() => setCollapsed((v) => !v)}
      />
    </aside>
  )
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────

export function MobileSidebarTrigger({
  open,
  onOpen,
}: {
  open: boolean
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "md:hidden flex items-center justify-center size-9 rounded-xl border border-border bg-card text-foreground transition-all duration-200 hover:bg-muted cursor-pointer"
      )}
      aria-label="Open menu"
      aria-expanded={open}
    >
      <LayoutDashboard className="size-4" aria-hidden />
    </button>
  )
}

// ─── Combined sidebar wrapper ─────────────────────────────────────────────────

export function AppSidebar({ user }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop */}
      <DesktopSidebar user={user} />

      {/* Mobile trigger rendered in layout header */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-64 p-0 border-r border-border bg-card"
          aria-label="Navigation"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <Link
              href="/dashboard"
              className="font-heading text-lg font-bold tracking-tight text-foreground hover:text-primary transition-colors duration-200"
              onClick={() => setMobileOpen(false)}
            >
              Finora
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
              aria-label="Close menu"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <SidebarContent
            user={user}
            collapsed={false}
            onNavClick={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Mobile hamburger (rendered inside layout header, exported separately) */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="md:hidden flex items-center justify-center size-9 rounded-xl border border-border bg-card text-foreground transition-all duration-200 hover:bg-muted cursor-pointer"
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
      >
        <LayoutDashboard className="size-4" aria-hidden />
      </button>
    </>
  )
}
