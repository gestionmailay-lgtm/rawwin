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
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams.toString()
    });

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    const urls = [
      "https://horti-api.priva.com/swagger/index.html",
      "https://horti-api.priva.com/swagger/v2/swagger.json",
      "https://horti-api.priva.com/swagger/v1/swagger.json",
      "https://horti-api.priva.com/swagger/swagger.json",
      "https://horti-api.priva.com/api/swagger.json",
      "https://horti-api.priva.com/",
      "https://horti-api.priva.com/api"
    ];

    console.log("Checking Swagger / metadata locations...");
    for (const url of urls) {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-version': '2.0'
        }
      });
      console.log(`URL: ${url} -> Status: ${res.status}`);
      if (res.status === 200) {
        const text = await res.text();
        console.log(`  Found! Length: ${text.length}. Sample:`, text.substring(0, 500));
      }
    }

  } catch (error) {
    console.error("Test failed:", error);
  }
}

run();
