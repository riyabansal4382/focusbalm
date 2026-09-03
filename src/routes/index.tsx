import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { LipBalm } from "@/components/LipBalm";
import { FocusPlayer } from "@/components/FocusPlayer";
import { FocusFullscreen } from "@/components/FocusFullscreen";

import {
  FLAVORS,
  StorageKeys,
  flavorColor,
  useLocalState,
  type BalmSession,
} from "@/lib/storage";

export const Route = createFileRoute("/")({
  component: FocusPage,
});

const DURATION_PRESETS = [
  { label: "15 min", sec: 15 * 60 },
  { label: "25 min", sec: 25 * 60 },
  { label: "50 min", sec: 50 * 60 },
  { label: "90 min", sec: 90 * 60 },
];

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function FocusPage() {
  const [subject, setSubject] = useState("Study Session");
  const [flavor, setFlavor] = useState<string>(FLAVORS[0].key);
  const [duration, setDuration] = useState(25 * 60);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [sessions, setSessions] = useLocalState<BalmSession[]>(StorageKeys.sessions, []);
  const startedAt = useRef<number | null>(null);

  const fill = Math.min(1, elapsed / duration);
  const color = useMemo(() => flavorColor(flavor), [flavor]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= duration) {
          window.clearInterval(id);
          return duration;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, duration]);

  // Auto-complete
  useEffect(() => {
    if (elapsed >= duration && running) {
      setRunning(false);
      finishSession(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, duration]);

  function setDurationMinutes(mins: number) {
    const clamped = Math.max(1, Math.min(240, Math.round(mins || 1)));
    setDuration(clamped * 60);
    setElapsed(0);
    setRunning(false);
  }

  function start() {
    if (elapsed >= duration) setElapsed(0);
    startedAt.current = Date.now();
    setRunning(true);
  }

  function pause() {
    setRunning(false);
  }

  function reset() {
    setRunning(false);
    setElapsed(0);
  }

  function finishSession(complete: boolean) {
    if (elapsed < 5) return; // ignore tiny sessions
    const session: BalmSession = {
      id: crypto.randomUUID(),
      subject: subject || "Study Session",
      flavor,
      durationSec: duration,
      completedSec: elapsed,
      completedAt: new Date().toISOString(),
    };
    setSessions([session, ...sessions]);
    if (complete) {
      setCelebrate(true);
      window.setTimeout(() => setCelebrate(false), 2400);
    }
    setElapsed(0);
  }

  const remaining = Math.max(0, duration - elapsed);

  return (
    <AppShell>
      <section className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">
            live focus session
          </p>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Fill your balm,<br />one minute at a time.
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Pick a flavor, press start, and watch your lip balm slowly fill as you focus.
            When it's full, it gets tucked onto your shelf.
          </p>

          <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              What are you studying?
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Organic Chem, essay draft…"
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-display text-lg outline-none focus:ring-2 focus:ring-primary/40"
            />

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Flavor
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {FLAVORS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFlavor(f.key)}
                    className={
                      "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition " +
                      (flavor === f.key
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background hover:border-foreground/40")
                    }
                  >
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ background: f.color }}
                    />
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Session length
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {DURATION_PRESETS.map((p) => (
                  <button
                    key={p.sec}
                    onClick={() => setDurationMinutes(p.sec / 60)}
                    className={
                      "rounded-full border px-4 py-1.5 text-sm font-semibold transition " +
                      (duration === p.sec
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background hover:border-primary/40")
                    }
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Custom length
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDurationMinutes(Math.round(duration / 60) - 5)}
                      className="h-8 w-8 rounded-full border border-border font-bold hover:border-primary/50"
                      aria-label="Decrease by 5 minutes"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={240}
                      value={Math.round(duration / 60)}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-20 rounded-xl border border-border bg-card px-3 py-1.5 text-center font-display text-lg tabular-nums outline-none focus:ring-2 focus:ring-primary/40"
                      aria-label="Custom session length in minutes"
                    />
                    <button
                      onClick={() => setDurationMinutes(Math.round(duration / 60) + 5)}
                      className="h-8 w-8 rounded-full border border-border font-bold hover:border-primary/50"
                      aria-label="Increase by 5 minutes"
                    >
                      +
                    </button>
                    <span className="text-sm text-muted-foreground">min</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={180}
                  step={1}
                  value={Math.round(duration / 60)}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="mt-3 w-full accent-[var(--primary)]"
                  aria-label="Session length slider"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Balm + timer */}
        <div className="relative flex flex-col items-center">
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 mx-auto my-auto h-72 w-72 rounded-full blur-3xl"
              style={{ background: color, opacity: 0.25 }}
            />
            <LipBalm fill={fill} color={color} size={240} animated={running} label={subject} />
          </div>
          <div className="mt-6 text-center">
            <div className="font-display text-6xl font-semibold tabular-nums tracking-tight">
              {formatTime(remaining)}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {Math.round(fill * 100)}% filled
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            {!running ? (
              <button
                onClick={start}
                className="rounded-full bg-primary px-8 py-3 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 active:scale-95"
              >
                {elapsed > 0 ? "Resume" : "Start filling"}
              </button>
            ) : (
              <button
                onClick={pause}
                className="rounded-full bg-foreground px-8 py-3 font-bold text-background transition hover:opacity-90 active:scale-95"
              >
                Pause
              </button>
            )}
            <button
              onClick={() => finishSession(false)}
              disabled={elapsed < 5}
              className="rounded-full border border-border bg-card px-6 py-3 font-semibold transition hover:border-foreground/40 disabled:opacity-40"
            >
              Save to shelf
            </button>
            <button
              onClick={() => setFullscreen(true)}
              className="rounded-full border border-border bg-card px-6 py-3 font-semibold transition hover:border-foreground/40"
            >
              Full screen
            </button>
            <button
              onClick={reset}
              className="rounded-full px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          </div>
          {celebrate && (
            <div
              role="status"
              className="pointer-events-none absolute -top-4 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold shadow-md"
              style={{ animation: "balm-shimmer 1.2s ease-in-out infinite" }}
            >
              ✨ balm complete — tucked on your shelf!
            </div>
          )}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold">Today's focus</h2>
        <p className="text-sm text-muted-foreground">
          Tiny wins add up. Each finished balm lives on your shelf.
        </p>
        <TodayStrip sessions={sessions} />
      </section>

      <FocusPlayer running={running} />

      <FocusFullscreen
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        fill={fill}
        color={color}
        label={subject}
        time={formatTime(remaining)}
        running={running}
        onToggle={() => (running ? pause() : start())}
      />

    </AppShell>
  );
}

function TodayStrip({ sessions }: { sessions: BalmSession[] }) {
  const today = new Date().toDateString();
  const todays = sessions.filter((s) => new Date(s.completedAt).toDateString() === today);
  const totalMin = Math.round(todays.reduce((sum, s) => sum + s.completedSec, 0) / 60);
  return (
    <div className="mt-4 grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-3">
      <Stat label="Balms finished today" value={todays.length.toString()} />
      <Stat label="Minutes focused" value={totalMin.toString()} />
      <Stat
        label="Longest today"
        value={
          todays.length
            ? `${Math.max(...todays.map((s) => Math.round(s.completedSec / 60)))} min`
            : "—"
        }
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-3xl font-semibold">{value}</div>
    </div>
  );
}
