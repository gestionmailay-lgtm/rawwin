const key = "rvt3mbkpwudukptx2f3as7jcpja3srdw";
const url = "https://aranet.cloud/api/v1/metrics";
const fs = require('fs');
const path = require('path');

async function run() {
  const headers = { 'Authorization': `ApiKey ${key}` };
  try {
    const res = await fetch(url, { headers });
    const data = await res.json();
    fs.writeFileSync(path.join(__dirname, 'aranet-metrics.json'), JSON.stringify(data, null, 2));
    console.log("Saved metrics metadata to scratch/aranet-metrics.json");
    
    console.log("\nMetric mappings:");
    data.metrics?.forEach(m => {
      const defaultUnit = m.units?.find(u => u.default)?.name || m.units?.[0]?.name || '';
      console.log(`- ID: ${m.id}, Name: ${m.name}, Default Unit: ${defaultUnit}, Units: [${m.units?.map(u => `${u.id}:${u.name}`).join(', ')}]`);
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
