import { worldCountries } from "../../data/geometry/world";

type Position = [number, number];

const centroidsByCountryCode = new Map<string, Position | null>();

function readGeometryCoordinates(geometry: GeoJSON.Geometry | null | undefined): unknown {
  if (!geometry) {
    return null;
  }

  if ("coordinates" in geometry) {
    return geometry.coordinates;
  }

  if ("geometries" in geometry) {
    return geometry.geometries.map((child) => readGeometryCoordinates(child));
  }

  return null;
}

function collectPositions(coordinates: unknown, positions: Position[]) {
  if (!Array.isArray(coordinates)) {
    return;
  }

  if (
    coordinates.length >= 2 &&
    typeof coordinates[0] === "number" &&
    typeof coordinates[1] === "number"
  ) {
    positions.push([coordinates[0], coordinates[1]]);
    return;
  }

  for (const value of coordinates) {
    collectPositions(value, positions);
  }
}

function computeCentroid(countryCode: string): Position | null {
  const feature = worldCountries.features.find((candidate) => candidate.properties?.code === countryCode);

  if (!feature?.geometry) {
    return null;
  }

  const positions: Position[] = [];
  collectPositions(readGeometryCoordinates(feature.geometry), positions);

  if (positions.length === 0) {
    return null;
  }

  let minLongitude = Number.POSITIVE_INFINITY;
  let maxLongitude = Number.NEGATIVE_INFINITY;
  let minLatitude = Number.POSITIVE_INFINITY;
  let maxLatitude = Number.NEGATIVE_INFINITY;

  for (const [longitude, latitude] of positions) {
    minLongitude = Math.min(minLongitude, longitude);
    maxLongitude = Math.max(maxLongitude, longitude);
    minLatitude = Math.min(minLatitude, latitude);
    maxLatitude = Math.max(maxLatitude, latitude);
  }

  return [(minLongitude + maxLongitude) / 2, (minLatitude + maxLatitude) / 2];
}

export function getCountryCentroid(countryCode: string): Position | null {
  if (!centroidsByCountryCode.has(countryCode)) {
    centroidsByCountryCode.set(countryCode, computeCentroid(countryCode));
  }

  return centroidsByCountryCode.get(countryCode) ?? null;
}
