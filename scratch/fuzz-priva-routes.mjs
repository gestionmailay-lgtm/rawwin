import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const clientId = process.env.PRIVA_CLIENT_ID;
const clientSecret = process.env.PRIVA_CLIENT_SECRET;
const siteId = "e6de5be9-33c8-46df-bc71-bbc8d796185b";

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
    
    // Paths to test
    const getPaths = [
      `/api/sites/${siteId}/measuring-points`,
      `/api/sites/${siteId}/measuringpoints`,
      `/api/sites/${siteId}/variables`,
      `/api/sites/${siteId}/data-points`,
      `/api/sites/${siteId}/datapoints`,
      `/api/sites/${siteId}/assets`,
      `/api/sites/${siteId}/devices`,
      `/api/sites/${siteId}/sensors`,
      `/api/sites/${siteId}/systems`,
      `/api/sites/${siteId}/points`,
      `/api/sites/${siteId}/tags`,
      `/api/sites/${siteId}/measures`,
      `/api/sites/${siteId}/telemetry`,
      `/api/sites/${siteId}/nodes`,
      `/api/sites/${siteId}/channels`,
      `/api/sites/${siteId}/properties`,
      `/api/sites/${siteId}/observations`
    ];

    const postPaths = [
      `/api/sites/${siteId}/data`,
      `/api/sites/${siteId}/historical-data`,
      `/api/sites/${siteId}/variables/data`,
      `/api/sites/${siteId}/telemetry/query`,
      `/api/sites/${siteId}/data-points/query`,
      `/api/sites/${siteId}/query`
    ];

    const apiVersions = ["2.0", "v1"];

    console.log("Fuzzing GET routes...");
    for (const p of getPaths) {
      for (const ver of apiVersions) {
        const url = `https://horti-api.priva.com${p}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-api-version': ver
          }
        });
        if (res.status !== 404) {
          console.log(`[GET] Path: ${p} (ver: ${ver}) -> Status: ${res.status}`);
          const text = await res.text();
          console.log(`  Response:`, text.substring(0, 300));
        }
      }
    }

    console.log("Fuzzing POST routes (with empty JSON body)...");
    for (const p of postPaths) {
      for (const ver of apiVersions) {
        const url = `https://horti-api.priva.com${p}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-api-version': ver,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });
        if (res.status !== 404) {
          console.log(`[POST] Path: ${p} (ver: ${ver}) -> Status: ${res.status}`);
          const text = await res.text();
          console.log(`  Response:`, text.substring(0, 300));
        }
      }
    }

  } catch (error) {
    console.error("Discovery failed:", error);
  }
}

run();
