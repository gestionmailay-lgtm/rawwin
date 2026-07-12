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

    const paths = [
      `/api/sites/${siteId}/devicegroups`,
      `/api/sites/${siteId}/device-groups`,
      `/api/sites/${siteId}/devicegroup`,
      `/api/sites/${siteId}/groups`,
      `/api/sites/${siteId}/devicegrouprecords`,
      `/api/sites/${siteId}/topology`,
      `/api/sites/${siteId}/structure`
    ];

    console.log("Checking device group endpoints...");
    for (const p of paths) {
      const url = `https://horti-api.priva.com${p}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-version': '2.0'
        }
      });
      console.log(`Path: ${p} -> Status: ${res.status}`);
      if (res.status === 200) {
        const json = await res.json();
        console.log(`SUCCESS on ${p}! Items count:`, Array.isArray(json) ? json.length : 'Object returned');
        console.log(JSON.stringify(json, null, 2).substring(0, 1000));
      }
    }

  } catch (error) {
    console.error("Test failed:", error);
  }
}

run();
