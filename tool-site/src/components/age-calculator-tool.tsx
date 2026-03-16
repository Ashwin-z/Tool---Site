"use client";

import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════
   AGE CALCULATOR
   ═══════════════════════════════════════════════════════ */

/* ──────────── helpers ──────────── */

const ZODIAC: { name: string; emoji: string; start: [number, number]; end: [number, number] }[] = [
  { name: "Capricorn", emoji: "♑", start: [12, 22], end: [1, 19] },
  { name: "Aquarius", emoji: "♒", start: [1, 20], end: [2, 18] },
  { name: "Pisces", emoji: "♓", start: [2, 19], end: [3, 20] },
  { name: "Aries", emoji: "♈", start: [3, 21], end: [4, 19] },
  { name: "Taurus", emoji: "♉", start: [4, 20], end: [5, 20] },
  { name: "Gemini", emoji: "♊", start: [5, 21], end: [6, 20] },
  { name: "Cancer", emoji: "♋", start: [6, 21], end: [7, 22] },
  { name: "Leo", emoji: "♌", start: [7, 23], end: [8, 22] },
  { name: "Virgo", emoji: "♍", start: [8, 23], end: [9, 22] },
  { name: "Libra", emoji: "♎", start: [9, 23], end: [10, 22] },
  { name: "Scorpio", emoji: "♏", start: [10, 23], end: [11, 21] },
  { name: "Sagittarius", emoji: "♐", start: [11, 22], end: [12, 21] },
];

function getZodiac(month: number, day: number) {
  for (const z of ZODIAC) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if (sm === em) {
      if (month === sm && day >= sd && day <= ed) return z;
    } else if (sm > em) {
      // Capricorn wraps Dec→Jan
      if ((month === sm && day >= sd) || (month === em && day <= ed)) return z;
    } else {
      if ((month === sm && day >= sd) || (month === em && day <= ed)) return z;
    }
  }
  return ZODIAC[0];
}

function getGeneration(year: number) {
  if (year >= 2013) return { name: "Gen Alpha", range: "2013–present" };
  if (year >= 1997) return { name: "Gen Z", range: "1997–2012" };
  if (year >= 1981) return { name: "Millennial", range: "1981–1996" };
  if (year >= 1965) return { name: "Gen X", range: "1965–1980" };
  if (year >= 1946) return { name: "Baby Boomer", range: "1946–1964" };
  if (year >= 1928) return { name: "Silent Generation", range: "1928–1945" };
  return { name: "Greatest Generation", range: "1901–1927" };
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  totalWeeks: number;
  nextBirthday: Date;
  daysUntilBirthday: number;
  dayOfBirth: string;
  zodiac: { name: string; emoji: string };
  generation: { name: string; range: string };
  birthstone: string;
  leapYearBaby: boolean;
}

function calculateAge(dob: Date, asOf: Date): AgeResult {
  const birthYear = dob.getFullYear();
  const birthMonth = dob.getMonth();
  const birthDay = dob.getDate();

  let years = asOf.getFullYear() - birthYear;
  let months = asOf.getMonth() - birthMonth;
  let days = asOf.getDate() - birthDay;

  if (days < 0) {
    months--;
    const prevMonth = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const diffMs = asOf.getTime() - dob.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalWeeks = Math.floor(totalDays / 7);

  // Next birthday
  let nextBirthdayYear = asOf.getFullYear();
  let nextBirthday = new Date(nextBirthdayYear, birthMonth, birthDay);
  if (nextBirthday <= asOf) {
    nextBirthdayYear++;
    nextBirthday = new Date(nextBirthdayYear, birthMonth, birthDay);
  }
  // Handle Feb 29 birthdays
  if (birthMonth === 1 && birthDay === 29 && !isLeapYear(nextBirthdayYear)) {
    nextBirthday = new Date(nextBirthdayYear, 2, 1); // March 1
  }
  const daysUntilBirthday = Math.ceil(
    (nextBirthday.getTime() - asOf.getTime()) / (1000 * 60 * 60 * 24)
  );

  const dayOfBirth = DAYS_OF_WEEK[dob.getDay()];
  const zodiac = getZodiac(birthMonth + 1, birthDay);
  const generation = getGeneration(birthYear);

  const birthstones = [
    "Garnet", "Amethyst", "Aquamarine", "Diamond", "Emerald", "Pearl",
    "Ruby", "Peridot", "Sapphire", "Opal", "Topaz", "Tanzanite",
  ];
  const birthstone = birthstones[birthMonth];

  const leapYearBaby = birthMonth === 1 && birthDay === 29;

  return {
    years, months, days, totalDays, totalHours, totalMinutes, totalSeconds,
    totalWeeks, nextBirthday, daysUntilBirthday, dayOfBirth, zodiac,
    generation, birthstone, leapYearBaby,
  };
}

/* ──────────── component ──────────── */

export default function AgeCalculatorTool() {
  const [dob, setDob] = useState("");
  const [asOf, setAsOf] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });

  const result = useMemo<AgeResult | null>(() => {
    if (!dob) return null;
    const dobDate = new Date(dob + "T00:00:00");
    const asOfDate = new Date(asOf + "T00:00:00");
    if (isNaN(dobDate.getTime()) || isNaN(asOfDate.getTime())) return null;
    if (dobDate > asOfDate) return null;
    return calculateAge(dobDate, asOfDate);
  }, [dob, asOf]);

  return (
    <div className="space-y-4">
      {/* ── Input card ── */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118] shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="border-b border-white/10 px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">Enter Your Date of Birth</h2>
        </div>

        <div className="flex flex-wrap items-end gap-4 px-5 py-5">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#57576f]">
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              max={asOf}
              className="rounded-lg border border-white/15 bg-[#17171f] px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#57576f]">
              Age as of
            </label>
            <input
              type="date"
              value={asOf}
              onChange={(e) => setAsOf(e.target.value)}
              className="rounded-lg border border-white/15 bg-[#17171f] px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60 [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      {result && (
        <>
          {/* Primary age card */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118] shadow-[0_20px_40px_rgba(0,0,0,.45)]">
            <div className="border-b border-white/10 px-5 py-3">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold tracking-tight text-white">
                <span className="h-2 w-2 rounded-full bg-[#6c63ff]" />
                Your Age
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-6 px-5 py-6">
              <AgeUnit value={result.years} label="Years" color="text-[#6c63ff]" />
              <AgeUnit value={result.months} label="Months" color="text-[#ff6584]" />
              <AgeUnit value={result.days} label="Days" color="text-[#38d9a9]" />
            </div>
            {result.leapYearBaby && (
              <div className="border-t border-white/10 px-5 py-2.5">
                <p className="text-xs text-amber-300">🎉 You&apos;re a leap year baby! Born on February 29.</p>
              </div>
            )}
          </div>

          {/* Alternate expressions */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118]">
            <div className="border-b border-white/10 px-5 py-3">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold tracking-tight text-white">
                <span className="h-2 w-2 rounded-full bg-[#ff6584]" />
                Age in Different Units
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-4">
              <StatCell label="Total Months" value={`${result.years * 12 + result.months}`} />
              <StatCell label="Total Weeks" value={result.totalWeeks.toLocaleString()} />
              <StatCell label="Total Days" value={result.totalDays.toLocaleString()} />
              <StatCell label="Total Hours" value={result.totalHours.toLocaleString()} />
              <StatCell label="Total Minutes" value={result.totalMinutes.toLocaleString()} />
              <StatCell label="Total Seconds" value={result.totalSeconds.toLocaleString()} />
              <StatCell
                label="Next Birthday"
                value={result.nextBirthday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              />
              <StatCell
                label="Days Until Birthday"
                value={result.daysUntilBirthday === 0 ? "🎂 Today!" : `${result.daysUntilBirthday} days`}
              />
            </div>
          </div>

          {/* Fun facts */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118]">
            <div className="border-b border-white/10 px-5 py-3">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold tracking-tight text-white">
                <span className="h-2 w-2 rounded-full bg-[#38d9a9]" />
                Fun Facts
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
              <FactCard
                emoji="📅"
                label="Born on"
                value={result.dayOfBirth}
              />
              <FactCard
                emoji={result.zodiac.emoji}
                label="Zodiac Sign"
                value={result.zodiac.name}
              />
              <FactCard
                emoji="👥"
                label="Generation"
                value={result.generation.name}
                sub={result.generation.range}
              />
              <FactCard
                emoji="💎"
                label="Birthstone"
                value={result.birthstone}
              />
              <FactCard
                emoji="❤️"
                label="Heartbeats"
                value={`~${Math.round(result.totalMinutes * 72).toLocaleString()}`}
                sub="at 72 bpm avg"
              />
              <FactCard
                emoji="🌙"
                label="Slept approx."
                value={`${Math.round(result.totalDays * 8).toLocaleString()} hrs`}
                sub="at 8 hrs/day avg"
              />
            </div>
          </div>

          {/* Age milestones */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118]">
            <div className="border-b border-white/10 px-5 py-3">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold tracking-tight text-white">
                <span className="h-2 w-2 rounded-full bg-[#ffa640]" />
                Milestones
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-2 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { age: 1000, unit: "days", label: "1,000 Days" },
                { age: 5000, unit: "days", label: "5,000 Days" },
                { age: 10000, unit: "days", label: "10,000 Days" },
                { age: 20000, unit: "days", label: "20,000 Days" },
                { age: 1000000, unit: "hours", label: "1M Hours" },
                { age: 1000000000, unit: "seconds", label: "1B Seconds" },
              ].map((ms) => {
                const dobDate = new Date(dob + "T00:00:00");
                let milestoneDate: Date;
                if (ms.unit === "days") {
                  milestoneDate = new Date(dobDate.getTime() + ms.age * 24 * 60 * 60 * 1000);
                } else if (ms.unit === "hours") {
                  milestoneDate = new Date(dobDate.getTime() + ms.age * 60 * 60 * 1000);
                } else {
                  milestoneDate = new Date(dobDate.getTime() + ms.age * 1000);
                }
                const isPast = milestoneDate <= new Date(asOf + "T00:00:00");
                return (
                  <div
                    key={ms.label}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                      isPast
                        ? "border-[#38d9a9]/30 bg-[#38d9a9]/5"
                        : "border-white/10 bg-[#17171f]"
                    }`}
                  >
                    <span className={`text-sm ${isPast ? "text-[#38d9a9]" : "text-[#515168]"}`}>
                      {isPast ? "✅" : "⏳"}
                    </span>
                    <div>
                      <div className={`text-xs font-semibold ${isPast ? "text-[#38d9a9]" : "text-white"}`}>
                        {ms.label}
                      </div>
                      <div className="text-[10px] text-[#9b9bb3]">
                        {milestoneDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {isPast ? " ✓" : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ──────────── sub-components ──────────── */

function AgeUnit({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`font-display text-5xl font-bold leading-none ${color}`}>{value}</div>
      <div className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-[#57576f]">{label}</div>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#111118] px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#57576f]">{label}</div>
      <div className="mt-1 font-display text-lg font-bold text-white">{value}</div>
    </div>
  );
}

function FactCard({ emoji, label, value, sub }: { emoji: string; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#17171f] px-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-lg">
        {emoji}
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#57576f]">{label}</div>
        <div className="font-display text-sm font-bold text-white">{value}</div>
        {sub && <div className="text-[10px] text-[#9b9bb3]">{sub}</div>}
      </div>
    </div>
  );
}
