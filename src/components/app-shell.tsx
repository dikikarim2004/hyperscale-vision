import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Bell,
  BookOpen,
  Calendar,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  Menu,
  MessageSquare,
  Newspaper,
  Radar,
  Settings,
  Sparkles,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { supabase } from "@/integrations/supabase/client";

export interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

export const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/chat", label: "Chat", icon: MessageSquare },
      { to: "/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    title: "Trading",
    items: [
      { to: "/positions", label: "Positions", icon: LineChart },
      { to: "/pnl", label: "PnL & calendar", icon: Calendar },
      { to: "/screen", label: "Screener", icon: Radar },
      { to: "/briefing", label: "Briefing", icon: Newspaper },
      { to: "/study", label: "Study a pool", icon: GraduationCap },
    ],
  },
  {
    title: "Account",
    items: [
      { to: "/wallets", label: "Wallets", icon: Wallet },
      { to: "/config", label: "Configuration", icon: Settings },
      { to: "/account", label: "Account & linking", icon: UserRound },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { to: "/performance", label: "Performance", icon: Sparkles },
      { to: "/lessons", label: "Lessons", icon: BookOpen },
      { to: "/activity", label: "Activity log", icon: Activity },
      { to: "/help", label: "Help centre", icon: LifeBuoy },
    ],
  },
];

const bottomNav: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/positions", label: "Positions", icon: LineChart },
  { to: "/pnl", label: "PnL", icon: Calendar },
];

function useUnreadCount() {
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.listNotifications(),
    refetchInterval: 20_000,
  });
  return data?.filter((n) => !n.read).length ?? 0;
}

function NavList({ onNavigate, pathname }: { onNavigate?: () => void; pathname: string }) {
  return (
    <nav className="space-y-5">
      {navGroups.map((group) => (
        <div key={group.title}>
          <p className="px-3 pb-1.5 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors",
                      active ? "bg-surface text-foreground" : "text-muted-foreground hover:bg-surface hover:text-foreground",
                    )}
                  >
                    <item.icon className={cn("size-[18px] shrink-0", active && "text-primary")} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = useUnreadCount();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] flex-col border-r border-border bg-sidebar px-4 py-5 lg:flex">
        <Link to="/dashboard" className="mb-6 flex items-center gap-2.5 px-2">
          <BrandMark />
          <span className="text-[17px] leading-tight font-extrabold">
            Hyperscale
            <span className="block text-[11px] font-bold tracking-widest text-muted-foreground uppercase">Auto LP</span>
          </span>
        </Link>
        <div className="no-scrollbar flex-1 overflow-y-auto">
          <NavList pathname={pathname} />
        </div>
        <Button variant="ghost" className="mt-4 justify-start rounded-xl font-semibold" onClick={signOut}>
          Sign out
        </Button>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-foreground/35"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[84%] max-w-[320px] flex-col bg-background px-4 py-5 shadow-float">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BrandMark />
                <span className="text-[17px] font-extrabold">Hyperscale</span>
              </div>
              <button
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
                className="grid size-9 place-items-center rounded-full bg-surface"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="no-scrollbar flex-1 overflow-y-auto">
              <NavList pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
            </div>
            <Button variant="ghost" className="mt-4 justify-start rounded-xl font-semibold" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-[272px]">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
          <button
            aria-label="Open menu"
            className="grid size-10 place-items-center rounded-xl lg:hidden"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="size-6" />
          </button>
          <Link to="/chat" className="pill hidden sm:inline-flex lg:ml-0">
            Ask the agent
          </Link>
          <Link to="/chat" className="pill sm:hidden">
            Ask the agent
          </Link>
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="relative grid size-10 shrink-0 place-items-center rounded-xl hover:bg-surface"
          >
            <Bell className="size-[22px]" />
            {unread > 0 ? (
              <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </Link>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 pt-5 pb-28 sm:px-6 lg:pb-10">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/98 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <ul className="grid grid-cols-5">
          {bottomNav.map((item) => {
            const active = pathname === item.to;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <item.icon className="size-[22px]" />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-bold text-muted-foreground"
            >
              <Menu className="size-[22px]" />
              Menu
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl bg-foreground", className)}>
      <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
        <path d="M12 2 4 12l8 10 3-6-4-4 4-4-3-6Z" fill="var(--color-primary)" />
      </svg>
    </span>
  );
}
