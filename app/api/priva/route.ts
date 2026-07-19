import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Ignore TLS/SSL check errors in local dev/proxy environments
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const CLIENT_ID = process.env.PRIVA_CLIENT_ID || "9b281dc9-967b-4c66-afde-62d2c85c7844";
const CLIENT_SECRET = process.env.PRIVA_CLIENT_SECRET;
const SITE_ID = "e6de5be9-33c8-46df-bc71-bbc8d796185b";
const CACHE_PATH = path.resolve(process.cwd(), "scratch", "priva-datapoints-cache.json");

// In-memory token cache
let cachedToken: string | null = null;
let cachedTokenExpiry: number = 0;

// Simple in-memory cache helper for Priva POST requests
interface PrivaCacheEntry {
  data: any;
  expiry: number;
}
const privaDataCache = new Map<string, PrivaCacheEntry>();

function getFromPrivaCache(key: string): any | null {
  const entry = privaDataCache.get(key);
  if (entry && Date.now() < entry.expiry) {
    return entry.data;
  }
  return null;
}

function setToPrivaCache(key: string, data: any, ttlSeconds: number) {
  privaDataCache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000
  });
}

async function getPrivaToken(forceFresh = false): Promise<string> {
  // If token is still valid and we are not forcing a fresh one, return it
  if (!forceFresh && cachedToken && Date.now() < cachedTokenExpiry) {
    return cachedToken as string;
  }

  if (!CLIENT_SECRET) {
    throw new Error("PRIVA_CLIENT_SECRET is not configured in .env.local");
  }

  const tokenUrl = "https://auth.priva.com/connect/token";
  const bodyParams = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: "priva.priva-one priva.access-api priva.historical-data-platform priva.horticulture-services priva.mds-administrator priva.asset-management priva.charts-service"
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: bodyParams.toString()
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Token request failed: ${res.status} ${errorText}`);
  }

  const tokenData = await res.json();
  cachedToken = tokenData.access_token;
  // Expire token slightly earlier (e.g. 5 minutes before actual expiry)
  const expiresIn = tokenData.expires_in || 3600;
  cachedTokenExpiry = Date.now() + (expiresIn - 300) * 1000;

  return cachedToken as string;
}

// Wrapper fetch utility that clears cache and retries once on 401/403 errors
async function fetchPrivaWithRetry(url: string, options: any): Promise<Response> {
  let res = await fetch(url, options);

  // If unauthorized or forbidden, token might be invalid/expired on the server side
  if ((res.status === 401 || res.status === 403) && cachedToken) {
    console.warn(`Priva API returned status ${res.status}. Clearing token cache and retrying...`);
    cachedToken = null;
    cachedTokenExpiry = 0;

    const freshToken = await getPrivaToken(true);
    options.headers["Authorization"] = `Bearer ${freshToken}`;

    res = await fetch(url, options);
  }

  return res;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action") || "datapoints";

    if (action === "datapoints") {
      // 1. Check local file cache first
      try {
        if (fs.existsSync(CACHE_PATH)) {
          const stats = fs.statSync(CACHE_PATH);
          // If cache is less than 24 hours old, use it
          if (Date.now() - stats.mtimeMs < 24 * 3600 * 1000) {
            const cachedContent = fs.readFileSync(CACHE_PATH, "utf8");
            return NextResponse.json(JSON.parse(cachedContent));
          }
        }
      } catch (cacheErr) {
        console.warn("Failed to read datapoints cache file, falling back to API:", cacheErr);
      }

      // 2. Fallback to querying API
      const token = await getPrivaToken();
      const startTime = searchParams.get("startTime") || new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();
      
      const yesterdayMidnight = new Date();
      yesterdayMidnight.setHours(0, 0, 0, 0);
      const endTime = searchParams.get("endTime") || yesterdayMidnight.toISOString();

      const url = `https://horti-api.priva.com/api/sites/${SITE_ID}/datapoints?startTime=${startTime}&endTime=${endTime}`;
      const res = await fetchPrivaWithRetry(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-api-version": "2.0"
        }
      });

      if (!res.ok) {
        const errText = await res.text();
        // Serve stale cache on error if available
        if (fs.existsSync(CACHE_PATH)) {
          console.warn("API request failed, serving stale cache file.");
          const cachedContent = fs.readFileSync(CACHE_PATH, "utf8");
          return NextResponse.json(JSON.parse(cachedContent));
        }
        return NextResponse.json({ error: `Priva API returned status ${res.status}`, details: errText }, { status: res.status });
      }

      const data = await res.json();
      
      // Save to cache file asynchronously
      try {
        const dir = path.dirname(CACHE_PATH);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2), "utf8");
      } catch (writeErr) {
        console.error("Failed to write datapoints cache file:", writeErr);
      }

      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Priva Proxy GET Error:", error);
    return NextResponse.json({ error: "Priva API GET Request failed", details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getPrivaToken();
    const body = await request.json();

    // Default dates if missing
    if (!body.startTime || !body.endTime) {
      const yesterdayMidnight = new Date();
      yesterdayMidnight.setHours(0, 0, 0, 0);
      
      body.startTime = body.startTime || new Date(yesterdayMidnight.getTime() - 24 * 3600 * 1000).toISOString();
      body.endTime = body.endTime || yesterdayMidnight.toISOString();
    }

    const cacheKey = JSON.stringify(body);
    const cachedData = getFromPrivaCache(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const url = `https://horti-api.priva.com/api/sites/${SITE_ID}/data`;
    const res = await fetchPrivaWithRetry(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-api-version": "2.0",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Priva API returned status ${res.status}`, details: errText }, { status: res.status });
    }

    const data = await res.json();
    setToPrivaCache(cacheKey, data, 300); // 5 minutes cache
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Priva Proxy POST Error:", error);
    return NextResponse.json({ error: "Priva API POST Request failed", details: error.message }, { status: 500 });
  }
}
