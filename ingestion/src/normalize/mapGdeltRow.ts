import type { ExtractedGdeltRow, NormalizedConflictCandidate } from "../types";
import { classifyEventScope } from "./classifyEventScope";
import { detectCivilianImpact } from "./detectCivilianImpact";
import { decidePlotVisibility } from "./decidePlotVisibility";
import { filterSourceQuality } from "./filterSourceQuality";
import { mapEventCategory } from "./mapEventCategory";
import { normalizeSourceUrl } from "./normalizeSourceUrl";
import { resolveGdeltGeography } from "./resolveGdeltGeography";
import { scoreConfidence } from "./scoreConfidence";
import { scoreSeverity } from "./scoreSeverity";
import { validateCoordinateCountry } from "./validateCoordinateCountry";
import { validateEventConsistency } from "./validateEventConsistency";

function isValidCoordinate(latitude: number | null, longitude: number | null) {
  return latitude != null && longitude != null && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

function parseSqlDate(sqlDate: string | number) {
  const normalizedSqlDate = String(sqlDate);

  if (!/^\d{8}$/.test(normalizedSqlDate)) {
    return null;
  }

  const year = normalizedSqlDate.slice(0, 4);
  const month = normalizedSqlDate.slice(4, 6);
  const day = normalizedSqlDate.slice(6, 8);

  return `${year}-${month}-${day}T00:00:00.000Z`;
}

function parseDateAdded(dateAdded: string | number | null) {
  if (dateAdded == null) {
    return null;
  }

  const normalizedDateAdded = String(dateAdded);

  if (!/^\d{14}$/.test(normalizedDateAdded)) {
    return null;
  }

  const year = normalizedDateAdded.slice(0, 4);
  const month = normalizedDateAdded.slice(4, 6);
  const day = normalizedDateAdded.slice(6, 8);
  const hours = normalizedDateAdded.slice(8, 10);
  const minutes = normalizedDateAdded.slice(10, 12);
  const seconds = normalizedDateAdded.slice(12, 14);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
}

function getLocationName(fullName: string | null) {
  if (!fullName) {
    return null;
  }

  return fullName.split(",")[0]?.trim() || null;
}

function buildDeterministicId(sourceEventId: string, dedupeKey: string) {
  return `gdelt:${sourceEventId}`;
}

function toThirtyMinuteBucket(occurredAt: string) {
  const date = new Date(occurredAt);
  const minutes = date.getUTCMinutes() < 30 ? 0 : 30;

  date.setUTCMinutes(minutes, 0, 0);
  return date.toISOString().slice(0, 16);
}

export function mapGdeltRow(row: ExtractedGdeltRow): NormalizedConflictCandidate | null {
  const category = mapEventCategory(row);

  if (!category) {
    return null;
  }

  if (!isValidCoordinate(row.ActionGeo_Lat, row.ActionGeo_Long)) {
    return null;
  }

  const geography = resolveGdeltGeography({
    actionGeoCountryCode: row.ActionGeo_CountryCode,
    actionGeoType: row.ActionGeo_Type
  });
  const occurredAt = parseDateAdded(row.DATEADDED) ?? parseSqlDate(row.SQLDATE);
  const locationName = getLocationName(row.ActionGeo_FullName);

  if (!geography || !occurredAt) {
    return null;
  }

  if (!validateEventConsistency({ countryCode: geography.countryCode, locationName })) {
    return null;
  }

  const mentionCount = Math.max(0, row.NumMentions ?? 0);
  const hasActorCountries = Boolean(row.Actor1CountryCode && row.Actor2CountryCode);
  const coordinatesMatchCountry = validateCoordinateCountry({
    countryCode: geography.countryCode,
    latitude: row.ActionGeo_Lat!,
    longitude: row.ActionGeo_Long!
  });
  const passesSourceQuality = filterSourceQuality(row.SOURCEURL);
  const confidence = scoreConfidence({
    hasValidGeo: true,
    hasValidCountry: true,
    coordinatesMatchCountry,
    hasActorCountries,
    mentionCount
  });
  const severity = scoreSeverity({
    category,
    mentionCount
  });
  const scope = classifyEventScope({
    sourceUrl: row.SOURCEURL,
    category,
    hasActorCountries,
    countryCode: geography.countryCode,
    actor1Name: row.Actor1Name,
    actor2Name: row.Actor2Name
  });
  const plotVisibility = decidePlotVisibility({
    scope,
    confidence,
    passesSourceQuality
  });
  const dedupeSourceUrl = normalizeSourceUrl(row.SOURCEURL) ?? String(row.GLOBALEVENTID);
  const dedupeKey = [
    dedupeSourceUrl,
    category,
    geography.countryCode,
    row.ActionGeo_Lat!.toFixed(2),
    row.ActionGeo_Long!.toFixed(2),
    toThirtyMinuteBucket(occurredAt)
  ].join("|");

  return {
    id: buildDeterministicId(String(row.GLOBALEVENTID), dedupeKey),
    occurredAt,
    countryCode: geography.countryCode,
    countryName: geography.countryName,
    locationName,
    actor1Name: row.Actor1Name,
    actor1CountryCode: row.Actor1CountryCode,
    actor2Name: row.Actor2Name,
    actor2CountryCode: row.Actor2CountryCode,
    latitude: row.ActionGeo_Lat!,
    longitude: row.ActionGeo_Long!,
    category,
    fatalities: null,
    civilianImpact: detectCivilianImpact({
      category,
      actor1Name: row.Actor1Name,
      actor2Name: row.Actor2Name,
      sourceUrl: row.SOURCEURL
    }),
    confidence,
    source: "gdelt",
    sourceUrl: row.SOURCEURL,
    sourceEventId: String(row.GLOBALEVENTID),
    severity,
    mentionCount,
    scope,
    plotVisibility,
    dedupeKey,
    rawCountryCode: geography.rawCountryCode,
    geoPrecision: geography.geoPrecision
  };
}
