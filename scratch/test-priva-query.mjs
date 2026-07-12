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

    const url = `https://horti-api.priva.com/api/sites/${siteId}/data`;

    console.log("Querying with dummy UUIDs...");
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-version': '2.0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startTime: "2026-07-09T00:00:00Z",
        endTime: "2026-07-11T00:00:00Z",
        datapoints: [
          {
            variableId: "e6de5be9-33c8-46df-bc71-bbc8d796185b",
            deviceId: "e6de5be9-33c8-46df-bc71-bbc8d796185b",
            deviceGroupId: "e6de5be9-33c8-46df-bc71-bbc8d796185b"
          }
        ]
      })
    });
    
    console.log(`Status: ${res.status}`);
    const json = await res.json();
    console.log(`Response JSON:`, JSON.stringify(json, null, 2));

  } catch (error) {
    console.error("Test failed:", error);
  }
}

run();
