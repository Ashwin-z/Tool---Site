"use client";

import { useState, useMemo } from "react";

interface Course {
  id: number;
  name: string;
  credits: string;
  grade: string;
}

interface GradeScale {
  label: string;
  grades: { name: string; points: number }[];
  maxGpa: number;
}

const PRESETS: Record<string, GradeScale> = {
  "us-4.0": {
    label: "US 4.0 Scale",
    maxGpa: 4.0,
    grades: [
      { name: "A+", points: 4.0 }, { name: "A", points: 4.0 }, { name: "A-", points: 3.7 },
      { name: "B+", points: 3.3 }, { name: "B", points: 3.0 }, { name: "B-", points: 2.7 },
      { name: "C+", points: 2.3 }, { name: "C", points: 2.0 }, { name: "C-", points: 1.7 },
      { name: "D+", points: 1.3 }, { name: "D", points: 1.0 }, { name: "D-", points: 0.7 },
      { name: "F", points: 0.0 },
    ],
  },
  "india-10": {
    label: "India 10-Point (CGPA)",
    maxGpa: 10.0,
    grades: [
      { name: "O (10)", points: 10 }, { name: "A+ (9)", points: 9 }, { name: "A (8)", points: 8 },
      { name: "B+ (7)", points: 7 }, { name: "B (6)", points: 6 }, { name: "C (5)", points: 5 },
      { name: "P (4)", points: 4 }, { name: "F (0)", points: 0 },
    ],
  },
  "uk-4.0": {
    label: "UK 4.0 Scale",
    maxGpa: 4.0,
    grades: [
      { name: "First (4.0)", points: 4.0 }, { name: "2:1 (3.3)", points: 3.3 },
      { name: "2:2 (2.7)", points: 2.7 }, { name: "Third (2.0)", points: 2.0 },
      { name: "Pass (1.0)", points: 1.0 }, { name: "Fail (0)", points: 0.0 },
    ],
  },
  "5-point": {
    label: "5-Point Scale",
    maxGpa: 5.0,
    grades: [
      { name: "A (5)", points: 5 }, { name: "B (4)", points: 4 }, { name: "C (3)", points: 3 },
      { name: "D (2)", points: 2 }, { name: "E (1)", points: 1 }, { name: "F (0)", points: 0 },
    ],
  },
};

let nextId = 1;

export default function GpaCalculatorTool() {
  const [scaleKey, setScaleKey] = useState("us-4.0");
  const [courses, setCourses] = useState<Course[]>([
    { id: nextId++, name: "", credits: "3", grade: "" },
    { id: nextId++, name: "", credits: "3", grade: "" },
    { id: nextId++, name: "", credits: "3", grade: "" },
    { id: nextId++, name: "", credits: "3", grade: "" },
  ]);

  const scale = PRESETS[scaleKey];

  const addCourse = () => {
    setCourses((prev) => [...prev, { id: nextId++, name: "", credits: "3", grade: "" }]);
  };

  const removeCourse = (id: number) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCourse = (id: number, patch: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const result = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;
    let validCount = 0;

    for (const course of courses) {
      const cr = parseFloat(course.credits);
      const gradeObj = scale.grades.find((g) => g.name === course.grade);
      if (!gradeObj || !cr || cr <= 0) continue;
      totalPoints += gradeObj.points * cr;
      totalCredits += cr;
      validCount++;
    }

    if (totalCredits === 0) return null;

    const gpa = totalPoints / totalCredits;
    const percentage = (gpa / scale.maxGpa) * 100;

    let standing = "";
    const ratio = gpa / scale.maxGpa;
    if (ratio >= 0.9) standing = "Excellent";
    else if (ratio >= 0.8) standing = "Very Good";
    else if (ratio >= 0.7) standing = "Good";
    else if (ratio >= 0.6) standing = "Satisfactory";
    else if (ratio >= 0.5) standing = "Below Average";
    else standing = "Poor";

    return { gpa, totalCredits, totalPoints, validCount, percentage, standing };
  }, [courses, scale]);

  const clearAll = () => {
    setCourses([
      { id: nextId++, name: "", credits: "3", grade: "" },
      { id: nextId++, name: "", credits: "3", grade: "" },
      { id: nextId++, name: "", credits: "3", grade: "" },
      { id: nextId++, name: "", credits: "3", grade: "" },
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">Grading System</h2>
          <select
            value={scaleKey}
            onChange={(e) => {
              setScaleKey(e.target.value);
              // Reset grades when changing scale
              setCourses((prev) => prev.map((c) => ({ ...c, grade: "" })));
            }}
            className="rounded-lg border border-border-strong bg-surface-2 px-3 py-1.5 text-xs font-semibold text-white outline-none"
          >
            {Object.entries(PRESETS).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>

        {/* Course rows */}
        <div className="divide-y divide-white/5">
          <div className="grid grid-cols-[1fr_80px_140px_40px] items-center gap-3 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-2">
            <span>Course Name</span>
            <span>Credits</span>
            <span>Grade</span>
            <span />
          </div>
          {courses.map((course) => (
            <div key={course.id} className="grid grid-cols-[1fr_80px_140px_40px] items-center gap-3 px-5 py-2">
              <input
                type="text"
                value={course.name}
                onChange={(e) => updateCourse(course.id, { name: e.target.value })}
                placeholder="e.g. Mathematics"
                className="rounded-lg border border-border-strong bg-surface-2 px-3 py-2 text-sm text-white outline-none transition focus:border-[#6c63ff]/60 placeholder:text-muted-3"
              />
              <input
                type="number"
                value={course.credits}
                onChange={(e) => updateCourse(course.id, { credits: e.target.value })}
                placeholder="3"
                className="rounded-lg border border-border-strong bg-surface-2 px-3 py-2 text-sm text-white outline-none transition focus:border-[#6c63ff]/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <select
                value={course.grade}
                onChange={(e) => updateCourse(course.id, { grade: e.target.value })}
                className="rounded-lg border border-border-strong bg-surface-2 px-3 py-2 text-sm text-white outline-none"
              >
                <option value="">Select</option>
                {scale.grades.map((g) => (
                  <option key={g.name} value={g.name}>{g.name}</option>
                ))}
              </select>
              <button
                onClick={() => removeCourse(course.id)}
                disabled={courses.length <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-2 transition hover:bg-surface-3 hover:text-[#ff6584] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 border-t border-border px-5 py-3">
          <button
            onClick={addCourse}
            className="rounded-lg border border-border-strong px-4 py-2 text-xs font-semibold text-muted transition hover:text-foreground"
          >
            + Add Course
          </button>
          <button
            onClick={clearAll}
            className="rounded-lg border border-border-strong px-4 py-2 text-xs font-semibold text-muted transition hover:text-foreground"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold text-white">
                <span className="h-2 w-2 rounded-full bg-[#6c63ff]" />
                Your GPA
              </h3>
            </div>
            <div className="px-5 py-6 text-center">
              <div className="font-display text-6xl font-bold text-[#6c63ff]">
                {result.gpa.toFixed(2)}
              </div>
              <div className="mt-1 text-sm text-muted">
                out of {scale.maxGpa.toFixed(1)} — {result.standing}
              </div>
              {/* Progress bar */}
              <div className="mx-auto mt-4 h-3 max-w-sm overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] to-[#38d9a9] transition-all duration-500"
                  style={{ width: `${result.percentage}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-muted-2">{result.percentage.toFixed(1)}%</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Courses" value={String(result.validCount)} color="text-[#6c63ff]" />
            <StatCard label="Total Credits" value={String(result.totalCredits)} color="text-[#38d9a9]" />
            <StatCard label="Total Points" value={result.totalPoints.toFixed(1)} color="text-[#ff6584]" />
            <StatCard label="Standing" value={result.standing} color="text-[#ffa640]" small />
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color, small }: { label: string; value: string; color: string; small?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-5 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</div>
      <div className={`font-display mt-1 font-bold ${color} ${small ? "text-lg" : "text-2xl"}`}>{value}</div>
    </div>
  );
}
