export function normalizeSourceUrl(sourceUrl: string | null) {
  if (!sourceUrl) {
    return null;
  }

  try {
    const url = new URL(sourceUrl);
    return `${url.origin}${url.pathname}`.replace(/\/+$/, "");
  } catch {
    return sourceUrl.trim() || null;
  }
}
