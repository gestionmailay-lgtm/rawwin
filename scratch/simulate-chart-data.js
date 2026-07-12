const key = "rvt3mbkpwudukptx2f3as7jcpja3srdw";

const PLOTTABLE_METRICS = [
  { key: "temp_rh_top_1", name: "Température Haut", metricId: "1", sensorId: "1071787" },
  { key: "temp_rh_top_2", name: "Humidité Haut", metricId: "2", sensorId: "1071787" },
  { key: "slab_ec_wc_8", name: "Humidité Substrat VWC", metricId: "8", sensorId: "6303701" },
  { key: "slab_weight_7", name: "Poids Pain Substrat", metricId: "7", sensorId: "134219975" }
];

async function run() {
  const headers = { 'Authorization': `ApiKey ${key}` };
  const rawDataMap = {};

  console.log("Fetching readings...");
  for (const m of PLOTTABLE_METRICS) {
    try {
      const url = `https://aranet.cloud/api/v1/measurements/history?sensor=${m.sensorId}&hours=24`;
      const res = await fetch(url, { headers });
      const resData = await res.json();
      const readings = (resData.readings || []).filter(r => r.metric === m.metricId);
      rawDataMap[m.key] = readings;
      console.log(`Fetched ${m.key}: count=${readings.length}`);
    } catch (err) {
      console.error(`Error for ${m.key}:`, err.message);
    }
  }

  // Simulate merging (absolute mode)
  const bins = {};
  const selectedKeys = PLOTTABLE_METRICS.map(m => m.key);

  selectedKeys.forEach((key) => {
    const readings = rawDataMap[key] || [];
    readings.forEach((r) => {
      const date = new Date(r.time);
      date.setSeconds(0);
      date.setMilliseconds(0);
      const timeMs = date.getTime();

      if (!bins[timeMs]) {
        bins[timeMs] = {
          time: timeMs
        };
      }
      bins[timeMs][key] = r.value;
    });
  });

  const chartData = Object.values(bins).sort((a, b) => a.time - b.time);
  console.log(`\nSimulated chartData length: ${chartData.length}`);
  if (chartData.length > 0) {
    console.log("First 3 merged points:", JSON.stringify(chartData.slice(0, 3), null, 2));
    console.log("Last 3 merged points:", JSON.stringify(chartData.slice(-3), null, 2));
    
    // Check how many non-null values we have for each key
    selectedKeys.forEach(key => {
      const nonNullCount = chartData.filter(d => d[key] !== undefined).length;
      console.log(`Key ${key} has ${nonNullCount} non-null values out of ${chartData.length} points.`);
    });
  }
}

run();
