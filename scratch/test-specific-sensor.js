const key = "rvt3mbkpwudukptx2f3as7jcpja3srdw";

async function run() {
  const headers = { 'Authorization': `ApiKey ${key}` };
  const sensorId = "134219975";
  try {
    const url = `https://aranet.cloud/api/v1/measurements/history?sensor=${sensorId}&hours=24`;
    const res = await fetch(url, { headers });
    const data = await res.json();
    console.log(`Sensor ${sensorId} response success:`, !!data.readings);
    console.log(`Readings count:`, data.readings?.length);
    if (data.readings && data.readings.length > 0) {
      console.log("Sample reading:", data.readings[0]);
      console.log("Unique metrics:", [...new Set(data.readings.map(r => r.metric))]);
    } else {
      console.log("Response data:", JSON.stringify(data).substring(0, 500));
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();
