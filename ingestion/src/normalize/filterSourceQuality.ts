const blockedDomains = new Set([
  "popdust.com",
  "usmagazine.com",
  "tmz.com",
  "eonline.com",
  "pagesix.com",
  "people.com",
  "buzzfeed.com",
  "cosmopolitan.com",
  "vogue.com",
  "espn.com",
  "bleacherreport.com"
]);
const blockedKeywords = [
  "beard",
  "softening",
  "healthier-beards",
  "celebrity-news",
  "woolworths",
  "menstrual",
  "tampons",
  "pads",
  "burka",
  "entertainment",
  "sports",
  "recipe",
  "fashion",
  "horoscope",
  "gossip",
  "beauty",
  "fitness",
  "dating",
  "reality-tv",
  "box-office",
  "album",
  "concert",
  "nfl",
  "nba",
  "premier-league",
  "celebrity"
];
const blockedPathSegments = ["/entertainment/", "/lifestyle/", "/sports/", "/celebrity/"];

export function filterSourceQuality(sourceUrl: string | null) {
  if (!sourceUrl) {
    return false;
  }

  try {
    const url = new URL(sourceUrl);
    const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
    const path = url.pathname.toLowerCase();

    if (blockedDomains.has(hostname)) {
      return false;
    }

    if (blockedPathSegments.some((segment) => path.includes(segment))) {
      return false;
    }

    return !blockedKeywords.some((keyword) => path.includes(keyword));
  } catch {
    return false;
  }
}
