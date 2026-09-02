import { useEffect, useState } from "react";

export type BalmSession = {
  id: string;
  subject: string;
  flavor: string; // color token key
  durationSec: number; // planned duration
  completedSec: number; // actual filled amount (capped by duration)
  completedAt: string; // ISO date
};

export type Course = {
  id: string;
  name: string;
  credits: number;
  grade: string; // A, A-, B+, ...
};

const KEYS = {
  sessions: "balm.sessions",
  courses: "balm.courses",
  tasks: "balm.tasks",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setValue(read<T>(key, initial));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    if (hydrated) write(key, value);
  }, [key, value, hydrated]);
  return [value, setValue, hydrated] as const;
}

export const StorageKeys = KEYS;

export const FLAVORS = [
  { key: "pink", label: "Tangerine", color: "var(--balm-pink)" },
  { key: "mint", label: "Apricot", color: "var(--balm-mint)" },
  { key: "peach", label: "Peach", color: "var(--balm-peach)" },
  { key: "lavender", label: "Blood Orange", color: "var(--balm-lavender)" },
  { key: "butter", label: "Honey", color: "var(--balm-butter)" },
] as const;

export type FlavorKey = (typeof FLAVORS)[number]["key"];

export function flavorColor(key: string): string {
  return FLAVORS.find((f) => f.key === key)?.color ?? "var(--balm-pink)";
}

export const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0, A: 4.0, "A-": 3.7,
  "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7,
  "D+": 1.3, D: 1.0, F: 0,
};

export function calcGPA(courses: Course[]): number {
  const valid = courses.filter((c) => c.credits > 0 && c.grade in GRADE_POINTS);
  const totalCredits = valid.reduce((s, c) => s + c.credits, 0);
  if (!totalCredits) return 0;
  const totalPoints = valid.reduce((s, c) => s + c.credits * GRADE_POINTS[c.grade], 0);
  return totalPoints / totalCredits;
}