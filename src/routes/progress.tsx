import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { WeeklyProgressChart } from "@/components/WeeklyProgressChart";
import {
  StorageKeys,
  useLocalState,
  type BalmSession,
  type Task,
} from "@/lib/storage";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress & Tasks — Balm" },
      {
        name: "description",
        content:
          "Track your weekly tasks completed against your intended pace, and keep a tidy to-do list.",
      },
      { property: "og:title", content: "Progress & Tasks — Balm" },
      {
        property: "og:description",
        content: "Weekly task chart with a trend line, plus a simple task list.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const [tasks, setTasks] = useLocalState<Task[]>(StorageKeys.tasks, []);
  const [sessions] = useLocalState<BalmSession[]>(StorageKeys.sessions, []);
  const [draft, setDraft] = useState("");

  const addTask = () => {
    const title = draft.trim();
    if (!title) return;
    setTasks((prev) => [
      {
        id: crypto.randomUUID(),
        title,
        done: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setDraft("");
  };

  const toggle = (id: string) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              done: !t.done,
              completedAt: !t.done ? new Date().toISOString() : undefined,
            }
          : t,
      ),
    );

  const remove = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const open = useMemo(() => tasks.filter((t) => !t.done), [tasks]);
  const done = useMemo(() => tasks.filter((t) => t.done), [tasks]);

  return (
    <AppShell>
      <h1 className="font-display text-4xl font-semibold tracking-tight">Progress</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Add what you want to get through, tick it off, and watch the week take shape.
      </p>

      <WeeklyProgressChart sessions={sessions} tasks={tasks} />

      <section className="mt-10 rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-2xl font-semibold">Tasks</h2>
        <div className="mt-4 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="e.g. finish organic chem problem set"
            className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={addTask}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Add
          </button>
        </div>

        <ul className="mt-6 space-y-2">
          {[...open, ...done].map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3"
            >
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggle(t.id)}
                className="h-4 w-4 accent-[var(--primary)]"
                aria-label={`Mark ${t.title} complete`}
              />
              <span
                className={
                  "flex-1 text-sm " +
                  (t.done ? "text-muted-foreground line-through" : "text-foreground")
                }
              >
                {t.title}
              </span>
              <button
                onClick={() => remove(t.id)}
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                remove
              </button>
            </li>
          ))}
          {tasks.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              No tasks yet — add your first one above.
            </li>
          )}
        </ul>
      </section>
    </AppShell>
  );
}
