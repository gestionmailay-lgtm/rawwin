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

    const namespaces = [
      "asset-management",
      "assetmanagement",
      "historical-data",
      "historicaldata",
      "charts-service",
      "chartsservice",
      "priva-one",
      "privaone",
      "horticulture-services",
      "horticulture"
    ];

    console.log("Fuzzing namespaces...");
    for (const ns of namespaces) {
      const paths = [
        `/api/${ns}/sites`,
        `/api/${ns}/sites/${siteId}`,
        `/api/${ns}/sites/${siteId}/devicegroups`,
        `/api/${ns}/sites/${siteId}/devices`,
        `/api/${ns}/sites/${siteId}/variables`,
        `/api/${ns}/sites/${siteId}/measuringpoints`
      ];
      for (const p of paths) {
        const url = `https://horti-api.priva.com${p}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-api-version': '2.0'
          }
        });
        if (res.status !== 404) {
          console.log(`GET ${p} -> Status: ${res.status}`);
          const text = await res.text();
          console.log(`  Response:`, text.substring(0, 300));
        }
      }
    }

  } catch (error) {
    console.error("Test failed:", error);
  }
}

run();
