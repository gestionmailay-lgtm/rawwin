const key = "rvt3mbkpwudukptx2f3as7jcpja3srdw";
const url = "https://aranet.cloud/api/v1/telemetry/last";

async function run() {
  const headers = { 'Authorization': `ApiKey ${key}` };
  try {
    const res = await fetch(url, { headers });
    const data = await res.json();
    console.log("Telemetry last structure (first few items):");
    console.log(JSON.stringify(data, null, 2).substring(0, 1000));
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
