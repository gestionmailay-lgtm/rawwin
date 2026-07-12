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

    const subpaths = [
      "metadata",
      "catalog",
      "definition",
      "definitions",
      "measures",
      "telemetry",
      "sensors",
      "meters",
      "inputs",
      "outputs",
      "channels",
      "datapoint-definitions",
      "measurements",
      "measure-points",
      "measurepoints",
      "variables/metadata",
      "datapoints/metadata"
    ];

    console.log("Fuzzing subpaths under site...");
    for (const sub of subpaths) {
      for (const ver of ["2.0", "v1"]) {
        const url = `https://horti-api.priva.com/api/sites/${siteId}/${sub}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-api-version': ver
          }
        });
        if (res.status !== 404) {
          console.log(`GET /api/sites/${siteId}/${sub} (ver: ${ver}) -> Status: ${res.status}`);
          const text = await res.text();
          console.log(`  Response:`, text.substring(0, 500));
        }
      }
    }

  } catch (error) {
    console.error("Test failed:", error);
  }
}

run();
