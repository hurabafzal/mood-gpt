// lib/email-validation.ts


const API_KEY = process.env.KICKBOX_API_KEY!;
const ENDPOINT = "https://api.kickbox.com/v2/verify";
const TIMEOUT_MS = 8_000; // ← 8 seconds

export interface KickboxResult {
  result: "deliverable" | "undeliverable" | "risky" | "unknown";
  reason: string;
  sendex: number;
}

export async function kickboxVerify(email: string): Promise<KickboxResult> {
  const url = `${ENDPOINT}?email=${encodeURIComponent(email)}&apikey=${API_KEY}`;
  // const res = await fetch(url, { cache: "force-cache" }); // Kickbox caches for you

   // --- timeout helper ------------------------------------------------------
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  // -------------------------------------------------------------------------

  let res: Response;
  try {
    res = await fetch(url, { cache: "force-cache", signal: controller.signal });
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("timeout");        // let the route know it was a timeout
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    throw new Error(`Kickbox HTTP ${res.status}`);
  }
  return (await res.json()) as KickboxResult;
}
