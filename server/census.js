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

export async function updateCucmLine(pattern, routePartition, fields) {
  const url = new URL(`/api/cucm/lines/${encodeURIComponent(pattern)}`, CENSUS_URL);
  if (routePartition) url.searchParams.set("route_partition", routePartition);

  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Census הגיב עם שגיאה (${response.status}): ${detail}`);
  }
  return response.json();
}
