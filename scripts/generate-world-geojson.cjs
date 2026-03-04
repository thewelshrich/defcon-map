const fs = require("fs");
const path = require("path");
const { feature } = require("topojson-client");

const countriesTopology = require("world-atlas/countries-110m.json");
const countryRecords = require("world-countries");

const outputPath = path.resolve(__dirname, "../src/data/geometry/world-countries.geo.json");

const EXCLUDED_CODES = new Set(["010"]); // Antarctica

const metadataByNumericCode = new Map();

for (const record of countryRecords) {
  if (!record.cca3 || !record.name || !record.name.common) {
    continue;
  }

  if (record.ccn3) {
    metadataByNumericCode.set(record.ccn3, {
      code: record.cca3,
      name: record.name.common
    });
  }
}

const extracted = feature(countriesTopology, countriesTopology.objects.countries);

if (!extracted || extracted.type !== "FeatureCollection" || !Array.isArray(extracted.features)) {
  throw new Error("World topology did not resolve to a feature collection");
}

/**
 * Detect whether a polygon ring crosses the antimeridian by checking
 * for consecutive longitude jumps greater than 180 degrees.
 */
function ringCrossesAntimeridian(ring) {
  for (let i = 0; i < ring.length - 1; i++) {
    if (Math.abs(ring[i + 1][0] - ring[i][0]) > 180) {
      return true;
    }
  }
  return false;
}

/**
 * Interpolate the latitude where a line segment crosses lon = +/-180.
 */
function interpolateCrossing(p1, p2) {
  const lon1 = p1[0];
  const lat1 = p1[1];
  const lon2 = p2[0];
  const lat2 = p2[1];

  const adjustedLon2 = lon2 > 0 ? lon2 - 360 : lon2 + 360;
  const t = (180 - Math.abs(lon1)) / (Math.abs(adjustedLon2 - lon1));
  const crossLat = lat1 + t * (lat2 - lat1);
  const crossLon = lon1 > 0 ? 180 : -180;

  return { crossLat, crossLon, side: lon1 > 0 ? "east" : "west" };
}

/**
 * Split a single polygon ring at the antimeridian into two rings:
 * one for the eastern hemisphere (+lon) and one for the western (-lon).
 */
function splitRingAtAntimeridian(ring) {
  const east = [];
  const west = [];

  for (let i = 0; i < ring.length; i++) {
    const pt = ring[i];
    const target = pt[0] >= 0 ? east : west;
    target.push(pt);

    if (i < ring.length - 1) {
      const next = ring[i + 1];
      if (Math.abs(next[0] - pt[0]) > 180) {
        const { crossLat, side } = interpolateCrossing(pt, next);

        if (side === "east") {
          east.push([180, crossLat]);
          west.push([-180, crossLat]);
        } else {
          west.push([-180, crossLat]);
          east.push([180, crossLat]);
        }
      }
    }
  }

  const result = [];
  if (east.length >= 4) {
    if (east[0][0] !== east[east.length - 1][0] || east[0][1] !== east[east.length - 1][1]) {
      east.push(east[0]);
    }
    result.push(east);
  }
  if (west.length >= 4) {
    if (west[0][0] !== west[west.length - 1][0] || west[0][1] !== west[west.length - 1][1]) {
      west.push(west[0]);
    }
    result.push(west);
  }
  return result;
}

/**
 * Process a single polygon (array of rings where [0] is outer ring).
 * Returns one or more polygons after splitting at the antimeridian.
 */
function splitPolygonAtAntimeridian(polygon) {
  const outerRing = polygon[0];

  if (!ringCrossesAntimeridian(outerRing)) {
    return [polygon];
  }

  const splitRings = splitRingAtAntimeridian(outerRing);
  return splitRings.map((ring) => [ring]);
}

/**
 * Process a feature's geometry, splitting any antimeridian-crossing polygons.
 */
function fixAntimeridian(geometry) {
  if (geometry.type === "Polygon") {
    const split = splitPolygonAtAntimeridian(geometry.coordinates);
    if (split.length === 1) {
      return { type: "Polygon", coordinates: split[0] };
    }
    return { type: "MultiPolygon", coordinates: split };
  }

  if (geometry.type === "MultiPolygon") {
    const allPolygons = [];
    for (const polygon of geometry.coordinates) {
      allPolygons.push(...splitPolygonAtAntimeridian(polygon));
    }
    return { type: "MultiPolygon", coordinates: allPolygons };
  }

  return geometry;
}

const merged = {
  type: "FeatureCollection",
  features: extracted.features
    .filter((country) => !EXCLUDED_CODES.has(String(country.id)))
    .map((country, index) => {
      const identifier = String(country.id ?? index);
      const metadata = metadataByNumericCode.get(identifier);

      return {
        type: "Feature",
        id: country.id ?? identifier,
        properties: {
          code: metadata ? metadata.code : identifier,
          name: metadata ? metadata.name : `Country ${identifier}`
        },
        geometry: fixAntimeridian(country.geometry)
      };
    })
};

fs.writeFileSync(outputPath, JSON.stringify(merged));

const total = merged.features.length;
const fixed = merged.features.filter(
  (f) => f.geometry.type === "MultiPolygon" && f.geometry.coordinates.length > 1
).length;
console.log(`Wrote ${total} countries to ${outputPath}`);
console.log(`Split antimeridian-crossing polygons for ${fixed} features, excluded Antarctica`);
