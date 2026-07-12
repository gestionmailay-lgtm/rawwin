import fs from 'fs';
import path from 'path';

const cachePath = path.resolve("scratch", "priva-datapoints-cache.json");

const plottablePrivaMetrics = [
  // Météo
  { key: "priva_temp_out", variableId: "00000214-0001-0000-0000-0000000042a9" },
  { key: "priva_hum_out", variableId: "00000214-0001-0000-0000-00000000427e" },
  { key: "priva_irr_out", variableId: "00000214-0001-0000-0000-0000000042fd" },
  { key: "priva_wind_out", variableId: "00000214-0001-0000-0000-0000000042ad" },

  // C1
  { key: "priva_c1_temp", variableId: "0000002c-0001-0001-0000-0000000006f6" },
  { key: "priva_c1_temp_target", variableId: "0000002c-0001-0001-0000-0000000006e5" },
  { key: "priva_c1_hum", variableId: "000002bb-0001-0000-0000-0000000050f2" },

  // C2
  { key: "priva_c2_temp", variableId: "0000002c-0002-0001-0000-0000000006f6" },
  { key: "priva_c2_temp_target", variableId: "0000002c-0002-0001-0000-0000000006e5" },
  { key: "priva_c2_hum", variableId: "000002bb-0002-0000-0000-0000000050f2" },

  // C3
  { key: "priva_c3_temp", variableId: "0000002c-0003-0001-0000-0000000006f6" },
  { key: "priva_c3_temp_target", variableId: "0000002c-0003-0001-0000-0000000006e5" },
  { key: "priva_c3_hum", variableId: "000002bb-0003-0000-0000-0000000050f2" },

  // C4
  { key: "priva_c4_temp", variableId: "0000002c-0004-0001-0000-0000000006f6" },
  { key: "priva_c4_temp_target", variableId: "0000002c-0004-0001-0000-0000000006e5" },
  { key: "priva_c4_hum", variableId: "000002bb-0004-0000-0000-0000000050f2" },

  // C5
  { key: "priva_c5_temp", variableId: "0000002c-0005-0001-0000-0000000006f6" },
  { key: "priva_c5_temp_target", variableId: "0000002c-0005-0001-0000-0000000006e5" },
  { key: "priva_c5_hum", variableId: "000002bb-0005-0000-0000-0000000050f2" },

  // C6
  { key: "priva_c6_temp", variableId: "0000002c-0006-0001-0000-0000000006f6" },
  { key: "priva_c6_temp_target", variableId: "0000002c-0006-0001-0000-0000000006e5" },
  { key: "priva_c6_hum", variableId: "000002bb-0006-0000-0000-0000000050f2" }
];

try {
  const data = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  const dps = data.datapoints || [];
  
  const allVarIds = new Set(dps.map(dp => dp.variableId));
  
  console.log("CROSS REFERENCE RESULTS:");
  let invalidCount = 0;
  for (const item of plottablePrivaMetrics) {
    const exists = allVarIds.has(item.variableId);
    if (!exists) {
      console.log(`❌ ERROR: Metric key "${item.key}" with varId "${item.variableId}" DOES NOT EXIST in site catalog!`);
      invalidCount++;
    } else {
      const details = dps.find(dp => dp.variableId === item.variableId);
      console.log(`✅ OK: "${item.key}" exists as "${details.name}"`);
    }
  }
  
  console.log(`\nScan finished. Total invalid variables found: ${invalidCount}`);

} catch (err) {
  console.error(err);
}
