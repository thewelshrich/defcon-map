import type { ConflictEventCategory } from "../../../src/domain/events";

const civilianActorKeywords = [
  "HOSPITAL",
  "SCHOOL",
  "REFUGEE",
  "HUMANITARIAN",
  "CIVILIAN",
  "MOSQUE",
  "CHURCH",
  "MARKET",
  "RESIDENTIAL"
];

const civilianUrlKeywords = [
  "hospital",
  "school",
  "refugee",
  "humanitarian",
  "civilian-casualties",
  "residential"
];

function hasUppercaseKeyword(value: string | null, keywords: string[]) {
  if (!value) {
    return false;
  }

  const normalized = value.toUpperCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

function hasLowercaseKeyword(value: string | null, keywords: string[]) {
  if (!value) {
    return false;
  }

  const normalized = value.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

export function detectCivilianImpact(args: {
  category: ConflictEventCategory;
  actor1Name: string | null;
  actor2Name: string | null;
  sourceUrl: string | null;
}) {
  const { category, actor1Name, actor2Name, sourceUrl } = args;

  if (category === "civilian") {
    return true;
  }

  if (hasUppercaseKeyword(actor1Name, civilianActorKeywords) || hasUppercaseKeyword(actor2Name, civilianActorKeywords)) {
    return true;
  }

  return hasLowercaseKeyword(sourceUrl, civilianUrlKeywords);
}
