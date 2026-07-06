import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  StorageKeys,
  flavorColor,
  useLocalState,
  type BalmSession,
} from "@/lib/storage";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Balm" },
      { name: "description", content: "Track your daily focus sessions on a cozy calendar." },
    ],
  }),
  component: CalendarPage,
});

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function CalendarPage() {
  const [sessions] = useLocalState<BalmSession[]>(StorageKeys.sessions, []);
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<string | null>(new Date().toDateString());

  const grouped = useMemo(() => {
    const map = new Map<string, BalmSession[]>();
    for (const s of sessions) {
      const key = new Date(s.completedAt).toDateString();
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    }
    return map;
  }, [sessions]);

  const first = startOfMonth(cursor);
  const total = daysInMonth(cursor);
  const leadingBlanks = first.getDay();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));

  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const todayKey = new Date().toDateString();
  const selectedSessions = selected ? grouped.get(selected) ?? [] : [];

  return (
    <AppShell>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">calendar</p>
          <h1 className="font-display text-4xl font-semibold">{monthLabel}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-foreground/40"
          >
            ← Prev
          </button>
          <button
            onClick={() => {
              const now = new Date();
              setCursor(now);
              setSelected(now.toDateString());
            }}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-foreground/40"
          >
            Today
          </button>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-foreground/40"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-7 gap-1 pb-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, idx) => {
              if (!d) return <div key={idx} />;
              const key = d.toDateString();
              const dayS = grouped.get(key) ?? [];
              const isToday = key === todayKey;
              const isSelected = key === selected;
              return (
                <button
                  key={idx}
                  onClick={() => setSelected(key)}
                  className={
                    "relative aspect-square rounded-2xl border p-2 text-left transition " +
                    (isSelected
                      ? "border-primary bg-primary/10"
                      : "border-transparent bg-background hover:border-border")
                  }
                >
                  <div className={"text-xs font-bold " + (isToday ? "text-primary" : "text-foreground")}>
                    {d.getDate()}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {dayS.slice(0, 4).map((s) => (
                      <span
                        key={s.id}
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: flavorColor(s.flavor) }}
                        title={s.subject}
                      />
                    ))}
                    {dayS.length > 4 && (
                      <span className="text-[10px] font-bold text-muted-foreground">+{dayS.length - 4}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Selected day</p>
          <h2 className="mt-1 font-display text-2xl font-semibold">
            {selected
              ? new Date(selected).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })
              : "Pick a day"}
          </h2>
          {selectedSessions.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No balms on this day yet. Head to Focus to start one.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {selectedSessions.map((s) => (
                <li key={s.id} className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
                  <span
                    className="inline-block h-8 w-4 rounded-t-full rounded-b-sm"
                    style={{ background: flavorColor(s.flavor) }}
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{s.subject}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(s.completedSec / 60)} min ·{" "}
                      {new Date(s.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </AppShell>
  );
}