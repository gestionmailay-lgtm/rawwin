import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const clientId = process.env.PRIVA_CLIENT_ID;
const clientSecret = process.env.PRIVA_CLIENT_SECRET;
const siteId = "e6de5be9-33c8-46df-bc71-bbc8d796185b";
const cachePath = path.resolve(process.cwd(), "scratch", "priva-datapoints-cache.json");

async function run() {
  try {
    const tokenUrl = "https://auth.priva.com/connect/token";
    const bodyParams = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'priva.priva-one priva.access-api priva.historical-data-platform priva.horticulture-services priva.mds-administrator priva.asset-management priva.charts-service'
    });

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams.toString()
    });

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    const startTime = "2026-07-10T00:00:00Z";
    const endTime = "2026-07-11T23:00:00Z";
    const url = `https://horti-api.priva.com/api/sites/${siteId}/datapoints?startTime=${startTime}&endTime=${endTime}`;

    console.log("Fetching latest datapoints catalog to seed the cache...");
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-version': '2.0'
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API returned status ${res.status}: ${errText}`);
    }

    const data = await res.json();
    
    const dir = path.dirname(cachePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(cachePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`Successfully seeded the cache with ${data.datapoints?.length || 0} variables at ${cachePath}!`);

  } catch (error) {
    console.error("Failed to seed cache:", error.message);
  }
}

run();
