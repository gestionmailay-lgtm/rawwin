import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const clientId = process.env.PRIVA_CLIENT_ID;
const clientSecret = process.env.PRIVA_CLIENT_SECRET;

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
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyParams.toString()
    });

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;
    
    // Header variations
    const versionHeaderValues = [
      "v2",
      "2.0",
      "2",
      "v2.0",
      "v1",
      "1.0",
      "1",
      "v1.0"
    ];

    console.log("Fuzzing headers on https://horti-api.priva.com/api/sites...");
    for (const val of versionHeaderValues) {
      const res = await fetch("https://horti-api.priva.com/api/sites", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-version': val
        }
      });
      console.log(`x-api-version: "${val}" -> Status: ${res.status}`);
      if (res.status !== 404) {
        const text = await res.text();
        console.log(`Response content:`, text.substring(0, 200));
      }
    }

  } catch (error) {
    console.error("Discovery failed:", error);
  }
}

run();
