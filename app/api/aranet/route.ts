import { NextRequest, NextResponse } from "next/server";

// Ignore SSL verification errors for Aranet Cloud API in local env
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const ARANET_API_KEY = "rvt3mbkpwudukptx2f3as7jcpja3srdw";
const BASE_URL = "https://aranet.cloud/api/v1";

const headers = {
  "Authorization": `ApiKey ${ARANET_API_KEY}`,
  "Accept": "application/json"
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action") || "summary";

  try {
    if (action === "summary") {
      // 1. Fetch sensors list
      const sensorsRes = await fetch(`${BASE_URL}/sensors`, { headers });
      if (!sensorsRes.ok) throw new Error(`Failed to fetch sensors: ${sensorsRes.statusText}`);
      const sensorsData = await sensorsRes.json();
      const sensorsList = sensorsData.sensors || [];

      // 2. Fetch last measurements
      const measurementsRes = await fetch(`${BASE_URL}/measurements/last`, { headers });
      if (!measurementsRes.ok) throw new Error(`Failed to fetch measurements: ${measurementsRes.statusText}`);
      const measurementsData = await measurementsRes.json();
      const readings = measurementsData.readings || [];

      // 3. Fetch last telemetry
      const telemetryRes = await fetch(`${BASE_URL}/telemetry/last`, { headers });
      if (!telemetryRes.ok) throw new Error(`Failed to fetch telemetry: ${telemetryRes.statusText}`);
      const telemetryData = await telemetryRes.json();
      const telemetryReadings = telemetryData.readings || [];

      // 4. Fetch metrics metadata
      const metricsRes = await fetch(`${BASE_URL}/metrics`, { headers });
      if (!metricsRes.ok) throw new Error(`Failed to fetch metrics: ${metricsRes.statusText}`);
      const metricsData = await metricsRes.json();
      const metricsList = metricsData.metrics || [];

      // Create lookup maps
      const metricsMap = new Map();
      metricsList.forEach((m: any) => {
        metricsMap.set(m.id, {
          name: m.name,
          units: m.units || [],
          defaultUnit: m.units?.find((u: any) => u.default)?.name || m.units?.[0]?.name || ""
        });
      });

      // Group readings and telemetry by sensor ID
      const sensorReadings = new Map();
      const sensorTelemetry = new Map();

      readings.forEach((r: any) => {
        if (!sensorReadings.has(r.sensor)) {
          sensorReadings.set(r.sensor, []);
        }
        const metricInfo = metricsMap.get(r.metric) || { name: `Metric ${r.metric}`, defaultUnit: "" };
        sensorReadings.get(r.sensor).push({
          metricId: r.metric,
          metricName: metricInfo.name,
          value: r.value,
          unit: metricInfo.defaultUnit,
          time: r.time
        });
      });

      telemetryReadings.forEach((t: any) => {
        if (!sensorTelemetry.has(t.sensor)) {
          sensorTelemetry.set(t.sensor, {});
        }
        if (t.metric === "61") { // RSSI
          sensorTelemetry.get(t.sensor).rssi = t.value;
        } else if (t.metric === "62") { // Battery
          sensorTelemetry.get(t.sensor).battery = t.value;
        } else if (t.metric === "63") { // Power supply type
          sensorTelemetry.get(t.sensor).powerSupply = t.value;
        }
      });

      // Combine everything
      const combinedSensors = sensorsList.map((s: any) => {
        const sReadings = sensorReadings.get(s.id) || [];
        const sTelemetry = sensorTelemetry.get(s.id) || {};
        
        return {
          id: s.id,
          sensorId: s.sensorId,
          name: s.name,
          type: s.type,
          battery: sTelemetry.battery !== undefined ? sTelemetry.battery : null,
          rssi: sTelemetry.rssi !== undefined ? sTelemetry.rssi : null,
          powerSupply: sTelemetry.powerSupply !== undefined ? sTelemetry.powerSupply : null,
          readings: sReadings,
          lastSeen: sReadings.length > 0 ? sReadings[0].time : null
        };
      });

      return NextResponse.json({
        success: true,
        sensors: combinedSensors,
        timestamp: new Date().toISOString()
      });
    } 
    
    if (action === "history") {
      const sensorId = searchParams.get("sensor");
      const hours = searchParams.get("hours");
      const days = searchParams.get("days");
      const unitId = searchParams.get("unit");

      let historyUrl = `${BASE_URL}/measurements/history`;
      const params = new URLSearchParams();

      if (sensorId) params.append("sensor", sensorId);
      
      let hasDuration = false;
      if (hours) {
        const parsedHours = parseInt(hours, 10);
        if (!isNaN(parsedHours)) {
          params.append("hours", parsedHours.toString());
          hasDuration = true;
        }
      }
      
      if (days && !hasDuration) {
        const parsedDays = parseInt(days, 10);
        if (!isNaN(parsedDays)) {
          params.append("days", parsedDays.toString());
          hasDuration = true;
        }
      }
      
      if (unitId) params.append("unit", unitId);
      
      // Default to 24 hours if no valid duration is set
      if (!hasDuration) {
        params.append("hours", "24");
      }

      if (params.toString()) {
        historyUrl += `?${params.toString()}`;
      }

      const historyRes = await fetch(historyUrl, { headers });
      if (!historyRes.ok) throw new Error(`Failed to fetch history: ${historyRes.statusText}`);
      const historyData = await historyRes.json();

      return NextResponse.json({
        success: true,
        readings: historyData.readings || [],
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Aranet API Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Aranet data", details: error.message },
      { status: 500 }
    );
  }
}
