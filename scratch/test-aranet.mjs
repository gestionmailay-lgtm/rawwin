process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const ARANET_API_KEY = "rvt3mbkpwudukptx2f3as7jcpja3srdw";
const BASE_URL = "https://aranet.cloud/api/v1";

const headers = {
  "Authorization": `ApiKey ${ARANET_API_KEY}`,
  "Accept": "application/json"
};

async function test() {
  const sensorId = "135267713";
  const url = `${BASE_URL}/measurements/history?sensor=${sensorId}&days=NaN`;
  console.log(`Fetching: ${url}`);
  try {
    const res = await fetch(url, { headers });
    console.log(`Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log("Response text:", text);
  } catch (e) {
    console.error("Error fetching:", e);
  }
}

test();
