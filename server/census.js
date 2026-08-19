const CENSUS_URL = process.env.CENSUS_URL || "http://localhost:8000";
const CENSUS_TIMEOUT_MS = 8000;

async function censusFetch(path, { searchParams, ...init } = {}) {
  const url = new URL(path, CENSUS_URL);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, value);
    }
  }

  let response;
  try {
    response = await fetch(url, { ...init, signal: AbortSignal.timeout(CENSUS_TIMEOUT_MS) });
  } catch (err) {
    throw new Error(err.name === "TimeoutError" ? "Census לא הגיב בזמן" : `לא ניתן להתחבר ל-Census: ${err.message}`);
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    const error = new Error(`Census הגיב עם שגיאה (${response.status})${detail ? `: ${detail}` : ""}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export async function getCucmLinesByPattern(pattern) {
  return censusFetch("/api/cucm/lines", { searchParams: { pattern } });
}

export async function updateCucmLine(pattern, routePartition, fields) {
  return censusFetch(`/api/cucm/lines/${encodeURIComponent(pattern)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
    searchParams: { route_partition: routePartition },
  });
}

export async function getCucmLineDevices(pattern) {
  return censusFetch(`/api/cucm/lines/${encodeURIComponent(pattern)}/devices`);
}

export async function getCucmPhone(name) {
  return censusFetch(`/api/cucm/phones/${encodeURIComponent(name)}`);
}

export async function addCucmPhoneSpeedDial(name, { number, label, index }) {
  return censusFetch(`/api/cucm/phones/${encodeURIComponent(name)}/speeddials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ number, label, index }),
  });
}

export async function removeCucmPhoneSpeedDial(name, index) {
  return censusFetch(
    `/api/cucm/phones/${encodeURIComponent(name)}/speeddials/${encodeURIComponent(index)}`,
    { method: "DELETE" }
  );
}
