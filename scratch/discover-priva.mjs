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
    
    // Potential URL variations
    const candidates = [
      "https://horti-api.priva.com/api/sites",
      "https://horti-api.priva.com/sites",
      "https://horti-api.priva.com/api/v2/sites",
      "https://horti-api.priva.com/api/v1/sites",
      "https://api.priva.com/api/sites",
      "https://api.priva.com/v1/sites",
      "https://api.priva.com/v2/sites",
      "https://api.priva.com/horticulture/api/sites",
      "https://horticulture.api.priva.com/api/sites",
      "https://horticulture.api.priva.com/api/v2/sites",
      "https://horticulture-api.priva.com/api/sites",
      "https://api.priva.com/horticulture/v1/sites",
      "https://api.priva.com/historical-data/v1/sites"
    ];

    console.log("Fuzzing Priva API endpoints...");
    for (const url of candidates) {
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-api-version': 'v2'
          }
        });
        console.log(`URL: ${url} -> Status: ${res.status}`);
        if (res.status === 200) {
          const json = await res.json();
          console.log(`SUCCESS! Connected sites count:`, json.length);
          console.log(JSON.stringify(json, null, 2));
        } else if (res.status !== 404) {
          const txt = await res.text();
          console.log(`Response content (Non-404):`, txt.substring(0, 150));
        }
      } catch (err) {
        console.log(`URL: ${url} -> ERROR: ${err.message}`);
      }
    }

  } catch (error) {
    console.error("Discovery failed:", error);
  }
}

run();
