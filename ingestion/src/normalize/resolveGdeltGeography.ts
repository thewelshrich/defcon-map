import { getCountryMetadata } from "../../../src/data/geometry/world";

const fipsToAlpha3: Record<string, string> = {
  AG: "DZA",
  AS: "AUS",
  BM: "MMR",
  CE: "LKA",
  CH: "CHN",
  DA: "DNK",
  EI: "IRL",
  GM: "DEU",
  IS: "ISR",
  IZ: "IRQ",
  JA: "JPN",
  KN: "PRK",
  KS: "KOR",
  LE: "LBN",
  MO: "MAR",
  MU: "OMN",
  NI: "NGA",
  RI: "SRB",
  RS: "RUS",
  SF: "ZAF",
  SU: "SDN",
  TU: "TUR",
  UK: "GBR",
  UP: "UKR",
  VM: "VNM",
  YM: "YEM"
};

const isoAlpha2ToAlpha3: Record<string, string> = {
  AE: "ARE",
  AF: "AFG",
  AR: "ARG",
  AT: "AUT",
  AU: "AUS",
  AZ: "AZE",
  BD: "BGD",
  BE: "BEL",
  BH: "BHR",
  BO: "BOL",
  BR: "BRA",
  BY: "BLR",
  CA: "CAN",
  CH: "CHE",
  CL: "CHL",
  CN: "CHN",
  CO: "COL",
  CY: "CYP",
  CZ: "CZE",
  DE: "DEU",
  DK: "DNK",
  DZ: "DZA",
  EC: "ECU",
  EG: "EGY",
  ES: "ESP",
  ET: "ETH",
  FI: "FIN",
  FR: "FRA",
  GB: "GBR",
  GE: "GEO",
  GR: "GRC",
  HK: "HKG",
  HR: "HRV",
  HU: "HUN",
  ID: "IDN",
  IE: "IRL",
  IL: "ISR",
  IN: "IND",
  IQ: "IRQ",
  IR: "IRN",
  IT: "ITA",
  JO: "JOR",
  JP: "JPN",
  KE: "KEN",
  KP: "PRK",
  KR: "KOR",
  KW: "KWT",
  KZ: "KAZ",
  LB: "LBN",
  LK: "LKA",
  LY: "LBY",
  MA: "MAR",
  MX: "MEX",
  MY: "MYS",
  NG: "NGA",
  NL: "NLD",
  NO: "NOR",
  NP: "NPL",
  NZ: "NZL",
  OM: "OMN",
  PA: "PAN",
  PE: "PER",
  PH: "PHL",
  PK: "PAK",
  PL: "POL",
  PS: "PSE",
  PT: "PRT",
  QA: "QAT",
  RO: "ROU",
  RS: "SRB",
  RU: "RUS",
  SA: "SAU",
  SD: "SDN",
  SE: "SWE",
  SG: "SGP",
  SI: "SVN",
  SK: "SVK",
  SY: "SYR",
  TH: "THA",
  TR: "TUR",
  TW: "TWN",
  UA: "UKR",
  US: "USA",
  UY: "URY",
  VE: "VEN",
  VN: "VNM",
  YE: "YEM",
  ZA: "ZAF"
};

function resolveAlpha3Country(code: string) {
  const normalizedCode = code.trim().toUpperCase();

  if (normalizedCode.length === 3) {
    return getCountryMetadata(normalizedCode);
  }

  if (normalizedCode.length === 2) {
    const alpha3Code = fipsToAlpha3[normalizedCode] ?? isoAlpha2ToAlpha3[normalizedCode];
    return alpha3Code ? getCountryMetadata(alpha3Code) : null;
  }

  return null;
}

function getGeoPrecision(actionGeoType: number | null): "country" | "subnational" | "city" | "unknown" {
  switch (actionGeoType) {
    case 1:
      return "country";
    case 2:
    case 3:
      return "subnational";
    case 4:
    case 5:
      return "city";
    default:
      return "unknown";
  }
}

export function resolveGdeltGeography(args: {
  actionGeoCountryCode: string | null;
  actionGeoType: number | null;
}) {
  const { actionGeoCountryCode, actionGeoType } = args;

  if (!actionGeoCountryCode) {
    return null;
  }

  const country = resolveAlpha3Country(actionGeoCountryCode);

  if (!country) {
    return null;
  }

  return {
    countryCode: country.code,
    countryName: country.name,
    geoPrecision: getGeoPrecision(actionGeoType),
    rawCountryCode: actionGeoCountryCode
  };
}
