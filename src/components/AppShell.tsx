import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Focus" },
  { to: "/calendar", label: "Calendar" },
  { to: "/gpa", label: "GPA" },
  { to: "/shelf", label: "Shelf" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span
              className="inline-block h-6 w-4 rounded-t-full rounded-b-sm"
              style={{ background: "var(--balm-pink)" }}
              aria-hidden
            />
            <span className="font-display text-2xl font-semibold tracking-tight">balm</span>
          </Link>
          <nav className="flex items-center gap-1 rounded-full border border-border bg-card p-1 text-sm">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    "rounded-full px-4 py-1.5 font-semibold transition-colors " +
                    (active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      <footer className="mx-auto max-w-6xl px-6 pb-10 pt-4 text-center text-xs text-muted-foreground">
        balm co. · focus, one swipe at a time
      </footer>
    </div>
  );
}