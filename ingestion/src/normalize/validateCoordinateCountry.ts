import type { Feature, Geometry } from "geojson";

import { worldCountries } from "../../../src/data/geometry/world";

type BoundingBox = {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
};

const BORDER_BUFFER_DEGREES = 0.75;

function updateBoundingBox(current: BoundingBox | null, longitude: number, latitude: number): BoundingBox {
  if (!current) {
    return {
      minLat: latitude,
      maxLat: latitude,
      minLon: longitude,
      maxLon: longitude
    };
  }

  return {
    minLat: Math.min(current.minLat, latitude),
    maxLat: Math.max(current.maxLat, latitude),
    minLon: Math.min(current.minLon, longitude),
    maxLon: Math.max(current.maxLon, longitude)
  };
}

function walkCoordinates(node: unknown, current: BoundingBox | null): BoundingBox | null {
  if (!Array.isArray(node)) {
    return current;
  }

  if (
    node.length >= 2 &&
    typeof node[0] === "number" &&
    typeof node[1] === "number" &&
    Number.isFinite(node[0]) &&
    Number.isFinite(node[1])
  ) {
    return updateBoundingBox(current, node[0], node[1]);
  }

  let next = current;

  for (const child of node) {
    next = walkCoordinates(child, next);
  }

  return next;
}

function extractFeatureBoundingBox(feature: Feature<Geometry>): BoundingBox | null {
  return walkCoordinates(feature.geometry?.coordinates, null);
}

function expandBoundingBox(box: BoundingBox): BoundingBox {
  return {
    minLat: box.minLat - BORDER_BUFFER_DEGREES,
    maxLat: box.maxLat + BORDER_BUFFER_DEGREES,
    minLon: box.minLon - BORDER_BUFFER_DEGREES,
    maxLon: box.maxLon + BORDER_BUFFER_DEGREES
  };
}

const boundingBoxByCountry = new Map<string, BoundingBox>();

for (const feature of worldCountries.features) {
  const code = feature.properties?.code;

  if (!code) {
    continue;
  }

  const bounds = extractFeatureBoundingBox(feature);

  if (!bounds) {
    continue;
  }

  const existing = boundingBoxByCountry.get(code);

  if (!existing) {
    boundingBoxByCountry.set(code, bounds);
    continue;
  }

  boundingBoxByCountry.set(code, {
    minLat: Math.min(existing.minLat, bounds.minLat),
    maxLat: Math.max(existing.maxLat, bounds.maxLat),
    minLon: Math.min(existing.minLon, bounds.minLon),
    maxLon: Math.max(existing.maxLon, bounds.maxLon)
  });
}

export function validateCoordinateCountry(args: { countryCode: string; latitude: number; longitude: number }) {
  const { countryCode, latitude, longitude } = args;
  const bounds = boundingBoxByCountry.get(countryCode);

  if (!bounds) {
    return true;
  }

  const expanded = expandBoundingBox(bounds);
  return (
    latitude >= expanded.minLat &&
    latitude <= expanded.maxLat &&
    longitude >= expanded.minLon &&
    longitude <= expanded.maxLon
  );
}
