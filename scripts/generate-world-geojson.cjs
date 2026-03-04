const fs = require("fs");
const path = require("path");
const { feature } = require("topojson-client");

const countriesTopology = require("world-atlas/countries-110m.json");
const countryRecords = require("world-countries");

const outputPath = path.resolve(__dirname, "../src/data/geometry/world-countries.geo.json");

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

const merged = {
  type: "FeatureCollection",
  features: extracted.features.map((country, index) => {
    const identifier = String(country.id ?? index);
    const metadata = metadataByNumericCode.get(identifier);

    return {
      type: "Feature",
      id: country.id ?? identifier,
      properties: {
        code: metadata ? metadata.code : identifier,
        name: metadata ? metadata.name : `Country ${identifier}`
      },
      geometry: country.geometry
    };
  })
};

fs.writeFileSync(outputPath, JSON.stringify(merged));
