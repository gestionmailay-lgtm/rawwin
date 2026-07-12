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

    const payloads = [
      {
        name: "Format with datapoints",
        body: {
          startTime: "2026-07-09T00:00:00Z",
          endTime: "2026-07-11T00:00:00Z",
          datapoints: ["00000000-0000-0000-0000-000000000000"]
        }
      },
      {
        name: "Format with Datapoints (capitalized)",
        body: {
          startTime: "2026-07-09T00:00:00Z",
          endTime: "2026-07-11T00:00:00Z",
          Datapoints: ["00000000-0000-0000-0000-000000000000"]
        }
      }
    ];

    const url = `https://horti-api.priva.com/api/sites/${siteId}/data`;

    for (const p of payloads) {
      console.log(`\nTesting ${p.name}...`);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-version': '2.0',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(p.body)
      });
      console.log(`Status: ${res.status}`);
      const text = await res.text();
      console.log(`Response:`, text.substring(0, 500));
    }

  } catch (error) {
    console.error("Test failed:", error);
  }
}

run();
