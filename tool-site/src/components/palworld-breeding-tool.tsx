"use client";

import Image from "next/image";
import { useDeferredValue, useState, type ReactNode } from "react";

import type { PalworldGender, PalworldPal } from "@/lib/palworld-breeding-data";
import {
  findPalworldBreedingOutcomes,
  findPalworldParentPairsForChild,
  getPalworldRarityLabel,
  isValidBreedingGenderPair,
  palworldBreedingStats,
  palworldPalMap,
  selectablePalworldParents,
  type PalworldBreedingOutcome,
  type PalworldSelectionGender,
} from "@/lib/palworld-breeding";
import { getPalworldImageUrl } from "@/lib/palworld-pal-icons";

type ToolMode = "parents" | "children";
type ParentSlot = "A" | "B";

const defaultParentAId = "Anubis";
const defaultParentBId = "BirdDragon";
const defaultTargetChildId = "Anubis";

const genderOptions: { id: PalworldSelectionGender; label: string }[] = [
  { id: "any", label: "Any" },
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
];

export default function PalworldBreedingTool() {
  const defaultParentA = palworldPalMap.get(defaultParentAId) ?? selectablePalworldParents[0];
  const defaultParentB = palworldPalMap.get(defaultParentBId) ?? selectablePalworldParents[1];
  const defaultTargetChild = palworldPalMap.get(defaultTargetChildId) ?? selectablePalworldParents[0];

  const [mode, setMode] = useState<ToolMode>("parents");
  const [activeParentSlot, setActiveParentSlot] = useState<ParentSlot>("A");
  const [parentAId, setParentAId] = useState(defaultParentA.id);
  const [parentBId, setParentBId] = useState(defaultParentB.id);
  const [parentAGender, setParentAGender] = useState<PalworldSelectionGender>("any");
  const [parentBGender, setParentBGender] = useState<PalworldSelectionGender>("any");
  const [targetChildId, setTargetChildId] = useState(defaultTargetChild.id);
  const [parentSearch, setParentSearch] = useState("");
  const [childSearch, setChildSearch] = useState("");

  const deferredParentSearch = useDeferredValue(parentSearch.trim().toLowerCase());
  const deferredChildSearch = useDeferredValue(childSearch.trim().toLowerCase());

  const parentA = palworldPalMap.get(parentAId) ?? defaultParentA;
  const parentB = palworldPalMap.get(parentBId) ?? defaultParentB;
  const targetChild = palworldPalMap.get(targetChildId) ?? defaultTargetChild;

  const parentOutcomes = findPalworldBreedingOutcomes(
    parentA.id,
    parentB.id,
    parentAGender,
    parentBGender,
  );
  const childCombinations = findPalworldParentPairsForChild(targetChild.id);
  const parentGenderPairIsValid = isValidBreedingGenderPair(parentAGender, parentBGender);

  const filteredParentOptions = selectablePalworldParents.filter((pal) =>
    matchesPalSearch(pal, deferredParentSearch),
  );
  const filteredChildOptions = selectablePalworldParents.filter((pal) =>
    matchesPalSearch(pal, deferredChildSearch),
  );

  const primaryOutcome = parentOutcomes[0] ?? null;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-border bg-surface shadow-[0_30px_80px_rgba(0,0,0,.45)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top,rgba(34,211,238,.20),transparent_68%)]" />
      <div className="pointer-events-none absolute -right-12 top-24 hidden h-56 w-56 rounded-full bg-[#6c63ff]/10 blur-3xl md:block" />
      <div className="pointer-events-none absolute -left-10 bottom-16 hidden h-48 w-48 rounded-full bg-[#38d9a9]/10 blur-3xl md:block" />

      <div className="relative p-5 md:p-7">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7dd3fc]">
              Live Pal Visuals
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Palworld Breeding Calculator
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              Search current Pals, pick the parents visually, and check breeding combinations with live-style icon
              artwork sourced from the same Palworld image set used by palworld.gg.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 xl:max-w-[420px]">
            <StatPill label="Parent pool" value={palworldBreedingStats.parentPool.toString()} />
            <StatPill label="Children" value={palworldBreedingStats.regularEligibleChildren.toString()} />
            <StatPill label="Special combos" value={palworldBreedingStats.totalSpecialCombos.toString()} />
            <StatPill
              label="Stored outcomes"
              value={palworldBreedingStats.totalBreedingOutcomes.toLocaleString()}
            />
          </div>
        </div>

        <div className="mt-5 inline-flex rounded-2xl border border-white/10 bg-surface-2/80 p-1">
          <ModeButton
            active={mode === "parents"}
            label="Parents to Child"
            onClick={() => setMode("parents")}
          />
          <ModeButton
            active={mode === "children"}
            label="Child to Parents"
            onClick={() => setMode("children")}
          />
        </div>

        {mode === "parents" ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 xl:grid-cols-[1fr_auto_1fr_auto_1fr] xl:items-center">
              <SelectedPalCard
                label="Parent A"
                pal={parentA}
                accentClass="border-[#67e8f9]/45 shadow-[0_0_0_1px_rgba(103,232,249,.18)]"
                isActive={activeParentSlot === "A"}
                actionLabel="Pick for Parent A"
                onClick={() => setActiveParentSlot("A")}
              >
                <GenderPicker
                  value={parentAGender}
                  onChange={setParentAGender}
                  accentClass="data-[active=true]:border-[#67e8f9]/60 data-[active=true]:bg-[#67e8f9]/12"
                />
              </SelectedPalCard>

              <EquationGlyph symbol="+" />

              <SelectedPalCard
                label="Parent B"
                pal={parentB}
                accentClass="border-[#6c63ff]/45 shadow-[0_0_0_1px_rgba(108,99,255,.18)]"
                isActive={activeParentSlot === "B"}
                actionLabel="Pick for Parent B"
                onClick={() => setActiveParentSlot("B")}
              >
                <GenderPicker
                  value={parentBGender}
                  onChange={setParentBGender}
                  accentClass="data-[active=true]:border-[#6c63ff]/60 data-[active=true]:bg-[#6c63ff]/12"
                />
              </SelectedPalCard>

              <EquationGlyph symbol="=" />

              <ResultHeroCard outcome={primaryOutcome} totalOutcomes={parentOutcomes.length} />
            </div>

            {!parentGenderPairIsValid ? (
              <Notice tone="warning">
                Two fixed parents cannot both be male or both be female. Set one side to <strong>Any</strong> or
                choose opposite genders to calculate a valid Palworld breeding result.
              </Notice>
            ) : null}

            <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="rounded-[24px] border border-white/10 bg-surface-2/70 p-4">
                <div className="flex flex-col gap-3 border-b border-white/10 pb-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">Search for a parent Pal</h3>
                    <p className="mt-1 text-sm text-muted">
                      Click any Pal card to place it into {activeParentSlot === "A" ? "Parent A" : "Parent B"}.
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-[#0b2034]/80 px-3 py-1.5 text-xs font-semibold text-[#a5f3fc]">
                    Now selecting {activeParentSlot === "A" ? "Parent A" : "Parent B"}
                  </div>
                </div>

                <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.24em] text-muted-2">
                  Search Pals
                </label>
                <input
                  type="text"
                  value={parentSearch}
                  onChange={(event) => setParentSearch(event.target.value)}
                  placeholder="Enter name, number, element, or id"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-surface px-4 py-3 text-sm text-white outline-none transition focus:border-[#67e8f9]/40"
                />

                <div className="mt-4 flex items-center justify-between text-xs text-muted">
                  <span>{filteredParentOptions.length} Pals match your search</span>
                  <button
                    type="button"
                    onClick={() => setParentSearch("")}
                    className="rounded-full border border-white/10 px-3 py-1 text-white transition hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    Clear
                  </button>
                </div>

                <div className="mt-4 grid max-h-[34rem] grid-cols-2 gap-3 overflow-y-auto pr-1 md:grid-cols-3">
                  {filteredParentOptions.map((pal) => (
                    <PalGridButton
                      key={pal.id}
                      pal={pal}
                      isSelected={pal.id === (activeParentSlot === "A" ? parentA.id : parentB.id)}
                      onClick={() => {
                        if (activeParentSlot === "A") {
                          setParentAId(pal.id);
                        } else {
                          setParentBId(pal.id);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <ResultPanel title="Breeding Results" subtitle="Current parent pair output">
                  {parentOutcomes.length ? (
                    <div className="space-y-3">
                      {parentOutcomes.map((outcome) => (
                        <OutcomeCard key={getOutcomeKey(outcome)} outcome={outcome} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No result to show"
                      description="Pick a valid gender pair and the calculator will show the child here."
                    />
                  )}
                </ResultPanel>

                <ResultPanel title="Breeding Notes" subtitle="How the current calculation is being resolved">
                  <ul className="space-y-3 text-sm leading-6 text-muted">
                    <li>
                      The calculator checks special breeding combinations first, then falls back to the standard
                      breeding power average.
                    </li>
                    <li>
                      Same-species pairs stay same-species, which matters for unique or legendary Palworld breeding
                      cases.
                    </li>
                    <li>
                      If a pairing can produce multiple results, the difference comes from female-parent requirements in
                      special combos.
                    </li>
                  </ul>
                </ResultPanel>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 2xl:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
              <div className="space-y-4">
                <SelectedPalCard
                  label="Target Child"
                  pal={targetChild}
                  accentClass="border-[#facc15]/50 shadow-[0_0_0_1px_rgba(250,204,21,.18)]"
                  isActive
                  actionLabel="Target child"
                >
                  <div className="rounded-2xl border border-[#facc15]/20 bg-[#facc15]/10 px-3 py-2 text-center text-sm text-[#fde68a]">
                    {childCombinations.length} breeding combination
                    {childCombinations.length === 1 ? "" : "s"} found
                  </div>
                </SelectedPalCard>

                <ResultPanel title="Search Child Pal" subtitle="Choose the Pal you want to hatch">
                  <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-muted-2">
                    Search children
                  </label>
                  <input
                    type="text"
                    value={childSearch}
                    onChange={(event) => setChildSearch(event.target.value)}
                    placeholder="Enter child name, number, element, or id"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-surface px-4 py-3 text-sm text-white outline-none transition focus:border-[#facc15]/40"
                  />

                  <div className="mt-4 flex items-center justify-between text-xs text-muted">
                    <span>{filteredChildOptions.length} children match your search</span>
                    <button
                      type="button"
                      onClick={() => setChildSearch("")}
                      className="rounded-full border border-white/10 px-3 py-1 text-white transition hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="mt-4 grid max-h-[34rem] grid-cols-2 gap-3 overflow-y-auto pr-1 md:grid-cols-3">
                    {filteredChildOptions.map((pal) => (
                      <PalGridButton
                        key={pal.id}
                        pal={pal}
                        isSelected={pal.id === targetChild.id}
                        onClick={() => setTargetChildId(pal.id)}
                      />
                    ))}
                  </div>
                </ResultPanel>
              </div>

              <ResultPanel
                title="Breeding Combinations"
                subtitle={`Every stored parent pair that can produce ${targetChild.name}`}
                contentClassName="space-y-3"
              >
                {childCombinations.length ? (
                  <>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <SmallStatCard
                        label="Special"
                        value={childCombinations.filter((combo) => combo.method === "special").length.toString()}
                        accentClass="text-[#7dd3fc]"
                      />
                      <SmallStatCard
                        label="Same species"
                        value={
                          childCombinations.filter((combo) => combo.method === "same-species").length.toString()
                        }
                        accentClass="text-[#a5b4fc]"
                      />
                      <SmallStatCard
                        label="Breeding power"
                        value={childCombinations.filter((combo) => combo.method === "regular").length.toString()}
                        accentClass="text-[#86efac]"
                      />
                    </div>

                    <div className="max-h-[48rem] space-y-3 overflow-y-auto pr-1">
                      {childCombinations.map((combo) => (
                        <CombinationRow key={getOutcomeKey(combo)} combo={combo} child={targetChild} />
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState
                    title="No combinations found"
                    description="This target Pal is not currently available through the stored breeding outcome pool."
                  />
                )}
              </ResultPanel>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function matchesPalSearch(pal: PalworldPal, query: string) {
  if (!query) return true;

  const haystack = [
    pal.name,
    pal.id,
    pal.number ?? "",
    ...pal.elements,
    getPalworldRarityLabel(pal.rarity),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function getOutcomeKey(outcome: PalworldBreedingOutcome) {
  return [
    outcome.parentAId,
    outcome.parentBId,
    outcome.childId,
    outcome.method,
    outcome.requiredParentAGender ?? "any",
    outcome.requiredParentBGender ?? "any",
  ].join("::");
}

function ModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-[18px] px-4 py-2.5 text-sm font-semibold transition",
        active
          ? "bg-[#0d3f5d] text-[#d8f5ff] shadow-[0_10px_30px_rgba(12,101,142,.28)]"
          : "text-muted hover:bg-white/[0.05] hover:text-white",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function SelectedPalCard({
  label,
  pal,
  accentClass,
  isActive,
  actionLabel,
  onClick,
  children,
}: {
  label: string;
  pal: PalworldPal;
  accentClass: string;
  isActive: boolean;
  actionLabel: string;
  onClick?: () => void;
  children?: ReactNode;
}) {
  const content = (
    <div
      className={[
        "rounded-[26px] border bg-[linear-gradient(180deg,rgba(12,23,40,.98),rgba(9,15,28,.98))] p-4 text-center transition",
        accentClass,
        isActive ? "translate-y-[-1px]" : "border-white/10",
      ].join(" ")}
    >
      <div className="mb-4 flex items-center justify-between gap-3 text-left">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-2">{label}</p>
          <p className="mt-1 text-sm text-white">{actionLabel}</p>
        </div>
        {onClick ? (
          <span
            className={[
              "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
              isActive
                ? "border-white/20 bg-white/[0.08] text-white"
                : "border-white/10 bg-white/[0.03] text-muted",
            ].join(" ")}
          >
            {isActive ? "Selected" : "Activate"}
          </span>
        ) : null}
      </div>

      <PalIcon pal={pal} size={132} ringClass="border-white/20" />

      <div className="mt-4">
        <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">{pal.name}</h3>
        <p className="mt-1 text-sm text-muted">{getPalDescriptor(pal)}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <RarityBadge rarity={pal.rarity} />
        {pal.elements.map((element) => (
          <ElementBadge key={`${pal.id}-${element}`} element={element} />
        ))}
      </div>

      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );

  if (!onClick) return content;

  return (
    <button type="button" onClick={onClick} className="text-left">
      {content}
    </button>
  );
}

function EquationGlyph({ symbol }: { symbol: string }) {
  return (
    <div className="hidden justify-center lg:flex">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-surface-2 text-4xl font-light text-[#7dd3fc]">
        {symbol}
      </div>
    </div>
  );
}

function ResultHeroCard({
  outcome,
  totalOutcomes,
}: {
  outcome: PalworldBreedingOutcome | null;
  totalOutcomes: number;
}) {
  const child = outcome ? palworldPalMap.get(outcome.childId) ?? null : null;

  return (
    <div className="rounded-[26px] border border-[#facc15]/45 bg-[linear-gradient(180deg,rgba(27,24,8,.98),rgba(16,15,8,.98))] p-4 text-center shadow-[0_0_0_1px_rgba(250,204,21,.15)]">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#fcd34d]">Result</p>
        <p className="mt-1 text-sm text-[#fde68a]">
          {totalOutcomes > 1 ? `${totalOutcomes} possible children` : "Current child outcome"}
        </p>
      </div>

      {child ? (
        <>
          <PalIcon pal={child} size={132} ringClass="border-[#facc15]/45" />
          <div className="mt-4">
            <h3 className="font-display text-2xl font-bold tracking-tight text-white">{child.name}</h3>
            <p className="mt-1 text-sm text-[#fef3c7]">
              {outcome ? getOutcomeDescription(outcome) : "Choose a valid parent pair to see the result"}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <RarityBadge rarity={child.rarity} />
            {child.elements.map((element) => (
              <ElementBadge key={`${child.id}-${element}`} element={element} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex min-h-[268px] items-center justify-center rounded-[22px] border border-dashed border-[#facc15]/25 bg-[#facc15]/6 px-6 text-sm text-[#fde68a]">
          Choose a valid parent pair to see the child result.
        </div>
      )}
    </div>
  );
}

function GenderPicker({
  value,
  onChange,
  accentClass,
}: {
  value: PalworldSelectionGender;
  onChange: (value: PalworldSelectionGender) => void;
  accentClass: string;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {genderOptions.map((option) => (
        <button
          key={option.id}
          type="button"
          data-active={value === option.id}
          onClick={() => onChange(option.id)}
          className={[
            "rounded-2xl border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted transition hover:border-white/20 hover:text-white",
            accentClass,
            value === option.id ? "text-white" : "",
          ].join(" ")}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function PalGridButton({
  pal,
  isSelected,
  onClick,
}: {
  pal: PalworldPal;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-[22px] border bg-[linear-gradient(180deg,rgba(16,30,49,.92),rgba(11,17,28,.98))] p-3 text-left transition",
        isSelected
          ? "border-[#38d9a9]/60 shadow-[0_0_0_1px_rgba(56,217,169,.18)]"
          : "border-white/10 hover:border-white/20 hover:bg-white/[0.04]",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start gap-2">
        <span className="min-w-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-2">
          {pal.number ? `No. ${pal.number}` : "Special"}
        </span>
        <RarityBadge rarity={pal.rarity} compact />
      </div>

      <div className="mt-3 flex justify-center">
        <PalIcon pal={pal} size={88} ringClass={isSelected ? "border-[#38d9a9]/45" : "border-white/15"} />
      </div>

      <div className="mt-3">
        <h3 className="font-semibold text-white">{pal.name}</h3>
        <p className="mt-1 text-xs text-muted">{pal.elements.join(" / ")}</p>
      </div>
    </button>
  );
}

function OutcomeCard({ outcome }: { outcome: PalworldBreedingOutcome }) {
  const child = palworldPalMap.get(outcome.childId);
  const parentA = palworldPalMap.get(outcome.parentAId);
  const parentB = palworldPalMap.get(outcome.parentBId);

  if (!child || !parentA || !parentB) return null;

  return (
    <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,21,34,.96),rgba(11,14,24,.98))] p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <PalIcon pal={parentA} size={54} ringClass="border-[#67e8f9]/25" />
          <span className="text-2xl text-muted">+</span>
          <PalIcon pal={parentB} size={54} ringClass="border-[#6c63ff]/25" />
          <span className="text-2xl text-muted">=</span>
          <PalIcon pal={child} size={64} ringClass="border-[#facc15]/35" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className={getMethodBadgeClass(outcome.method)}>{getOutcomeDescription(outcome)}</span>
            <RarityBadge rarity={child.rarity} compact />
          </div>
          <h3 className="mt-2 text-center font-display text-xl font-bold text-foreground">{child.name}</h3>
          <p className="mt-1 text-center text-sm text-muted">
            {parentA.name} + {parentB.name}
          </p>
          <div className="mt-3 grid gap-2 text-sm text-muted">
            <MetaRow label="Average breeding power" value={formatAveragePower(outcome.averagePower)} />
            <MetaRow label="Gender requirement" value={getRequirementText(outcome, parentA, parentB)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CombinationRow({
  combo,
  child,
}: {
  combo: PalworldBreedingOutcome;
  child: PalworldPal;
}) {
  const parentA = palworldPalMap.get(combo.parentAId);
  const parentB = palworldPalMap.get(combo.parentBId);

  if (!parentA || !parentB) return null;

  return (
    <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,21,34,.96),rgba(10,13,22,.98))] p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="flex flex-wrap items-center justify-center gap-3 xl:justify-start">
          <PalIcon pal={parentA} size={62} ringClass="border-[#67e8f9]/25" />
          <span className="text-2xl text-muted">+</span>
          <PalIcon pal={parentB} size={62} ringClass="border-[#6c63ff]/25" />
          <span className="text-2xl text-muted">=</span>
          <PalIcon pal={child} size={68} ringClass="border-[#facc15]/35" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-center gap-2 xl:justify-start">
            <span className={getMethodBadgeClass(combo.method)}>{getOutcomeDescription(combo)}</span>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-muted">
              {formatAveragePower(combo.averagePower)}
            </span>
          </div>

          <h3 className="mt-2 text-center font-display text-xl font-bold text-foreground xl:text-left">
            {parentA.name} + {parentB.name}
          </h3>
          <p className="mt-1 text-center text-sm text-muted xl:text-left">{getRequirementText(combo, parentA, parentB)}</p>

          <div className="mt-3 flex flex-wrap justify-center gap-2 xl:justify-start">
            {parentA.elements.map((element) => (
              <ElementBadge key={`${combo.parentAId}-${element}`} element={element} />
            ))}
            {parentB.elements.map((element) => (
              <ElementBadge key={`${combo.parentBId}-${element}`} element={element} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultPanel({
  title,
  subtitle,
  children,
  contentClassName,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-white/10 bg-surface-2/70 p-4">
      <div className="border-b border-white/10 pb-4">
        <h3 className="font-display text-xl font-bold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </div>
      <div className={["mt-4", contentClassName ?? ""].join(" ").trim()}>{children}</div>
    </section>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.02] px-5 py-6 text-center">
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: "warning";
  children: ReactNode;
}) {
  const className =
    tone === "warning"
      ? "border-[#f59e0b]/25 bg-[#f59e0b]/10 text-[#fde68a]"
      : "border-white/10 bg-white/[0.04] text-white";

  return <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${className}`}>{children}</div>;
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] leading-4 text-muted-2">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function SmallStatCard({
  label,
  value,
  accentClass,
}: {
  label: string;
  value: string;
  accentClass: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] leading-4 text-muted-2">{label}</p>
      <p className={`mt-1 text-lg font-bold ${accentClass}`}>{value}</p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] leading-4 text-muted-2">{label}</p>
      <p className="mt-1 text-sm leading-6 text-white">{value}</p>
    </div>
  );
}

function RarityBadge({ rarity, compact = false }: { rarity: number; compact?: boolean }) {
  const label = getPalworldRarityLabel(rarity);

  return (
    <span
      className={[
        "rounded-full border px-2.5 py-1 font-semibold uppercase tracking-[0.1em]",
        compact ? "text-[10px]" : "text-[11px]",
        getRarityBadgeClass(label),
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function ElementBadge({ element }: { element: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#cfe8ff]">
      {element}
    </span>
  );
}

function PalIcon({
  pal,
  size,
  ringClass,
}: {
  pal: PalworldPal;
  size: number;
  ringClass: string;
}) {
  const imageUrl = getPalworldImageUrl(pal.bpClass);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showFallback = !imageUrl || failedSrc === imageUrl;

  const dimensionStyle = { width: size, height: size };

  return (
    <div
      className={[
        "relative overflow-hidden rounded-full border bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,.22),transparent_34%),linear-gradient(180deg,rgba(32,49,78,.95),rgba(10,15,27,.98))]",
        ringClass,
      ].join(" ")}
      style={dimensionStyle}
    >
      {!showFallback && imageUrl ? (
        <Image
          key={imageUrl}
          src={imageUrl}
          alt={pal.name}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          unoptimized
          onError={() => setFailedSrc(imageUrl)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(103,232,249,.28),transparent_50%),linear-gradient(180deg,rgba(24,37,60,.95),rgba(12,17,28,.98))]">
          <span className="font-display text-[32px] font-bold text-white">{pal.name.slice(0, 1)}</span>
        </div>
      )}
    </div>
  );
}

function getPalDescriptor(pal: PalworldPal) {
  const numberLabel = pal.number ? `No. ${pal.number}` : "Special";
  return `${numberLabel} | ${pal.elements.join(" / ")}`;
}

function getOutcomeDescription(outcome: PalworldBreedingOutcome) {
  if (outcome.method === "special") return "Special combo result";
  if (outcome.method === "same-species") return "Same-species result";
  return "Breeding power result";
}

function formatAveragePower(averagePower: number | null) {
  return averagePower === null ? "Not used" : averagePower.toString();
}

function getRequirementText(
  outcome: PalworldBreedingOutcome,
  parentA: PalworldPal,
  parentB: PalworldPal,
) {
  const requiredA = outcome.requiredParentAGender;
  const requiredB = outcome.requiredParentBGender;

  if (!requiredA && !requiredB) return "Any valid parent genders";
  if (requiredA && requiredB) {
    return `${capitalize(requiredA)} ${parentA.name} + ${capitalize(requiredB)} ${parentB.name}`;
  }
  if (requiredA) return `${parentA.name} must be ${requiredA}`;
  if (requiredB) return `${parentB.name} must be ${requiredB}`;
  return "Any valid parent genders";
}

function capitalize(value: PalworldGender) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getMethodBadgeClass(method: PalworldBreedingOutcome["method"]) {
  if (method === "special") {
    return "rounded-full border border-[#67e8f9]/25 bg-[#67e8f9]/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-[#a5f3fc]";
  }
  if (method === "same-species") {
    return "rounded-full border border-[#a78bfa]/25 bg-[#a78bfa]/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-[#ddd6fe]";
  }
  return "rounded-full border border-[#38d9a9]/25 bg-[#38d9a9]/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-[#bbf7d0]";
}

function getRarityBadgeClass(label: string) {
  if (label === "Legendary") return "border-[#f59e0b]/30 bg-[#f59e0b]/12 text-[#fde68a]";
  if (label === "Epic") return "border-[#c084fc]/30 bg-[#c084fc]/12 text-[#e9d5ff]";
  if (label === "Rare") return "border-[#60a5fa]/30 bg-[#60a5fa]/12 text-[#dbeafe]";
  return "border-white/14 bg-white/[0.04] text-[#e5e7eb]";
}
