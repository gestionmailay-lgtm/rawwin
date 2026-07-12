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

    const startTime = "2026-07-10T00:00:00Z";
    const endTime = "2026-07-11T23:00:00Z";
    const url = `https://horti-api.priva.com/api/sites/${siteId}/datapoints?startTime=${startTime}&endTime=${endTime}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-version': '2.0'
      }
    });

    const json = await res.json();
    const dps = json.datapoints || [];

    // Filter rules
    const interesting = dps.filter(dp => {
      const name = dp.name.toLowerCase();
      // Look for compartment 1 temperature, humidity, CO2, ventilation, or weather
      const isClimate = name.includes("temperature") || name.includes("humidity") || name.includes("co2") || name.includes("radiation") || name.includes("ventilation") || name.includes("heating") || name.includes("rh") || name.includes("weather") || name.includes("meteo");
      const isComp1 = name.includes("compartment 1") || name.includes("weather") || name.includes("meteo");
      return isClimate && isComp1;
    });

    console.log(`Found ${interesting.length} matching variables:`);
    interesting.forEach((it, idx) => {
      console.log(`${idx + 1}. "${it.name}" | Unit: ${it.unit} | varId: "${it.variableId}" | deviceId: "${it.deviceId}" | deviceGroupId: "${it.deviceGroupId}"`);
    });

  } catch (error) {
    console.error("Test failed:", error);
  }
}

run();
