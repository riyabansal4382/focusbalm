import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { LipBalm } from "@/components/LipBalm";
import {
  StorageKeys,
  flavorColor,
  useLocalState,
  type BalmSession,
} from "@/lib/storage";

export const Route = createFileRoute("/shelf")({
  head: () => ({
    meta: [
      { title: "Shelf — Balm" },
      { name: "description", content: "Your collection of finished focus balms." },
    ],
  }),
  component: ShelfPage,
});

function ShelfPage() {
  const [sessions, setSessions] = useLocalState<BalmSession[]>(StorageKeys.sessions, []);

  const totalMin = useMemo(
    () => Math.round(sessions.reduce((s, x) => s + x.completedSec, 0) / 60),
    [sessions],
  );

  const rows: BalmSession[][] = [];
  for (let i = 0; i < sessions.length; i += 6) rows.push(sessions.slice(i, i + 6));

  return (
    <AppShell>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">the shelf</p>
          <h1 className="font-display text-4xl font-semibold">Your balm collection</h1>
          <p className="mt-2 text-muted-foreground">
            {sessions.length} balm{sessions.length === 1 ? "" : "s"} · {totalMin} minutes of focus
          </p>
        </div>
        {sessions.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Clear all balms from your shelf?")) setSessions([]);
            }}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground hover:border-destructive/50 hover:text-destructive"
          >
            Clear shelf
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="mt-16 rounded-3xl border-2 border-dashed border-border bg-card p-16 text-center">
          <div className="mx-auto mb-4 w-fit opacity-60">
            <LipBalm fill={0} size={120} />
          </div>
          <h2 className="font-display text-2xl font-semibold">Shelf's empty</h2>
          <p className="mt-2 text-muted-foreground">
            Finish your first focus session and it'll show up here.
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-16">
          {rows.map((row, i) => (
            <ShelfRow key={i} row={row} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function ShelfRow({ row }: { row: BalmSession[] }) {
  return (
    <div>
      <div className="flex items-end justify-center gap-6 pb-2">
        {row.map((s) => {
          const fill = Math.min(1, s.completedSec / s.durationSec);
          return (
            <div key={s.id} className="group flex flex-col items-center">
              <div className="transition group-hover:-translate-y-1">
                <LipBalm fill={fill} color={flavorColor(s.flavor)} size={100} label={s.subject} />
              </div>
              <div className="mt-2 max-w-[120px] truncate text-center text-xs font-semibold">
                {s.subject}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {Math.round(s.completedSec / 60)} min ·{" "}
                {new Date(s.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="h-3 rounded-full shadow-md"
        style={{ background: "linear-gradient(180deg, var(--balm-butter) 0%, oklch(0.78 0.08 60) 100%)" }}
      />
      <div className="mx-4 h-1 rounded-b-md bg-black/5" />
    </div>
  );
}