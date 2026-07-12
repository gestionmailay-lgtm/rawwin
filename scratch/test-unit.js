const key = "rvt3mbkpwudukptx2f3as7jcpja3srdw";

async function run() {
  const headers = { 'Authorization': `ApiKey ${key}` };
  
  // 1. Without unit parameter
  try {
    const url = "https://aranet.cloud/api/v1/measurements/history?sensor=6303701&hours=24";
    const res = await fetch(url, { headers });
    const data = await res.json();
    console.log("Without unit parameter - readings count:", data.readings?.length);
    if (data.readings && data.readings.length > 0) {
      console.log("First reading sample:", data.readings[0]);
      console.log("Unique units present:", [...new Set(data.readings.map(r => r.unit))]);
    }
  } catch (err) {
    console.error("Error without unit:", err);
  }

  // 2. With unit=115 parameter
  try {
    const url = "https://aranet.cloud/api/v1/measurements/history?sensor=6303701&hours=24&unit=115";
    const res = await fetch(url, { headers });
    const data = await res.json();
    console.log("\nWith unit=115 parameter - readings count:", data.readings?.length);
    if (data.readings && data.readings.length > 0) {
      console.log("First reading sample:", data.readings[0]);
    }
  } catch (err) {
    console.error("Error with unit=115:", err);
  }

  // 3. With unit=115 as query param, but checking if there's any other sensor
  try {
    const url = "https://aranet.cloud/api/v1/measurements/history?sensor=1071787&hours=24&unit=1";
    const res = await fetch(url, { headers });
    const data = await res.json();
    console.log("\nWith sensor 1071787 and unit=1 - readings count:", data.readings?.length);
    if (data.readings && data.readings.length > 0) {
      console.log("Unique units present:", [...new Set(data.readings.map(r => r.unit))]);
    }
  } catch (err) {
    console.error("Error with unit=1:", err);
  }
}

run();
