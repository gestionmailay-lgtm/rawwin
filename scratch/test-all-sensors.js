const key = "rvt3mbkpwudukptx2f3as7jcpja3srdw";

const PLOTTABLE_METRICS = [
  { key: "temp_rh_top_1", name: "Température Haut", sensorId: "1071787" },
  { key: "temp_rh_bottom_1", name: "Température Bas", sensorId: "1074088" },
  { key: "vpd_top_28", name: "VPD Haut", sensorId: "135267713" },
  { key: "vpd_bottom_28", name: "VPD Bas", sensorId: "135267714" },
  { key: "vpd_avg_28", name: "VPD Moyen", sensorId: "134220332" },
  { key: "par_12", name: "Rayonnement PAR", sensorId: "6303173" },
  { key: "dli_29", name: "DLI (Hier)", sensorId: "136315172" },
  { key: "slab_ec_wc_8", name: "Humidité Substrat VWC", sensorId: "6303701" },
  { key: "slab_weight_7", name: "Poids Pain Substrat", sensorId: "134219975" },
  { key: "plant_weight_7", name: "Poids Plante", sensorId: "134219976" },
  { key: "stem_top_114", name: "Diamètre Tige Haut", sensorId: "5247476" },
  { key: "stem_bottom_114", name: "Diamètre Tige Bas", sensorId: "5249180" },
  { key: "sap_top_114", name: "Flux Sève Haut", sensorId: "5250254" },
  { key: "sap_bottom_114", name: "Flux Sève Bas", sensorId: "5250268" },
  { key: "sap_ratio_24", name: "Ratio Sève Haut/Bas", sensorId: "135267405" }
];

async function run() {
  const headers = { 'Authorization': `ApiKey ${key}` };
  const uniqueSensors = [...new Set(PLOTTABLE_METRICS.map(m => m.sensorId))];

  console.log("Checking history for sensors...");
  for (const sensorId of uniqueSensors) {
    try {
      const url = `https://aranet.cloud/api/v1/measurements/history?sensor=${sensorId}&hours=24`;
      const res = await fetch(url, { headers });
      const data = await res.json();
      const count = data.readings?.length || 0;
      const metrics = data.readings ? [...new Set(data.readings.map(r => r.metric))] : [];
      console.log(`Sensor ${sensorId}: count=${count}, metrics=[${metrics.join(', ')}]`);
    } catch (err) {
      console.error(`Error for sensor ${sensorId}:`, err.message);
    }
  }
}

run();
