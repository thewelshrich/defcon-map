import type { ConflictEventCategory, EventScope } from "../../../src/domain/events";

const infrastructureKeywords = [
  "fire",
  "apartment-fire",
  "two-alarm",
  "wildfire",
  "earthquake",
  "flood",
  "landslide",
  "accident",
  "crash",
  "derail",
  "pipeline-leak",
  "power-outage"
];
const domesticKeywords = [
  "shooting",
  "murder",
  "robbery",
  "jail",
  "detainment",
  "police",
  "standoff",
  "arrest",
  "trial",
  "verdict",
  "prosecutor",
  "court",
  "sentenced",
  "homicide",
  "stabbing",
  "carjacking",
  "burglary",
  "drug",
  "overdose",
  "suspect",
  "fugitive",
  "deportation",
  "domestic-violence",
  "schoolgirl",
  "massacre",
  "lawmakers",
  "immigration",
  "news/local",
  "/local/"
];
const policyKeywords = [
  "appoint",
  "resign",
  "election",
  "vote",
  "parliament",
  "summit",
  "treaty",
  "sanction",
  "embargo",
  "diplomacy"
];
const domesticActorKeywords = ["PROSECUTOR", "EMPLOYER", "VILLAGE", "SCHOOL", "MEDIA", "POLICE"];
const policyActorKeywords = ["GOVERNMENT", "MINISTRY", "PARLIAMENT", "PRESIDENT", "SENATE", "CONGRESS"];

function hasActorKeyword(actorName: string | null, keywords: string[]) {
  if (!actorName) {
    return false;
  }

  const normalizedActorName = actorName.toUpperCase();
  return keywords.some((keyword) => normalizedActorName.includes(keyword));
}

export function classifyEventScope(args: {
  sourceUrl: string | null;
  category: ConflictEventCategory;
  hasActorCountries: boolean;
  countryCode: string;
  actor1Name: string | null;
  actor2Name: string | null;
}): EventScope {
  const { sourceUrl, category, hasActorCountries, countryCode: _countryCode, actor1Name, actor2Name } = args;
  const urlText = sourceUrl?.toLowerCase() ?? "";

  if (infrastructureKeywords.some((keyword) => urlText.includes(keyword))) {
    return "infrastructure";
  }

  if (policyKeywords.some((keyword) => urlText.includes(keyword))) {
    return "policy";
  }

  if (domesticKeywords.some((keyword) => urlText.includes(keyword))) {
    return "domestic";
  }

  if (!hasActorCountries) {
    if (hasActorKeyword(actor1Name, policyActorKeywords) || hasActorKeyword(actor2Name, policyActorKeywords)) {
      return "policy";
    }

    if (hasActorKeyword(actor1Name, domesticActorKeywords) || hasActorKeyword(actor2Name, domesticActorKeywords)) {
      return "domestic";
    }
  }

  if (category === "strategic" && !hasActorCountries) {
    return "policy";
  }

  if (!hasActorCountries) {
    return category === "explosion" || category === "battle" ? "domestic" : "policy";
  }

  return "geopolitical";
}
