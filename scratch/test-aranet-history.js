const key = "rvt3mbkpwudukptx2f3as7jcpja3srdw";

async function run() {
  const headers = { 'Authorization': `ApiKey ${key}` };
  
  // Test sensor 6303701 (Slab EC/WC)
  try {
    const url1 = "https://aranet.cloud/api/v1/measurements/history?sensor=6303701&hours=24";
    const res = await fetch(url1, { headers });
    const data = await res.json();
    console.log("Sensor 6303701 history records count:", data.readings?.length);
    console.log("Metrics present in this history:", [...new Set(data.readings?.map(r => r.metric))]);
  } catch (err) {
    console.error("Error url1:", err);
  }

  // Test sensor 1071787 (T/RH top)
  try {
    const url2 = "https://aranet.cloud/api/v1/measurements/history?sensor=1071787&hours=24";
    const res = await fetch(url2, { headers });
    const data = await res.json();
    console.log("Sensor 1071787 history records count:", data.readings?.length);
    console.log("Metrics present in this history:", [...new Set(data.readings?.map(r => r.metric))]);
  } catch (err) {
    console.error("Error url2:", err);
  }
}

run();
