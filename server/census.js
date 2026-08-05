const CENSUS_URL = process.env.CENSUS_URL || "http://localhost:8000";

export async function getCucmLinesByPattern(pattern) {
  const url = new URL("/api/cucm/lines", CENSUS_URL);
  if (pattern) url.searchParams.set("pattern", pattern);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Census הגיב עם שגיאה (${response.status})`);
  }
  return response.json();
}
