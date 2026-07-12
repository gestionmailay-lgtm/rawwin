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

    const startTime = "2026-07-09T00:00:00Z";
    const endTime = "2026-07-11T00:00:00Z";
    const url = `https://horti-api.priva.com/api/sites/${siteId}/datapoints?startTime=${startTime}&endTime=${endTime}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-version': '2.0'
      }
    });

    console.log("Status:", res.status);
    const json = await res.json();
    
    if (!res.ok) {
      console.log("Error response:", JSON.stringify(json, null, 2));
      return;
    }

    if (!Array.isArray(json)) {
      console.log("Response is not an array. Keys:", Object.keys(json));
      console.log("Content:", JSON.stringify(json, null, 2).substring(0, 1000));
      return;
    }

    console.log(`TOTAL DATAPOINTS: ${json.length}`);
    const summary = {};
    for (const dp of json) {
      const parts = dp.name.split(' - ');
      const category = parts[0] || 'Other';
      if (!summary[category]) {
        summary[category] = [];
      }
      summary[category].push(dp);
    }

    console.log("\nCATEGORIES FOUND:");
    for (const [cat, items] of Object.entries(summary)) {
      console.log(`- ${cat} (${items.length} variables)`);
      items.slice(0, 3).forEach(it => {
        console.log(`   * "${it.name}" | Unit: ${it.unit} | VarID: ${it.variableId}`);
      });
    }

  } catch (error) {
    console.error("Test failed:", error);
  }
}

run();
