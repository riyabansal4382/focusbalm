import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BalmSession, Task } from "@/lib/storage";

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

/** Least-squares fit y = a + b*x over the weekly counts. */
function linearRegression(values: number[]) {
  const n = values.length;
  if (!n) return { a: 0, b: 0 };
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let den = 0;
  values.forEach((y, x) => {
    num += (x - meanX) * (y - meanY);
    den += (x - meanX) ** 2;
  });
  const b = den === 0 ? 0 : num / den;
  return { a: meanY - b * meanX, b };
}

export function WeeklyProgressChart({
  sessions,
  tasks = [],
}: {
  sessions: BalmSession[];
  tasks?: Task[];
}) {
  const data = useMemo(() => {
    const today = startOfDay(new Date());
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return d;
    });

    const counts = days.map((d) => {
      const balms = sessions.filter(
        (s) => startOfDay(new Date(s.completedAt)).getTime() === d.getTime(),
      ).length;
      const doneTasks = tasks.filter(
        (t) =>
          t.done &&
          t.completedAt &&
          startOfDay(new Date(t.completedAt)).getTime() === d.getTime(),
      ).length;
      return balms + doneTasks;
    });

    const { a, b } = linearRegression(counts);

    return days.map((d, i) => ({
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      completed: counts[i],
      intended: Math.max(0, Number((a + b * i).toFixed(2))),
    }));
  }, [sessions, tasks]);

  const total = data.reduce((s, d) => s + d.completed, 0);
  const slope = data.length > 1 ? data[6].intended - data[0].intended : 0;

  return (
    <div className="mt-4 rounded-3xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold">This week</h3>
          <p className="text-sm text-muted-foreground">
            Tasks and balms finished each day, with a trend line for the pace you were aiming for.
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl font-semibold tabular-nums">{total}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {slope >= 0 ? "trending up" : "trending down"}
          </div>
        </div>
      </div>

      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              stroke="var(--muted-foreground)"
              fontSize={12}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              stroke="var(--muted-foreground)"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                color: "var(--foreground)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              dataKey="completed"
              name="Tasks completed"
              fill="var(--balm-peach)"
              radius={[8, 8, 0, 0]}
              maxBarSize={36}
            />
            <Line
              type="linear"
              dataKey="intended"
              name="Intended pace (trend)"
              stroke="var(--balm-pink-deep)"
              strokeWidth={3}
              strokeDasharray="6 6"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
