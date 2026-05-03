import {
  palworldPals,
  palworldSpecialCombos,
  type PalworldGender,
  type PalworldPal,
  type PalworldSpecialCombo,
} from "@/lib/palworld-breeding-data";

export type PalworldSelectionGender = "any" | PalworldGender;

export type PalworldBreedingMethod = "same-species" | "special" | "regular";

export type PalworldBreedingOutcome = {
  childId: string;
  method: PalworldBreedingMethod;
  averagePower: number | null;
  parentAId: string;
  parentBId: string;
  parentAGender: PalworldSelectionGender;
  parentBGender: PalworldSelectionGender;
  requiredParentAGender: PalworldGender | null;
  requiredParentBGender: PalworldGender | null;
};

const methodPriority: Record<PalworldBreedingMethod, number> = {
  special: 0,
  "same-species": 1,
  regular: 2,
};

export const palworldPalMap = new Map<string, PalworldPal>(
  palworldPals.map((pal) => [pal.id, pal]),
);

export const selectablePalworldParents = palworldPals
  .filter((pal) => !pal.isBoss && pal.breedingPower > 0 && pal.name)
  .sort((left, right) => left.order - right.order);

export const regularEligiblePalworldChildren = palworldPals
  .filter((pal) => pal.regularEligible)
  .sort((left, right) => left.order - right.order);

const palworldSpecialComboMap = new Map<string, PalworldSpecialCombo[]>();

for (const combo of palworldSpecialCombos) {
  const key = getPairKey(combo.parentAId, combo.parentBId);
  const bucket = palworldSpecialComboMap.get(key);

  if (bucket) {
    bucket.push(combo);
  } else {
    palworldSpecialComboMap.set(key, [combo]);
  }
}

function getPairKey(parentAId: string, parentBId: string) {
  return parentAId.localeCompare(parentBId) <= 0
    ? `${parentAId}::${parentBId}`
    : `${parentBId}::${parentAId}`;
}

function normalizePair(
  parentAId: string,
  parentAGender: PalworldSelectionGender,
  parentBId: string,
  parentBGender: PalworldSelectionGender,
) {
  if (parentAId.localeCompare(parentBId) <= 0) {
    return { parentAId, parentAGender, parentBId, parentBGender };
  }

  return {
    parentAId: parentBId,
    parentAGender: parentBGender,
    parentBId: parentAId,
    parentBGender: parentAGender,
  };
}

function matchesSelectedGender(
  requiredGender: PalworldGender | null,
  selectedGender: PalworldSelectionGender,
) {
  if (requiredGender === null) return true;
  if (selectedGender === "any") return true;
  return requiredGender === selectedGender;
}

function findNearestRegularChild(averagePower: number) {
  let bestMatch = regularEligiblePalworldChildren[0];
  let bestDistance = Math.abs(bestMatch.breedingPower - averagePower);

  for (let index = 1; index < regularEligiblePalworldChildren.length; index += 1) {
    const candidate = regularEligiblePalworldChildren[index];
    const distance = Math.abs(candidate.breedingPower - averagePower);

    if (distance < bestDistance) {
      bestMatch = candidate;
      bestDistance = distance;
    }
  }

  return bestMatch;
}

export function isValidBreedingGenderPair(
  parentAGender: PalworldSelectionGender,
  parentBGender: PalworldSelectionGender,
) {
  return (
    parentAGender === "any" ||
    parentBGender === "any" ||
    parentAGender !== parentBGender
  );
}

export function getPalworldRarityLabel(rarity: number) {
  if (rarity >= 20) return "Legendary";
  if (rarity >= 8) return "Epic";
  if (rarity >= 5) return "Rare";
  return "Common";
}

export function findPalworldBreedingOutcomes(
  parentAId: string | null,
  parentBId: string | null,
  parentAGender: PalworldSelectionGender = "any",
  parentBGender: PalworldSelectionGender = "any",
): PalworldBreedingOutcome[] {
  if (!parentAId || !parentBId) return [];
  if (!isValidBreedingGenderPair(parentAGender, parentBGender)) return [];

  const parentA = palworldPalMap.get(parentAId);
  const parentB = palworldPalMap.get(parentBId);

  if (!parentA || !parentB) return [];

  if (parentA.id === parentB.id) {
    return [
      {
        childId: parentA.id,
        method: "same-species" as const,
        averagePower: parentA.breedingPower,
        parentAId: parentA.id,
        parentBId: parentB.id,
        parentAGender,
        parentBGender,
        requiredParentAGender: null,
        requiredParentBGender: null,
      },
    ];
  }

  const normalized = normalizePair(parentA.id, parentAGender, parentB.id, parentBGender);
  const specialMatches =
    palworldSpecialComboMap
      .get(getPairKey(parentA.id, parentB.id))
      ?.filter(
        (combo) =>
          matchesSelectedGender(combo.parentAGender, normalized.parentAGender) &&
          matchesSelectedGender(combo.parentBGender, normalized.parentBGender),
      ) ?? [];

  if (specialMatches.length) {
    return specialMatches.map((combo) => ({
      childId: combo.childId,
      method: "special" as const,
      averagePower: Math.floor((parentA.breedingPower + parentB.breedingPower + 1) / 2),
      parentAId: parentA.id,
      parentBId: parentB.id,
      parentAGender,
      parentBGender,
      requiredParentAGender:
        normalized.parentAId === parentA.id
          ? combo.parentAGender
          : combo.parentBGender,
      requiredParentBGender:
        normalized.parentAId === parentA.id
          ? combo.parentBGender
          : combo.parentAGender,
    }));
  }

  const averagePower = Math.floor((parentA.breedingPower + parentB.breedingPower + 1) / 2);
  const child = findNearestRegularChild(averagePower);

  return [
    {
      childId: child.id,
      method: "regular" as const,
      averagePower,
      parentAId: parentA.id,
      parentBId: parentB.id,
      parentAGender,
      parentBGender,
      requiredParentAGender: null,
      requiredParentBGender: null,
    },
  ];
}

export const allPalworldBreedingCombinations: PalworldBreedingOutcome[] = [];

for (let parentAIndex = 0; parentAIndex < selectablePalworldParents.length; parentAIndex += 1) {
  for (let parentBIndex = parentAIndex; parentBIndex < selectablePalworldParents.length; parentBIndex += 1) {
    const parentA = selectablePalworldParents[parentAIndex];
    const parentB = selectablePalworldParents[parentBIndex];

    allPalworldBreedingCombinations.push(
      ...findPalworldBreedingOutcomes(parentA.id, parentB.id, "any", "any"),
    );
  }
}

allPalworldBreedingCombinations.sort((left, right) => {
  const childDiff =
    (palworldPalMap.get(left.childId)?.order ?? 0) -
    (palworldPalMap.get(right.childId)?.order ?? 0);
  if (childDiff !== 0) return childDiff;

  const methodDiff = methodPriority[left.method] - methodPriority[right.method];
  if (methodDiff !== 0) return methodDiff;

  const parentADiff =
    (palworldPalMap.get(left.parentAId)?.order ?? 0) -
    (palworldPalMap.get(right.parentAId)?.order ?? 0);
  if (parentADiff !== 0) return parentADiff;

  return (
    (palworldPalMap.get(left.parentBId)?.order ?? 0) -
    (palworldPalMap.get(right.parentBId)?.order ?? 0)
  );
});

export function findPalworldParentPairsForChild(childId: string | null) {
  if (!childId) return [] as PalworldBreedingOutcome[];

  return allPalworldBreedingCombinations.filter((combo) => combo.childId === childId);
}

export const palworldBreedingStats = {
  parentPool: selectablePalworldParents.length,
  regularEligibleChildren: regularEligiblePalworldChildren.length,
  totalSpecialCombos: palworldSpecialCombos.length,
  totalBreedingOutcomes: allPalworldBreedingCombinations.length,
};
