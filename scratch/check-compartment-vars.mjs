import fs from 'fs';
import path from 'path';

const cachePath = path.resolve("scratch", "priva-datapoints-cache.json");

try {
  const data = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  const dps = data.datapoints || [];
  console.log(`Total datapoints in cache: ${dps.length}`);
  
  // Search for compartment heating temp variables
  console.log("\nSearching for Heating 1 Measured Temperature:");
  const heatingMeas = dps.filter(dp => dp.name.includes("Heating 1 - Measured heating temperature"));
  heatingMeas.forEach(dp => console.log(`- ${dp.name} | varId: ${dp.variableId}`));

  console.log("\nSearching for Compartment names:");
  const compartments = new Set();
  dps.forEach(dp => {
    const match = dp.name.match(/(Compartment \d+|Weather \d+|Humidification \d+|Other)/i);
    if (match) compartments.add(match[0]);
  });
  console.log("Unique compartments/devices found:", Array.from(compartments));

} catch (err) {
  console.error(err);
}
