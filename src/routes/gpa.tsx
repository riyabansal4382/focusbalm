import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  GRADE_POINTS,
  StorageKeys,
  calcGPA,
  useLocalState,
  type Course,
} from "@/lib/storage";

export const Route = createFileRoute("/gpa")({
  head: () => ({
    meta: [
      { title: "GPA Calculator — Balm" },
      { name: "description", content: "Add your courses and see your GPA update live." },
    ],
  }),
  component: GpaPage,
});

const GRADES = Object.keys(GRADE_POINTS);

function GpaPage() {
  const [courses, setCourses] = useLocalState<Course[]>(StorageKeys.courses, [
    { id: crypto.randomUUID(), name: "", credits: 3, grade: "A" },
  ]);
  const gpa = calcGPA(courses);
  const totalCredits = courses.reduce((s, c) => s + (c.credits || 0), 0);

  function update(id: string, patch: Partial<Course>) {
    setCourses(courses.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }
  function add() {
    setCourses([...courses, { id: crypto.randomUUID(), name: "", credits: 3, grade: "A" }]);
  }
  function remove(id: string) {
    setCourses(courses.filter((c) => c.id !== id));
  }

  return (
    <AppShell>
      <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">gpa calculator</p>
          <h1 className="font-display text-4xl font-semibold">Course log</h1>
          <p className="mt-2 text-muted-foreground">
            Add courses, credits, and grades. Your GPA updates as you type.
          </p>

          <div className="mt-8 rounded-3xl border border-border bg-card p-4 shadow-sm">
            <div className="grid grid-cols-12 gap-3 px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <div className="col-span-6">Course</div>
              <div className="col-span-2 text-center">Credits</div>
              <div className="col-span-3 text-center">Grade</div>
              <div className="col-span-1" />
            </div>
            <ul className="space-y-2">
              {courses.map((c) => (
                <li key={c.id} className="grid grid-cols-12 items-center gap-3 rounded-2xl bg-background p-3">
                  <input
                    className="col-span-6 rounded-lg border border-border bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="e.g. Intro to Psych"
                    value={c.name}
                    onChange={(e) => update(c.id, { name: e.target.value })}
                  />
                  <input
                    type="number"
                    min={0}
                    max={12}
                    className="col-span-2 rounded-lg border border-border bg-card px-3 py-2 text-center outline-none focus:ring-2 focus:ring-primary/40"
                    value={c.credits}
                    onChange={(e) => update(c.id, { credits: Number(e.target.value) })}
                  />
                  <select
                    className="col-span-3 rounded-lg border border-border bg-card px-3 py-2 text-center font-semibold outline-none focus:ring-2 focus:ring-primary/40"
                    value={c.grade}
                    onChange={(e) => update(c.id, { grade: e.target.value })}
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <button
                    className="col-span-1 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(c.id)}
                    aria-label="Remove course"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={add}
              className="mt-3 w-full rounded-2xl border-2 border-dashed border-border py-3 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:border-primary/50 hover:text-foreground"
            >
              + Add course
            </button>
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current GPA</p>
          <div
            className="mt-2 font-display text-7xl font-semibold tracking-tight"
            style={{ color: "var(--balm-pink-deep)" }}
          >
            {gpa.toFixed(2)}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-background p-3">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Courses</div>
              <div className="font-display text-2xl font-semibold">{courses.length}</div>
            </div>
            <div className="rounded-xl bg-background p-3">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Credits</div>
              <div className="font-display text-2xl font-semibold">{totalCredits}</div>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Using standard 4.0 scale. Saved automatically.</p>
        </aside>
      </div>
    </AppShell>
  );
}