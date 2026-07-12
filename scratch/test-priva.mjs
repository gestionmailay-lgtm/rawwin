import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const clientId = process.env.PRIVA_CLIENT_ID;
const clientSecret = process.env.PRIVA_CLIENT_SECRET;

console.log("Starting Priva API test...");
console.log("Client ID:", clientId);

async function run() {
  try {
    // 1. Get access token
    const tokenUrl = "https://auth.priva.com/connect/token";
    const bodyParams = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'priva.priva-one priva.access-api priva.historical-data-platform priva.horticulture-services priva.mds-administrator priva.asset-management priva.charts-service'
    });

    console.log("Fetching token from:", tokenUrl);
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyParams.toString()
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      throw new Error(`Token request failed: ${tokenRes.status} ${errorText}`);
    }

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;
    console.log("Token retrieved successfully! Length:", token.length);

    // Decode JWT payload
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log("Decoded Token Payload:", JSON.stringify(payload, null, 2));

    // 2. Fetch connected sites
    const sitesUrl = "https://horti-api.priva.com/api/sites";
    console.log("Fetching sites from:", sitesUrl);
    const sitesRes = await fetch(sitesUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-version': 'v2'
      }
    });

    if (!sitesRes.ok) {
      const errorText = await sitesRes.text();
      throw new Error(`Sites request failed: ${sitesRes.status} ${errorText}`);
    }

    const sites = await sitesRes.json();
    console.log("Sites retrieval success! Connected sites count:", sites.length);
    console.log(JSON.stringify(sites, null, 2));

  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

run();
