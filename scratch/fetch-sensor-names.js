const key = "rvt3mbkpwudukptx2f3as7jcpja3srdw";

async function run() {
  const headers = { 'Authorization': `ApiKey ${key}` };
  try {
    const res = await fetch("https://aranet.cloud/api/v1/sensors", { headers });
    const data = await res.json();
    console.log("Sensors list from Aranet Cloud:");
    if (data.sensors) {
      data.sensors.forEach(s => {
        console.log(`- ID: ${s.id}, SensorID: ${s.sensorId}, Name: "${s.name}", Type: "${s.type}"`);
      });
    } else {
      console.log(data);
    }
  } catch (err) {
    console.error(err);
  }
}

run();
