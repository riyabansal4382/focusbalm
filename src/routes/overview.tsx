import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import {
  StorageKeys,
  calcGPA,
  flavorColor,
  useLocalState,
  type BalmSession,
  type Course,
  type Task,
} from "@/lib/storage";

export const Route = createFileRoute("/overview")({
  head: () => ({
    meta: [
      { title: "Overview — Balm" },
      {
        name: "description",
        content:
          "A single glance at your focus sessions, tasks, GPA and balm shelf.",
      },
      { property: "og:title", content: "Overview — Balm" },
      {
        property: "og:description",
        content: "Your study dashboard: focus, tasks, calendar, GPA and shelf.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OverviewPage,
});

function OverviewPage() {
  const [sessions] = useLocalState<BalmSession[]>(StorageKeys.sessions, []);
  const [tasks] = useLocalState<Task[]>(StorageKeys.tasks, []);
  const [courses] = useLocalState<Course[]>(StorageKeys.courses, []);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(
      (s) => new Date(s.completedAt).toDateString() === today,
    );
    const totalMin = Math.round(
      sessions.reduce((s, x) => s + x.completedSec, 0) / 60,
    );
    const openTasks = tasks.filter((t) => !t.done).length;
    return {
      totalMin,
      todayMin: Math.round(
        todaySessions.reduce((s, x) => s + x.completedSec, 0) / 60,
      ),
      todayCount: todaySessions.length,
      balms: sessions.length,
      openTasks,
      doneTasks: tasks.length - openTasks,
      gpa: calcGPA(courses),
      courses: courses.length,
    };
  }, [sessions, tasks, courses]);

  const recent = sessions.slice(0, 5);

  return (
    <AppShell>
      <h1 className="font-display text-4xl font-semibold tracking-tight">Overview</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Everything across your balm study kit, in one place.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Minutes focused" value={String(stats.totalMin)} hint={`${stats.todayMin} today`} />
        <Stat label="Balms finished" value={String(stats.balms)} hint={`${stats.todayCount} today`} />
        <Stat label="Open tasks" value={String(stats.openTasks)} hint={`${stats.doneTasks} done`} />
        <Stat
          label="GPA"
          value={stats.gpa ? stats.gpa.toFixed(2) : "—"}
          hint={`${stats.courses} course${stats.courses === 1 ? "" : "s"}`}
        />
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <SectionCard
          to="/"
          title="Focus"
          body="Start a timed session and watch your balm tube fill up, drop by drop."
          cta="Start focusing"
        />
        <SectionCard
          to="/progress"
          title="Progress & tasks"
          body="Add tasks, tick them off and see the weekly chart with your intended pace."
          cta={`${stats.openTasks} open task${stats.openTasks === 1 ? "" : "s"}`}
        />
        <SectionCard
          to="/calendar"
          title="Calendar"
          body="Browse any month and see which days you filled with focus sessions."
          cta="Open calendar"
        />
        <SectionCard
          to="/gpa"
          title="GPA calculator"
          body="Track courses, credits and grades with a live weighted GPA."
          cta="Open calculator"
        />
        <SectionCard
          to="/shelf"
          title="Balm shelf"
          body="Your finished balms, lined up on wooden shelves as proof of the work."
          cta={`${stats.balms} on the shelf`}
        />
      </div>

      <section className="mt-10 rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-2xl font-semibold">Recent sessions</h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No sessions yet — your first balm is waiting on the Focus page.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {recent.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm"
              >
                <span
                  className="inline-block h-5 w-3.5 rounded-t-full rounded-b-sm"
                  style={{ background: flavorColor(s.flavor) }}
                  aria-hidden
                />
                <span className="flex-1 font-semibold">{s.subject || "Focus"}</span>
                <span className="tabular-nums text-muted-foreground">
                  {Math.round(s.completedSec / 60)} min
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(s.completedAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-display text-3xl font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function SectionCard({
  to,
  title,
  body,
  cta,
}: {
  to: "/" | "/progress" | "/calendar" | "/gpa" | "/shelf";
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-3xl border border-border bg-card p-6 transition-colors hover:border-primary"
    >
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <span className="mt-4 inline-block text-sm font-semibold text-primary group-hover:underline">
        {cta} →
      </span>
    </Link>
  );
}
