"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  RefreshCw, 
  Activity, 
  LineChart as ChartIcon, 
  Sliders, 
  CheckSquare, 
  Square,
  Sparkles,
  Menu,
  Leaf,
  Award,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  Gauge,
  Thermometer,
  Maximize2,
  Lightbulb,
  ShieldAlert,
  Cpu,
  Droplets,
  Sun,
  Wind,
  Flame,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Brush,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

// Definition of all 20 plottable metrics with their available units
const PLOTTABLE_METRICS = [
  { key: "temp_rh_top_1", name: "T/RH top - Temp", category: "Climat", metricId: "1", color: "#e11d48", sensorId: "1071787", units: [{ id: "1", name: "°C" }, { id: "101", name: "°F" }, { id: "102", name: "K" }, { id: "119", name: "Cel" }] },
  { key: "temp_rh_top_2", name: "T/RH top - Humidity", category: "Climat", metricId: "2", color: "#06b6d4", sensorId: "1071787", units: [{ id: "2", name: "%" }, { id: "120", name: "%RH" }] },
  { key: "temp_rh_bottom_1", name: "T/RH bottom - Temp", category: "Climat", metricId: "1", color: "#f43f5e", sensorId: "1074088", units: [{ id: "1", name: "°C" }, { id: "101", name: "°F" }, { id: "102", name: "K" }, { id: "119", name: "Cel" }] },
  { key: "temp_rh_bottom_2", name: "T/RH bottom - Humidity", category: "Climat", metricId: "2", color: "#22d3ee", sensorId: "1074088", units: [{ id: "2", name: "%" }, { id: "120", name: "%RH" }] },
  { key: "vpd_top_28", name: "VPD Top", category: "Climat", metricId: "28", color: "#8b5cf6", sensorId: "135267713", units: [{ id: "134", name: "kPa" }, { id: "21", name: "Pa" }, { id: "135", name: "hPa" }, { id: "136", name: "bar" }, { id: "137", name: "psi" }] },
  { key: "vpd_bottom_28", name: "VPD Bottom", category: "Climat", metricId: "28", color: "#a78bfa", sensorId: "135267714", units: [{ id: "134", name: "kPa" }, { id: "21", name: "Pa" }, { id: "135", name: "hPa" }, { id: "136", name: "bar" }, { id: "137", name: "psi" }] },
  { key: "vpd_avg_28", name: "VPD 1 - Average", category: "Climat", metricId: "28", color: "#c084fc", sensorId: "134220332", units: [{ id: "134", name: "kPa" }, { id: "21", name: "Pa" }, { id: "135", name: "hPa" }, { id: "136", name: "bar" }, { id: "137", name: "psi" }] },
  { key: "par_12", name: "PAR", category: "Lumière", metricId: "12", color: "#eab308", sensorId: "6303173", units: [{ id: "9", name: "µmol/m²/s" }, { id: "124", name: "mol/m2/s" }] },
  { key: "dli_29", name: "DLI", category: "Lumière", metricId: "29", color: "#ca8a04", sensorId: "136315172", units: [{ id: "140", name: "mol/m²/d" }, { id: "142", name: "mol/m2/d" }, { id: "22", name: "µmol/m²/d" }] },
  { key: "slab_ec_wc_8", name: "Slab EC/WC (VWC)", category: "Sol & Irrigation", metricId: "8", color: "#10b981", sensorId: "6303701", units: [{ id: "115", name: "%" }, { id: "123", name: "/" }] },
  { key: "slab_ec_wc_11", name: "Slab EC/WC (Pore EC)", category: "Sol & Irrigation", metricId: "11", color: "#ca8a04", sensorId: "6303701", units: [{ id: "108", name: "mS/cm" }, { id: "8", name: "S/m" }] },
  { key: "slab_ec_wc_10", name: "Slab EC/WC (Bulk EC)", category: "Sol & Irrigation", metricId: "10", color: "#854d0e", sensorId: "6303701", units: [{ id: "108", name: "mS/cm" }, { id: "8", name: "S/m" }] },
  { key: "slab_ec_wc_1", name: "Slab EC/WC (Temp)", category: "Sol & Irrigation", metricId: "1", color: "#2563eb", sensorId: "6303701", units: [{ id: "1", name: "°C" }, { id: "101", name: "°F" }, { id: "102", name: "K" }] },
  { key: "slab_weight_7", name: "Slab weight", category: "Sol & Irrigation", metricId: "7", color: "#16a34a", sensorId: "134219975", units: [{ id: "7", name: "kg" }, { id: "107", name: "lb" }] },
  { key: "plant_weight_7", name: "Plant weight", category: "Sol & Irrigation", metricId: "7", color: "#84cc16", sensorId: "134219976", units: [{ id: "7", name: "kg" }, { id: "107", name: "lb" }] },
  { key: "plant_weight_gain", name: "Cumulative Gain", category: "Physiologie", metricId: "7", color: "#22c55e", sensorId: "134219976", units: [{ id: "7", name: "kg/m²" }, { id: "107", name: "lb/m²" }] },
  { key: "stem_top_114", name: "STEM top", category: "Physiologie", metricId: "114", color: "#db2777", sensorId: "5247476", units: [{ id: "314", name: "µm" }] },
  { key: "stem_bottom_114", name: "STEM - Bottom", category: "Physiologie", metricId: "114", color: "#ec4899", sensorId: "5249180", units: [{ id: "314", name: "µm" }] },
  { key: "sap_top_114", name: "SAP Flow - top", category: "Physiologie", metricId: "114", color: "#0d9488", sensorId: "5250254", units: [{ id: "314", name: "µm" }] },
  { key: "sap_bottom_114", name: "SAP Flow - bottom", category: "Physiologie", metricId: "114", color: "#14b8a6", sensorId: "5250268", units: [{ id: "314", name: "µm" }] },
  { key: "sap_ratio_24", name: "Sap Flow ration Top/bottom", category: "Physiologie", metricId: "24", color: "#4f46e5", sensorId: "135267405", units: [{ id: "18", name: "Ratio" }, { id: "123", name: "/" }] },
  
  // Priva - Météo
  { key: "priva_temp_out", name: "Priva - Météo Temp Extérieure", category: "Priva - Météo", isPriva: true, variableId: "00000214-0001-0000-0000-0000000042a9", deviceId: "VP9508", deviceGroupId: "none", color: "#f59e0b", units: [{ id: "celsius", name: "°C" }] },
  { key: "priva_hum_out", name: "Priva - Météo Hum Extérieure", category: "Priva - Météo", isPriva: true, variableId: "00000214-0001-0000-0000-00000000427e", deviceId: "VP9508", deviceGroupId: "none", color: "#3b82f6", units: [{ id: "procent", name: "%" }] },
  { key: "priva_irr_out", name: "Priva - Météo Rayonnement Solaire", category: "Priva - Météo", isPriva: true, variableId: "00000214-0001-0000-0000-0000000042fd", deviceId: "VP9508", deviceGroupId: "none", color: "#eab308", units: [{ id: "watt_m2", name: "W/m²" }] },
  { key: "priva_wind_out", name: "Priva - Météo Vitesse Vent", category: "Priva - Météo", isPriva: true, variableId: "00000214-0001-0000-0000-0000000042ad", deviceId: "VP9508", deviceGroupId: "none", color: "#0d9488", units: [{ id: "mtr_sec", name: "m/s" }] },

  // Priva - Compartiment 1
  { key: "priva_c1_temp", name: "Priva - C1 Temp Chauffage", category: "Priva - Compartiment 1", isPriva: true, variableId: "0000002c-0001-0001-0000-0000000006f6", deviceId: "VP9508", deviceGroupId: "none", color: "#ef4444", units: [{ id: "celsius", name: "°C" }] },
  { key: "priva_c1_temp_target", name: "Priva - C1 Consigne Chauffage", category: "Priva - Compartiment 1", isPriva: true, variableId: "0000002c-0001-0001-0000-0000000006e5", deviceId: "VP9508", deviceGroupId: "none", color: "#f87171", units: [{ id: "celsius", name: "°C" }] },
  { key: "priva_c1_hum", name: "Priva - C1 Humidité Mesurée", category: "Priva - Compartiment 1", isPriva: true, variableId: "000002bb-0001-0000-0000-0000000050f2", deviceId: "VP9508", deviceGroupId: "none", color: "#06b6d4", units: [{ id: "procent", name: "%" }] },

  // Priva - Compartiment 2
  { key: "priva_c2_temp", name: "Priva - C2 Temp Chauffage", category: "Priva - Compartiment 2", isPriva: true, variableId: "0000002c-0001-0002-0000-0000000006f6", deviceId: "VP9508", deviceGroupId: "none", color: "#f97316", units: [{ id: "celsius", name: "°C" }] },
  { key: "priva_c2_temp_target", name: "Priva - C2 Consigne Chauffage", category: "Priva - Compartiment 2", isPriva: true, variableId: "0000002c-0001-0002-0000-0000000006e5", deviceId: "VP9508", deviceGroupId: "none", color: "#fb923c", units: [{ id: "celsius", name: "°C" }] },
  { key: "priva_c2_hum", name: "Priva - C2 Humidité Mesurée", category: "Priva - Compartiment 2", isPriva: true, variableId: "000002bb-0002-0000-0000-0000000050f2", deviceId: "VP9508", deviceGroupId: "none", color: "#0891b2", units: [{ id: "procent", name: "%" }] },

  // Priva - Compartiment 3
  { key: "priva_c3_temp", name: "Priva - C3 Temp Chauffage", category: "Priva - Compartiment 3", isPriva: true, variableId: "0000002c-0001-0003-0000-0000000006f6", deviceId: "VP9508", deviceGroupId: "none", color: "#ec4899", units: [{ id: "celsius", name: "°C" }] },
  { key: "priva_c3_temp_target", name: "Priva - C3 Consigne Chauffage", category: "Priva - Compartiment 3", isPriva: true, variableId: "0000002c-0001-0003-0000-0000000006e5", deviceId: "VP9508", deviceGroupId: "none", color: "#f472b6", units: [{ id: "celsius", name: "°C" }] },
  { key: "priva_c3_hum", name: "Priva - C3 Humidité Mesurée", category: "Priva - Compartiment 3", isPriva: true, variableId: "000002bb-0003-0000-0000-0000000050f2", deviceId: "VP9508", deviceGroupId: "none", color: "#6366f1", units: [{ id: "procent", name: "%" }] },

  // Priva - Compartiment 4
  { key: "priva_c4_temp", name: "Priva - C4 Temp Chauffage", category: "Priva - Compartiment 4", isPriva: true, variableId: "0000002c-0001-0004-0000-0000000006f6", deviceId: "VP9508", deviceGroupId: "none", color: "#8b5cf6", units: [{ id: "celsius", name: "°C" }] },
  { key: "priva_c4_temp_target", name: "Priva - C4 Consigne Chauffage", category: "Priva - Compartiment 4", isPriva: true, variableId: "0000002c-0001-0004-0000-0000000006e5", deviceId: "VP9508", deviceGroupId: "none", color: "#a78bfa", units: [{ id: "celsius", name: "°C" }] },
  { key: "priva_c4_hum", name: "Priva - C4 Humidité Mesurée", category: "Priva - Compartiment 4", isPriva: true, variableId: "000002bb-0004-0000-0000-0000000050f2", deviceId: "VP9508", deviceGroupId: "none", color: "#4f46e5", units: [{ id: "procent", name: "%" }] },

  // Priva - Compartiment 5
  { key: "priva_c5_temp", name: "Priva - C5 Temp Chauffage", category: "Priva - Compartiment 5", isPriva: true, variableId: "0000002c-0001-0005-0000-0000000006f6", deviceId: "VP9508", deviceGroupId: "none", color: "#10b981", units: [{ id: "celsius", name: "°C" }] },
  { key: "priva_c5_temp_target", name: "Priva - C5 Consigne Chauffage", category: "Priva - Compartiment 5", isPriva: true, variableId: "0000002c-0001-0005-0000-0000000006e5", deviceId: "VP9508", deviceGroupId: "none", color: "#34d399", units: [{ id: "celsius", name: "°C" }] },
  { key: "priva_c5_hum", name: "Priva - C5 Humidité Mesurée", category: "Priva - Compartiment 5", isPriva: true, variableId: "000002bb-0005-0000-0000-0000000050f2", deviceId: "VP9508", deviceGroupId: "none", color: "#06b6d4", units: [{ id: "procent", name: "%" }] },

  // Priva - Compartiment 6
  { key: "priva_c6_temp", name: "Priva - C6 Temp Chauffage", category: "Priva - Compartiment 6", isPriva: true, variableId: "0000002c-0001-0006-0000-0000000006f6", deviceId: "VP9508", deviceGroupId: "none", color: "#6b7280", units: [{ id: "celsius", name: "°C" }] },
  { key: "priva_c6_temp_target", name: "Priva - C6 Consigne Chauffage", category: "Priva - Compartiment 6", isPriva: true, variableId: "0000002c-0001-0006-0000-0000000006e5", deviceId: "VP9508", deviceGroupId: "none", color: "#9ca3af", units: [{ id: "celsius", name: "°C" }] },
  { key: "priva_c6_hum", name: "Priva - C6 Humidité Mesurée", category: "Priva - Compartiment 6", isPriva: true, variableId: "000002bb-0006-0000-0000-0000000050f2", deviceId: "VP9508", deviceGroupId: "none", color: "#4b5563", units: [{ id: "procent", name: "%" }] }
];

// Abbreviation mapping for the bottom indicator badges
const METRIC_BADGES: { [key: string]: string } = {
  temp_rh_top_1: "T1",
  temp_rh_top_2: "H1",
  temp_rh_bottom_1: "T2",
  temp_rh_bottom_2: "H2",
  vpd_top_28: "VPD1",
  vpd_bottom_28: "VPD2",
  vpd_avg_28: "VPDm",
  par_12: "PAR",
  dli_29: "DLI",
  slab_ec_wc_8: "Sub%",
  slab_ec_wc_11: "ECp",
  slab_ec_wc_10: "ECg",
  slab_ec_wc_1: "Ts",
  slab_weight_7: "Wt",
  plant_weight_7: "Gr",
  plant_weight_gain: "GainC",
  stem_top_114: "Dt1",
  stem_bottom_114: "Dt2",
  sap_top_114: "St1",
  sap_bottom_114: "St2",
  sap_ratio_24: "Ratio",
  
  priva_temp_out: "P.Tout",
  priva_hum_out: "P.Hout",
  priva_irr_out: "P.Irr",
  priva_wind_out: "P.Vent",
  priva_c1_temp: "C1.T",
  priva_c1_temp_target: "C1.Tc",
  priva_c1_hum: "C1.H",
  priva_c2_temp: "C2.T",
  priva_c2_temp_target: "C2.Tc",
  priva_c2_hum: "C2.H",
  priva_c3_temp: "C3.T",
  priva_c3_temp_target: "C3.Tc",
  priva_c3_hum: "C3.H",
  priva_c4_temp: "C4.T",
  priva_c4_temp_target: "C4.Tc",
  priva_c4_hum: "C4.H",
  priva_c5_temp: "C5.T",
  priva_c5_temp_target: "C5.Tc",
  priva_c5_hum: "C5.H",
  priva_c6_temp: "C6.T",
  priva_c6_temp_target: "C6.Tc",
  priva_c6_hum: "C6.H"
};

// Simple matrix inversion for small matrices
function invertMatrix(M: number[][]): number[][] | null {
  const n = M.length;
  const A: number[][] = M.map((row, i) => {
    const aug = [...row];
    for (let j = 0; j < n; j++) {
      aug.push(i === j ? 1 : 0);
    }
    return aug;
  });
  
  for (let i = 0; i < n; i++) {
    let maxEl = Math.abs(A[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > maxEl) {
        maxEl = Math.abs(A[k][i]);
        maxRow = k;
      }
    }
    
    if (maxRow !== i) {
      const temp = A[i];
      A[i] = A[maxRow];
      A[maxRow] = temp;
    }
    
    if (Math.abs(A[i][i]) < 1e-10) {
      return null;
    }
    
    const pivot = A[i][i];
    for (let j = i; j < 2 * n; j++) {
      A[i][j] /= pivot;
    }
    
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = A[k][i];
        for (let j = i; j < 2 * n; j++) {
          A[k][j] -= factor * A[i][j];
        }
      }
    }
  }
  
  const inv: number[][] = [];
  for (let i = 0; i < n; i++) {
    inv.push(A[i].slice(n));
  }
  return inv;
}

// Generate dynamic Savitzky-Golay coefficients for smoothing (0-th derivative)
function getSavitzkyGolayCoefficients(windowSize: number, degree: number): number[] {
  const m = Math.floor(windowSize / 2);
  const N = windowSize;
  
  const J: number[][] = [];
  for (let i = 0; i < N; i++) {
    const x = i - m;
    const row: number[] = [];
    for (let deg = 0; deg <= degree; deg++) {
      row.push(Math.pow(x, deg));
    }
    J.push(row);
  }
  
  const JT: number[][] = [];
  for (let deg = 0; deg <= degree; deg++) {
    const row: number[] = [];
    for (let i = 0; i < N; i++) {
      row.push(J[i][deg]);
    }
    JT.push(row);
  }
  
  const JTJ: number[][] = [];
  const size = degree + 1;
  for (let r = 0; r < size; r++) {
    const row: number[] = [];
    for (let c = 0; c < size; c++) {
      let sum = 0;
      for (let k = 0; k < N; k++) {
        sum += JT[r][k] * J[k][c];
      }
      row.push(sum);
    }
    JTJ.push(row);
  }
  
  const invJTJ = invertMatrix(JTJ);
  if (!invJTJ) {
    return Array(N).fill(1 / N);
  }
  
  const coefficients: number[] = [];
  for (let j = 0; j < N; j++) {
    let sum = 0;
    for (let k = 0; k < size; k++) {
      sum += invJTJ[0][k] * JT[k][j];
    }
    coefficients.push(sum);
  }
  
  return coefficients;
}

// Apply Savitzky-Golay smoothing filter to sequence
function applySavitzkyGolay(data: number[], windowSize: number, degree: number): number[] {
  if (data.length < windowSize) {
    return data;
  }
  const coeffs = getSavitzkyGolayCoefficients(windowSize, degree);
  const m = Math.floor(windowSize / 2);
  const result: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    let val = 0;
    for (let j = 0; j < windowSize; j++) {
      const idx = i + j - m;
      const clampedIdx = Math.max(0, Math.min(data.length - 1, idx));
      val += coeffs[j] * data[clampedIdx];
    }
    result.push(val);
  }
  return result;
}

interface ParameterAudit {
  name: string
  applied: number
  targetMin: number
  targetMax: number
  unit: string
  status: "optimal" | "high" | "low"
  impact: string
}

interface AgronomicDay {
  day: number
  status: "Optimal" | "Ajustement requis" | "Alerte Climat"
  statusColor: "emerald" | "amber" | "rose"
  overallScore: number // out of 100
  potentialGain: number // €/m²
  audits: ParameterAudit[]
  physiologicalExplanation: string
  actionPlan: string[]
}

const AGRONOMIC_DATA: AgronomicDay[] = [
  {
    day: 1, status: "Ajustement requis", statusColor: "amber", overallScore: 78, potentialGain: 0.12,
    audits: [
      { name: "Température Jour", applied: 21.5, targetMin: 20.2, targetMax: 21.0, unit: "°C", status: "high", impact: "Surchauffage inutile sous faible rayonnement (+0.7°C de trop)." },
      { name: "Température Nuit", applied: 16.5, targetMin: 15.0, targetMax: 15.8, unit: "°C", status: "high", impact: "Perte par respiration foliaire nocturne accrue." },
      { name: "Niveau CO2", applied: 500, targetMin: 550, targetMax: 650, unit: "ppm", status: "low", impact: "Photosynthèse bridée par manque de carbone." },
      { name: "Irrigation (EC)", applied: 2.8, targetMin: 2.9, targetMax: 3.2, unit: "mS", status: "low", impact: "Conductivité faible, légère dilution des sucres." }
    ],
    physiologicalExplanation: "Le faible ensoleillement du Jour 1 n'autorisait pas une température de 21.5°C le jour. Les stomates de la tomate étaient peu ouverts, la photosynthèse était donc limitée par le rayonnement. Maintenir la serre chaude a forcé la plante à brûler de l'énergie en respiration sans créer de matière sèche additionnelle.",
    actionPlan: [
      "Ajuster la consigne de chauffage diurne à 20.5°C sous rayonnement global < 800 J/cm².",
      "Abaisser la température de nuit (cible : 15.2°C) pour limiter les pertes en sucres de réserve.",
      "Pousser l'injection CO2 à 600 ppm en début de matinée."
    ]
  },
  {
    day: 2, status: "Ajustement requis", statusColor: "amber", overallScore: 72, potentialGain: 0.18,
    audits: [
      { name: "Température Jour", applied: 22.0, targetMin: 20.5, targetMax: 21.2, unit: "°C", status: "high", impact: "Excès thermique par rapport au rayonnement solaire." },
      { name: "Température Nuit", applied: 17.0, targetMin: 15.2, targetMax: 16.0, unit: "°C", status: "high", impact: "Respiration foliaire excessive." },
      { name: "Niveau CO2", applied: 550, targetMin: 650, targetMax: 750, unit: "ppm", status: "low", impact: "Perte de CO2 par fuite due à des ouvrants trop ouverts." },
      { name: "Irrigation (EC)", applied: 2.8, targetMin: 2.9, targetMax: 3.2, unit: "mS", status: "low", impact: "Légère baisse de la pression osmotique racinaire." }
    ],
    physiologicalExplanation: "Les ouvrants de la serre étaient ouverts à 35% pour évacuer l'humidité, ce qui a provoqué un 'balayage' du CO2 injecté vers l'extérieur. Le niveau de CO2 est resté bloqué à 550 ppm. Il aurait fallu restreindre la consigne d'aération ou travailler sur une ventilation mécanique sélective.",
    actionPlan: [
      "Limiter l'ouverture des fenêtres de toit à 20-25% lors de l'injection CO2.",
      "Fixer la consigne de température diurne à 21.0°C maximum.",
      "Augmenter l'EC de la solution nutritive à 3.0 mS."
    ]
  },
  {
    day: 3, status: "Optimal", statusColor: "emerald", overallScore: 94, potentialGain: 0.02,
    audits: [
      { name: "Température Jour", applied: 21.0, targetMin: 20.8, targetMax: 21.5, unit: "°C", status: "optimal", impact: "Consigne parfaitement alignée avec le rayonnement actif." },
      { name: "Température Nuit", applied: 16.0, targetMin: 15.0, targetMax: 16.0, unit: "°C", status: "optimal", impact: "Balance nocturne équilibrée." },
      { name: "Niveau CO2", applied: 600, targetMin: 650, targetMax: 800, unit: "ppm", status: "low", impact: "Un apport plus riche de CO2 aurait été bénéfique sous ce soleil." },
      { name: "Irrigation (EC)", applied: 2.9, targetMin: 2.9, targetMax: 3.3, unit: "mS", status: "optimal", impact: "EC correct pour maintenir la force végétative." }
    ],
    physiologicalExplanation: "Une excellente journée. Les rayonnements importants ont été valorisés par des températures maîtrisées. Les stomates sont restés ouverts, optimisant la transpiration de la plante et l'absorption des nutriments (notamment le Calcium pour éviter le cul noir). Seul le CO2 aurait pu être poussé pour obtenir une photosynthèse maximale.",
    actionPlan: [
      "Maintenir cette stratégie thermique sous rayonnement fort.",
      "Augmenter la consigne d'injection CO2 à 750 ppm sous fort rayonnement global."
    ]
  },
  {
    day: 4, status: "Alerte Climat", statusColor: "rose", overallScore: 61, potentialGain: 0.26,
    audits: [
      { name: "Température Jour", applied: 22.5, targetMin: 21.0, targetMax: 21.8, unit: "°C", status: "high", impact: "Dessèchement de la tête de la plante." },
      { name: "Température Nuit", applied: 17.5, targetMin: 15.2, targetMax: 16.2, unit: "°C", status: "high", impact: "Perte majeure par respiration foliaire la nuit (+1.3°C)." },
      { name: "Niveau CO2", applied: 500, targetMin: 600, targetMax: 700, unit: "ppm", status: "low", impact: "Carbonication faible sous rayonnement moyen." },
      { name: "Irrigation (EC)", applied: 2.7, targetMin: 2.9, targetMax: 3.3, unit: "mS", status: "low", impact: "EC trop bas induisant des fruits mous." }
    ],
    physiologicalExplanation: "Journée très pénalisante. Le surchauffage nocturne à 17.5°C a stimulé un étirement inutile des tiges au détriment du grossissement des fruits. De plus, l'EC bas (2.7) couplé à une température excessive a ramolli le collet des tomates, nuisant à leur conservation future.",
    actionPlan: [
      "Corriger immédiatement la température nocturne à 15.5°C maximum.",
      "Relever la conductivité (EC) de la solution nutritive à 3.1 mS pour raffermir les tissus cellulaires.",
      "Vérifier le fonctionnement des écrans thermiques pour isoler la serre la nuit."
    ]
  },
  {
    day: 5, status: "Optimal", statusColor: "emerald", overallScore: 92, potentialGain: 0.03,
    audits: [
      { name: "Température Jour", applied: 20.5, targetMin: 20.2, targetMax: 21.0, unit: "°C", status: "optimal", impact: "Excellent équilibre thermique." },
      { name: "Température Nuit", applied: 15.5, targetMin: 14.8, targetMax: 15.6, unit: "°C", status: "optimal", impact: "Perte d'énergie minimale la nuit." },
      { name: "Niveau CO2", applied: 650, targetMin: 700, targetMax: 850, unit: "ppm", status: "low", impact: "CO2 légèrement sous-optimal mais acceptable." },
      { name: "Irrigation (EC)", applied: 3.0, targetMin: 3.0, targetMax: 3.4, unit: "mS", status: "optimal", impact: "EC idéal pour l'assimilation." }
    ],
    physiologicalExplanation: "Le climat de la serre a été géré de manière très professionnelle. Les fruits se développent harmonieusement et la consommation de gaz est restée minimale grâce aux consignes basses de nuit.",
    actionPlan: [
      "Reconduire les consignes de température et d'irrigation.",
      "Tester une augmentation ponctuelle du CO2 sous 750 ppm les après-midi."
    ]
  },
  {
    day: 6, status: "Ajustement requis", statusColor: "amber", overallScore: 81, potentialGain: 0.10,
    audits: [
      { name: "Température Jour", applied: 21.8, targetMin: 20.5, targetMax: 21.2, unit: "°C", status: "high", impact: "Chauffage diurne excessif par temps couvert." },
      { name: "Température Nuit", applied: 16.2, targetMin: 15.0, targetMax: 15.8, unit: "°C", status: "high", impact: "Perte de gaz par température nocturne haute." },
      { name: "Niveau CO2", applied: 600, targetMin: 650, targetMax: 750, unit: "ppm", status: "low", impact: "Carbonication insuffisante." },
      { name: "Irrigation (EC)", applied: 3.0, targetMin: 3.1, targetMax: 3.4, unit: "mS", status: "low", impact: "Dilution nutritionnelle modérée." }
    ],
    physiologicalExplanation: "Sous un ciel couvert et pluvieux, la consigne jour de 21.8°C a forcé les chaudières à gaz à tourner à plein régime pour un apport de lumière naturelle très faible. La plante est entrée dans un état légèrement végétatif (tiges molles, feuilles larges) par manque d'équilibre lumière/température.",
    actionPlan: [
      "Abaisser la température jour de 21.8°C à 20.8°C les jours de pluie.",
      "Relever l'EC d'irrigation à 3.3 mS pour freiner la vigueur végétative et forcer l'alimentation des fruits."
    ]
  },
  {
    day: 7, status: "Ajustement requis", statusColor: "amber", overallScore: 79, potentialGain: 0.14,
    audits: [
      { name: "Température Jour", applied: 22.0, targetMin: 20.8, targetMax: 21.4, unit: "°C", status: "high", impact: "Climat trop sec, transpiration excessive." },
      { name: "Température Nuit", applied: 17.0, targetMin: 15.0, targetMax: 15.8, unit: "°C", status: "high", impact: "Respiration cellulaire accélérée la nuit." },
      { name: "Niveau CO2", applied: 500, targetMin: 600, targetMax: 750, unit: "ppm", status: "low", impact: "Efficacité photosynthétique amoindrie." },
      { name: "Irrigation (EC)", applied: 2.9, targetMin: 3.0, targetMax: 3.3, unit: "mS", status: "low", impact: "Légère sous-alimentation minérale." }
    ],
    physiologicalExplanation: "Le déploiement précoce de l'écran d'ombrage à 10% a privé les plants de tomates de 15% de la lumière PAR (photosynthétiquement active). En conséquence, la température élevée de 22°C a entraîné une transpiration stérile. Il aurait fallu garder l'écran replié et ajuster la ventilation.",
    actionPlan: [
      "Garder l'écran d'ombrage replié tant que le rayonnement global ne dépasse pas 450 W/m².",
      "Ajuster la température jour à 21.0°C.",
      "Stabiliser la consigne nuit à 15.5°C."
    ]
  },
  {
    day: 8, status: "Ajustement requis", statusColor: "amber", overallScore: 83, potentialGain: 0.08,
    audits: [
      { name: "Température Jour", applied: 21.0, targetMin: 20.8, targetMax: 21.5, unit: "°C", status: "optimal", impact: "Bonne régulation thermique." },
      { name: "Température Nuit", applied: 16.0, targetMin: 14.8, targetMax: 15.5, unit: "°C", status: "high", impact: "Légère surconsommation de chauffage la nuit." },
      { name: "Niveau CO2", applied: 600, targetMin: 700, targetMax: 850, unit: "ppm", status: "low", impact: "Manque de CO2 sous climat stable." },
      { name: "Irrigation (EC)", applied: 3.0, targetMin: 3.2, targetMax: 3.5, unit: "mS", status: "low", impact: "Risque de ramollissement du fruit par EC bas." }
    ],
    physiologicalExplanation: "La plante a bénéficié d'une température jour de 21°C très satisfaisante. Néanmoins, sous ce climat stable, un EC à 3.0 limite l'accumulation des solides solubles (sucres) dans le fruit, risquant de donner des tomates moins savoureuses. Un EC de 3.3 est fortement conseillé.",
    actionPlan: [
      "Relever l'EC d'irrigation à 3.3 ou 3.4 mS pour solidifier la pulpe.",
      "Pousser le CO2 à 750 ppm sous aération fermée (ouvrants < 15%)."
    ]
  },
  {
    day: 9, status: "Optimal", statusColor: "emerald", overallScore: 95, potentialGain: 0.01,
    audits: [
      { name: "Température Jour", applied: 20.2, targetMin: 20.0, targetMax: 20.8, unit: "°C", status: "optimal", impact: "Consigne froide parfaitement valorisée." },
      { name: "Température Nuit", applied: 15.0, targetMin: 14.5, targetMax: 15.2, unit: "°C", status: "optimal", impact: "Respiration nocturne minimale." },
      { name: "Niveau CO2", applied: 700, targetMin: 750, targetMax: 900, unit: "ppm", status: "optimal", impact: "Très bonne carbonication." },
      { name: "Irrigation (EC)", applied: 3.2, targetMin: 3.1, targetMax: 3.5, unit: "mS", status: "optimal", impact: "EC idéal pour le développement." }
    ],
    physiologicalExplanation: "Une journée exemplaire. Le froid extérieur ensoleillé a été converti en opportunité agronomique : ouvrants serrés permettant de saturer la serre en CO2 à 700 ppm sans gaspillage, tandis que la température froide diurne a maintenu les plants trapus et génératifs.",
    actionPlan: [
      "Reconduire exactement ce modèle de gestion pour les journées froides ensoleillées."
    ]
  },
  {
    day: 10, status: "Alerte Climat", statusColor: "rose", overallScore: 58, potentialGain: 0.32,
    audits: [
      { name: "Température Jour", applied: 23.0, targetMin: 21.5, targetMax: 22.2, unit: "°C", status: "high", impact: "Stress hydrique par fermeture stomatique." },
      { name: "Température Nuit", applied: 18.0, targetMin: 15.8, targetMax: 16.8, unit: "°C", status: "high", impact: "Respiration nocturne critique la nuit (+2.0°C de trop)." },
      { name: "Niveau CO2", applied: 450, targetMin: 550, targetMax: 650, unit: "ppm", status: "low", impact: "Carbonication faible, dilution par l'aération." },
      { name: "Irrigation (EC)", applied: 2.7, targetMin: 2.9, targetMax: 3.2, unit: "mS", status: "low", impact: "Stress de salinité inversé, drainage excessif." }
    ],
    physiologicalExplanation: "Climat extrême non géré. L'ouverture brusque des fenêtres de toit à 50% sous l'effet de la chaleur a provoqué une baisse brutale de l'humidité sous 40% (VPD > 1.8 kPa). Pour se protéger, la tomate a totalement fermé ses stomates, stoppant net la photosynthèse dès midi. De plus, la température nocturne à 18°C a gaspillé les sucres assimilés la veille.",
    actionPlan: [
      "Activer d'urgence la brumisation (cooling) pour maintenir le VPD sous 1.2 kPa.",
      "Ne pas dépasser 30% d'ouverture des ouvrants de toits sous vent sec.",
      "Programmer un abaissement de température de nuit à 16.0°C."
    ]
  }
];

export default function AranetUnifiedDashboard() {
  const [customPrivaMetrics, setCustomPrivaMetrics] = useState<any[]>([]);

  const allMetrics = useMemo(() => {
    return [...PLOTTABLE_METRICS, ...customPrivaMetrics];
  }, [customPrivaMetrics]);

  const [activeTab, setActiveTab] = useState<"agronomic" | "selection" | "charts" | "climatique">("charts");
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([
    "temp_rh_top_1",
    "temp_rh_top_2",
    "slab_ec_wc_8",
    "slab_weight_7"
  ]);
  const [hiddenKeysOnChart, setHiddenKeysOnChart] = useState<string[]>([]);

  // Priva Climate Computer States
  const [privaCatalog, setPrivaCatalog] = useState<any[]>([]);
  const [privaValues, setPrivaValues] = useState<Record<string, { value: number; time: string; unit: string }>>({});
  const [privaLoading, setPrivaLoading] = useState(false);
  const [privaError, setPrivaError] = useState<string | null>(null);
  const [privaChartError, setPrivaChartError] = useState<string | null>(null);
  const [privaSearch, setPrivaSearch] = useState("");
  const [selectedCompartment, setSelectedCompartment] = useState<string>("1");

  const fetchPrivaData = async () => {
    setPrivaLoading(true);
    setPrivaError(null);
    try {
      // 1. Fetch available datapoints catalog (fast, cached)
      const catRes = await fetch("/api/priva?action=datapoints");
      if (!catRes.ok) throw new Error("Impossible de charger le catalogue des capteurs Priva");
      const catData = await catRes.json();
      const list = catData.datapoints || [];
      setPrivaCatalog(list);

      // Define our key metrics we want to display on dashboard cards
      const keyMetrics = [
        { key: "temp_out", variableId: "00000214-0001-0000-0000-0000000042a9", deviceId: "VP9508", deviceGroupId: "none", name: "Température Extérieure", unit: "°C" },
        { key: "hum_out", variableId: "00000214-0001-0000-0000-00000000427e", deviceId: "VP9508", deviceGroupId: "none", name: "Humidité Extérieure", unit: "%" },
        { key: "irr_out", variableId: "00000214-0001-0000-0000-0000000042fd", deviceId: "VP9508", deviceGroupId: "none", name: "Rayonnement Solaire", unit: "W/m²" },
        { key: "wind_out", variableId: "00000214-0001-0000-0000-0000000042ad", deviceId: "VP9508", deviceGroupId: "none", name: "Vitesse du Vent", unit: "m/s" },
        { key: "heat_target", variableId: "0000002c-0001-0001-0000-0000000006e5", deviceId: "VP9508", deviceGroupId: "none", name: "Consigne Chauffage 1", unit: "°C" },
        { key: "heat_measured", variableId: "0000002c-0001-0001-0000-0000000006f6", deviceId: "VP9508", deviceGroupId: "none", name: "Chauffage 1 Mesuré", unit: "°C" },
        { key: "water_ret", variableId: "00000027-0001-0001-0000-000000000658", deviceId: "VP9508", deviceGroupId: "none", name: "Eau Retour Chauffage 1", unit: "°C" },
        { key: "water_calc", variableId: "00000027-0001-0001-0000-000000000651", deviceId: "VP9508", deviceGroupId: "none", name: "Eau Calculée Chauffage 1", unit: "°C" },
        { key: "hum_measured", variableId: "000002bb-0005-0000-0000-0000000050f2", deviceId: "VP9508", deviceGroupId: "none", name: "Humidité Mesurée 5", unit: "%" },
        { key: "hum_target", variableId: "000002bb-0005-0000-0000-00000000510d", deviceId: "VP9508", deviceGroupId: "none", name: "Consigne Limite Humidité 5", unit: "%" }
      ];

      // 2. Fetch the values for these key metrics (last 24 hours up to yesterday midnight)
      const yesterday = new Date();
      yesterday.setHours(0,0,0,0);
      const yesterdayStart = new Date(yesterday.getTime() - 24 * 3600 * 1000);

      const valRes = await fetch("/api/priva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: yesterdayStart.toISOString(),
          endTime: yesterday.toISOString(),
          datapoints: keyMetrics.map(m => ({
            variableId: m.variableId,
            deviceId: m.deviceId,
            deviceGroupId: m.deviceGroupId
          }))
        })
      });

      if (!valRes.ok) {
        const errJson = await valRes.json().catch(() => ({}));
        let errMsg = `Erreur Priva API (status ${valRes.status})`;
        if (errJson.details) {
          try {
            const nested = JSON.parse(errJson.details);
            if (nested.message) errMsg = nested.message;
            else if (nested.error) errMsg = nested.error;
          } catch {
            errMsg = errJson.details;
          }
        } else if (errJson.error) {
          errMsg = errJson.error;
        }
        throw new Error(errMsg);
      }

      const valData = await valRes.json();
      const series = valData.data || [];

      // Extract the last non-null value for each variable
      const valuesMap: Record<string, { value: number; time: string; unit: string }> = {};
      
      keyMetrics.forEach(m => {
        const matchSeries = series.find((s: any) => s.datapoint && s.datapoint.variableId === m.variableId);
        if (matchSeries && matchSeries.measurements && matchSeries.measurements.length > 0) {
          const nonNullValues = matchSeries.measurements.filter((v: any) => v.value !== null && v.value !== undefined);
          if (nonNullValues.length > 0) {
            const latest = nonNullValues[nonNullValues.length - 1];
            const parsedVal = parseFloat(latest.value);
            valuesMap[m.key] = {
              value: Number(parsedVal.toFixed(2)),
              time: new Date(latest.timestampUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              unit: m.unit
            };
          }
        }
      });

      setPrivaValues(valuesMap);
    } catch (err: any) {
      const isQuotaError = err.message && (
        err.message.toLowerCase().includes("quota") ||
        err.message.toLowerCase().includes("volume") ||
        err.message.toLowerCase().includes("429") ||
        err.message.toLowerCase().includes("403")
      );
      if (isQuotaError) {
        console.warn("fetchPrivaData rate limit:", err.message);
      } else {
        console.error("fetchPrivaData error:", err);
      }
      setPrivaError(err.message || "Erreur de connexion");
    } finally {
      setPrivaLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "climatique") {
      fetchPrivaData();
    }
  }, [activeTab]);

  // Configurations for each metric: unit ID, X-axis range, and Y-axis side
  const [metricConfigs, setMetricConfigs] = useState<{
    [key: string]: { unit: string; range: string; axis: "left" | "right" };
  }>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawDataMap, setRawDataMap] = useState<{ [key: string]: any[] }>({});

  const alignMode = "absolute";
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [yLeftMin, setYLeftMin] = useState<string>("");
  const [yLeftMax, setYLeftMax] = useState<string>("");
  const [yRightMin, setYRightMin] = useState<string>("");
  const [yRightMax, setYRightMax] = useState<string>("");
  const [plantsOnScale, setPlantsOnScale] = useState<number>(6);
  const [densityPerM2, setDensityPerM2] = useState<number>(2.5);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const getTodayStr = () => new Date().toISOString().split("T")[0];
  const getPastDateStr = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState<string>(getPastDateStr(2));
  const [endDate, setEndDate] = useState<string>(getPastDateStr(1));
  const [zoomTimeRange, setZoomTimeRange] = useState<{ min: number; max: number } | null>(null);

  const startDateTime = useMemo(() => {
    const d = new Date(startDate);
    if (isNaN(d.getTime())) {
      const fallback = new Date();
      fallback.setDate(fallback.getDate() - 7);
      fallback.setHours(0, 0, 0, 0);
      return fallback;
    }
    d.setHours(0, 0, 0, 0);
    return d;
  }, [startDate]);

  const endDateTime = useMemo(() => {
    const d = new Date(endDate);
    if (isNaN(d.getTime())) {
      const fallback = new Date();
      fallback.setHours(23, 59, 59, 999);
      return fallback;
    }
    d.setHours(23, 59, 59, 999);
    return d;
  }, [endDate]);

  const apiDaysRequested = useMemo(() => {
    const now = new Date();
    const startMs = startDateTime.getTime();
    const endMs = endDateTime.getTime();
    if (isNaN(startMs) || isNaN(endMs)) return 7;
    const diffTime = Math.abs(now.getTime() - startMs);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(30, Math.max(1, isNaN(diffDays) ? 7 : diffDays));
  }, [startDateTime, endDateTime]);

  const handleStartDateChange = (dateStr: string) => {
    if (!dateStr) return;
    const newStart = new Date(dateStr);
    newStart.setHours(0, 0, 0, 0);
    const currentEnd = new Date(endDate);
    currentEnd.setHours(23, 59, 59, 999);

    if (newStart > currentEnd) {
      setEndDate(dateStr);
    } else {
      const limitDate = new Date(currentEnd);
      limitDate.setDate(limitDate.getDate() - 30);
      if (newStart < limitDate) {
        const newEnd = new Date(newStart);
        newEnd.setDate(newEnd.getDate() + 30);
        setEndDate(newEnd.toISOString().split("T")[0]);
      }
    }
    setStartDate(dateStr);
  };

  const handleEndDateChange = (dateStr: string) => {
    if (!dateStr) return;
    const newEnd = new Date(dateStr);
    newEnd.setHours(23, 59, 59, 999);
    const currentStart = new Date(startDate);
    currentStart.setHours(0, 0, 0, 0);

    if (newEnd < currentStart) {
      setStartDate(dateStr);
    } else {
      const limitDate = new Date(currentStart);
      limitDate.setDate(limitDate.getDate() + 30);
      if (newEnd > limitDate) {
        const newStart = new Date(newEnd);
        newStart.setDate(newStart.getDate() - 30);
        setStartDate(newStart.toISOString().split("T")[0]);
      }
    }
    setEndDate(dateStr);
  };

  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount and initialize configurations
  useEffect(() => {
    let activeConfigs: any = {};
    let savedCustom: any[] = [];
    try {
      const savedKeys = localStorage.getItem("aranet_selected_keys");
      if (savedKeys) {
        setSelectedKeys(JSON.parse(savedKeys));
      }
      
      const savedConfigs = localStorage.getItem("aranet_metric_configs");
      if (savedConfigs) {
        activeConfigs = JSON.parse(savedConfigs);
      }
      const savedPlants = localStorage.getItem("aranet_plants_on_scale");
      if (savedPlants) {
        setPlantsOnScale(Number(savedPlants));
      }
      const savedDensity = localStorage.getItem("aranet_density_per_m2");
      if (savedDensity) {
        setDensityPerM2(Number(savedDensity));
      }
      const savedCustomPriva = localStorage.getItem("aranet_custom_priva_metrics");
      if (savedCustomPriva) {
        savedCustom = JSON.parse(savedCustomPriva);
        setCustomPrivaMetrics(savedCustom);
      }
    } catch (e) {
      console.error("Failed to load saved configurations", e);
    }

    // Merge/initialize missing configs for both built-in and saved custom metrics
    const combined = [...PLOTTABLE_METRICS, ...savedCustom];
    combined.forEach(m => {
      if (!activeConfigs[m.key]) {
        activeConfigs[m.key] = {
          unit: m.units[0]?.id || "custom",
          range: "24h",
          axis: "left"
        };
      }
    });

    setMetricConfigs(activeConfigs);
    setIsLoaded(true);
  }, []);

  // Save to localStorage when selectedKeys or metricConfigs change (only after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("aranet_selected_keys", JSON.stringify(selectedKeys));
      localStorage.setItem("aranet_metric_configs", JSON.stringify(metricConfigs));
      localStorage.setItem("aranet_plants_on_scale", String(plantsOnScale));
      localStorage.setItem("aranet_density_per_m2", String(densityPerM2));
      localStorage.setItem("aranet_custom_priva_metrics", JSON.stringify(customPrivaMetrics));
    } catch (e) {
      console.error("Failed to save configurations", e);
    }
  }, [selectedKeys, metricConfigs, isLoaded, plantsOnScale, densityPerM2, customPrivaMetrics]);

  const toggleKey = (key: string) => {
    setSelectedKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Helper to toggle custom datapoint from full catalog
  const toggleCatalogDatapoint = (dp: any) => {
    const builtIn = PLOTTABLE_METRICS.find(m => m.variableId === dp.variableId);
    const key = builtIn ? builtIn.key : `priva_custom_${dp.variableId}`;

    if (selectedKeys.includes(key)) {
      setSelectedKeys(prev => prev.filter(k => k !== key));
    } else {
      if (!builtIn) {
        const colors = ["#ec4899", "#f43f5e", "#a855f7", "#6366f1", "#06b6d4", "#14b8a6", "#10b981", "#84cc16", "#eab308"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const newMetric = {
          key,
          name: `Priva - ${dp.name}`,
          category: `Priva - Personnalisés`,
          isPriva: true,
          variableId: dp.variableId,
          deviceId: dp.deviceId,
          deviceGroupId: dp.deviceGroupId || "none",
          color: randomColor,
          units: [{ id: dp.unit || "custom", name: dp.unit || "N/A" }]
        };
        
        if (!customPrivaMetrics.some(m => m.key === key)) {
          setCustomPrivaMetrics(prev => [...prev, newMetric]);
        }
      }
      setSelectedKeys(prev => [...prev, key]);
    }
  };

  const isDatapointSelected = (dp: any) => {
    const builtIn = PLOTTABLE_METRICS.find(m => m.variableId === dp.variableId);
    const key = builtIn ? builtIn.key : `priva_custom_${dp.variableId}`;
    return selectedKeys.includes(key);
  };

  const updateMetricConfig = (key: string, field: string, value: any) => {
    setMetricConfigs(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
    if (field === "unit") {
      fetchActiveData();
    }
  };

  const applyGlobalSmoothing = (smooth: boolean) => {
    setMetricConfigs(prev => {
      const next = { ...prev };
      allMetrics.forEach(m => {
        next[m.key] = {
          ...next[m.key],
          smooth: smooth
        };
      });
      return next;
    });
  };

  const applyGlobalWindowSize = (size: number) => {
    setMetricConfigs(prev => {
      const next = { ...prev };
      allMetrics.forEach(m => {
        next[m.key] = {
          ...next[m.key],
          sgWindow: size
        };
      });
      return next;
    });
  };

  const fetchActiveData = async () => {
    if (selectedKeys.length === 0) {
      setRawDataMap({});
      return;
    }
    setLoading(true);
    setError(null);
    setPrivaChartError(null);
    try {
      const aranetKeys = selectedKeys.filter(k => !k.startsWith("priva_"));
      const privaKeys = selectedKeys.filter(k => k.startsWith("priva_"));

      // 1. Fetch Aranet data in parallel
      const aranetPromises = aranetKeys.map(async (key) => {
        const m = allMetrics.find(item => item.key === key)!;
        const config = metricConfigs[key] || { unit: m.units[0].id, range: "24h", axis: "left" };
        
        const res = await fetch(
          `/api/aranet?action=history&sensor=${m.sensorId}&days=${apiDaysRequested}&unit=${config.unit}`
        );
        if (!res.ok) throw new Error(`Erreur pour ${m.name}`);
        const resData = await res.json();
        if (!resData.success) throw new Error(resData.error || `Erreur pour ${m.name}`);
        
        let readings = (resData.readings || []).filter((r: any) => r.metric === m.metricId);

        // Filter readings client-side based on the selected date range
        const startMs = startDateTime.getTime();
        const endMs = endDateTime.getTime();
        readings = readings.filter((r: any) => {
          const t = new Date(r.time).getTime();
          return t >= startMs && t <= endMs;
        });

        if (key === "plant_weight_gain") {
          // Group readings by local day to calculate daily gain relative to midnight
          const readingsByDay: { [dateStr: string]: any[] } = {};
          
          readings.forEach((r: any) => {
            const d = new Date(r.time);
            const localDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            if (!readingsByDay[localDateStr]) {
              readingsByDay[localDateStr] = [];
            }
            readingsByDay[localDateStr].push(r);
          });

          const computedReadings: any[] = [];
          
          Object.keys(readingsByDay).forEach((dateStr) => {
            const dayReadings = readingsByDay[dateStr];
            dayReadings.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
            
            const baselineObj = dayReadings[0];
            const baseline = baselineObj ? baselineObj.value : 0;

            dayReadings.forEach((r) => {
              computedReadings.push({
                ...r,
                value: r.value - baseline // cumulative weight gain relative to midnight
              });
            });
          });

          computedReadings.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
          readings = computedReadings;
        }

        return {
          key,
          readings
        };
      });

      // 2. Fetch Priva data in a single batch
      let privaResults: { key: string; readings: any[] }[] = [];
      if (privaKeys.length > 0) {
        const privaMetricsToQuery = privaKeys.map(k => {
          const m = allMetrics.find(item => item.key === k)!;
          return {
            variableId: m.variableId,
            deviceId: m.deviceId,
            deviceGroupId: m.deviceGroupId
          };
        });

        // Ensure we cap the end date to avoid today midnight 403 restriction
        let adjustedStart = startDateTime;
        let adjustedEnd = endDateTime;

        const todayMidnight = new Date();
        todayMidnight.setUTCHours(0, 0, 0, 0);
        const maxEndAllowed = new Date(todayMidnight.getTime() - 60000); // 1 minute before today midnight UTC

        if (adjustedEnd.getTime() > maxEndAllowed.getTime()) {
          adjustedEnd = maxEndAllowed;
        }

        // Ensure we cap the start date to avoid rolling history 403 restriction (max 5 days ago)
        const fiveDaysAgo = new Date(todayMidnight.getTime() - 5 * 24 * 3600 * 1000);
        if (adjustedStart.getTime() < fiveDaysAgo.getTime()) {
          adjustedStart = fiveDaysAgo;
        }

        if (adjustedStart.getTime() >= adjustedEnd.getTime()) {
          adjustedStart = new Date(adjustedEnd.getTime() - 24 * 3600 * 1000);
        }

        const cacheKey = `${adjustedStart.toISOString()}_${adjustedEnd.toISOString()}_${privaKeys.sort().join(",")}`;
        let series = [];
        let hasCache = false;

        let cachedData = privaCacheRef.current[cacheKey];
        if (!cachedData) {
          try {
            const sessionData = sessionStorage.getItem("priva_query_cache_" + cacheKey);
            if (sessionData) {
              cachedData = JSON.parse(sessionData);
              privaCacheRef.current[cacheKey] = cachedData;
            }
          } catch (e) {
            console.error("Failed to read sessionStorage query cache:", e);
          }
        }

        if (cachedData) {
          series = cachedData;
          hasCache = true;
          console.log("Serving Priva historical data from client-side cache for key:", cacheKey);
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (endDateTime.getTime() >= today.getTime()) {
            setPrivaChartError("Info : L'API Priva n'autorise pas l'accès aux données de la journée en cours en temps réel. Les courbes s'arrêtent à hier 23h59.");
          }
        } else if (Date.now() < privaLockoutExpiryRef.current) {
          hasCache = true;
          const remainingSecs = Math.ceil((privaLockoutExpiryRef.current - Date.now()) / 1000);
          setPrivaChartError(`Info : Limite d'appels API atteinte. Actualisation automatique en pause (cooldown actif de ${remainingSecs}s pour laisser recharger le quota).`);
        }

        if (!hasCache) {
          const valRes = await fetch("/api/priva", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              startTime: adjustedStart.toISOString(),
              endTime: adjustedEnd.toISOString(),
              datapoints: privaMetricsToQuery
            })
          });

          if (!valRes.ok) {
            const errDetail = await valRes.json().catch(() => ({}));
            
            if (valRes.status === 429 || valRes.status === 403) {
              privaLockoutExpiryRef.current = Date.now() + 60000; // Lock out for 60 seconds
              console.warn("Priva API Quota Exceeded (429/403). Cooldown active.");
            } else {
              console.error("Priva API Error in fetchActiveData:", valRes.status, errDetail);
            }

            let errMsg = errDetail.error || "Erreur de connexion";
            if (errDetail.details) {
              try {
                const nested = JSON.parse(errDetail.details);
                if (nested.message) errMsg = nested.message;
                else if (nested.error) errMsg = nested.error;
              } catch {
                errMsg = errDetail.details;
              }
            }
            setPrivaChartError(`Données Priva indisponibles (Status ${valRes.status}) : ${errMsg}`);
          } else {
            const valData = await valRes.json();
            series = valData.data || [];
            privaCacheRef.current[cacheKey] = series;
            try {
              sessionStorage.setItem("priva_query_cache_" + cacheKey, JSON.stringify(series));
            } catch (e) {
              console.error("Failed to write sessionStorage query cache:", e);
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (endDateTime.getTime() >= today.getTime()) {
              setPrivaChartError("Info : L'API Priva n'autorise pas l'accès aux données de la journée en cours en temps réel. Les courbes s'arrêtent à hier 23h59.");
            }
          }
        }

        privaResults = privaKeys.map(key => {
          const m = allMetrics.find(item => item.key === key)!;
          const matchSeries = series.find((s: any) => s.datapoint && s.datapoint.variableId === m.variableId);
          const readings = matchSeries && matchSeries.measurements ? matchSeries.measurements
            .map((v: any) => ({
              time: v.timestampUtc,
              value: parseFloat(v.value)
            }))
            .filter((v: any) => !isNaN(v.value)) : [];

          return {
            key,
            readings
          };
        });
      }

      const aranetResults = await Promise.all(aranetPromises);
      const results = [...aranetResults, ...privaResults];

      const dataMap: { [key: string]: any[] } = {};
      results.forEach(res => {
        dataMap[res.key] = res.readings;
      });
      
      setRawDataMap(dataMap);
    } catch (err: any) {
      console.error(err);
      setError("Échec du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  // Debounce ref to deduplicate rapid multiple fetches on state change
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const privaCacheRef = useRef<Record<string, any>>({});
  const privaLockoutExpiryRef = useRef<number>(0);

  // Re-fetch when selections, configurations, or date range changes (debounced by 300ms)
  useEffect(() => {
    if (Object.keys(metricConfigs).length > 0) {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      fetchTimeoutRef.current = setTimeout(() => {
        fetchActiveData();
      }, 300);
    }
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [selectedKeys, startDate, endDate]);

  // Debounced state update to make Brush dragging butter-smooth
  const updateZoomTimeRangeDebounced = useMemo(() => {
    let timer: NodeJS.Timeout;
    return (range: { min: number; max: number } | null) => {
      clearTimeout(timer);
      if (range === null) {
        setZoomTimeRange(null);
        return;
      }
      timer = setTimeout(() => {
        setZoomTimeRange(range);
      }, 200); // 200ms debounce
    };
  }, []);

  // Reset zoom time range when dates change
  useEffect(() => {
    updateZoomTimeRangeDebounced(null);
  }, [startDate, endDate]);

  // Merge datasets into a single chart structure based on absolute timestamp alignment
  const chartData = useMemo(() => {
    if (Object.keys(rawDataMap).length === 0) return [];

    const step = 1; // Precision de 1 minute pour le maximum de details

    // Apply smoothing if enabled for each sensor
    const smoothedDataMap: { [key: string]: { readings: any[], rawValues: number[] } } = {};
    selectedKeys.forEach((key) => {
      let readings = rawDataMap[key] || [];
      // Clean up values: filter out null, undefined or non-numeric values (NaN)
      readings = readings.filter((r: any) => r && r.value !== null && r.value !== undefined && !isNaN(Number(r.value)));
      
      const config = metricConfigs[key];
      const isSmooth = config?.smooth === true || config?.smooth === "true";
      let windowSize = Number(config?.sgWindow || 9);
      
      // Savitzky-Golay requires an odd window size
      if (windowSize % 2 === 0) {
        windowSize += 1;
      }

      const rawValues = readings.map((r: any) => {
        if (key === "plant_weight_gain") {
          return (r.value / plantsOnScale) * densityPerM2;
        }
        return r.value;
      });

      if (isSmooth && readings.length > 0) {
        const smoothedValues = applySavitzkyGolay(rawValues, windowSize, 2);
        smoothedDataMap[key] = {
          readings: readings.map((r: any, idx: number) => ({
            ...r,
            value: smoothedValues[idx]
          })),
          rawValues
        };
      } else {
        smoothedDataMap[key] = {
          readings: readings.map((r: any, idx: number) => ({
            ...r,
            value: rawValues[idx]
          })),
          rawValues
        };
      }
    });

    const bins: { [key: number]: any } = {};

    selectedKeys.forEach((key) => {
      const entry = smoothedDataMap[key];
      const readings = entry?.readings || [];
      readings.forEach((r, idx) => {
        const date = new Date(r.time);
        if (isNaN(date.getTime())) return;
        
        // Align minutes to the nearest step to group all sensors into matching intervals
        const mins = date.getMinutes();
        const binnedMins = Math.round(mins / step) * step;
        date.setMinutes(binnedMins, 0, 0);
        const timeMs = date.getTime();

        if (!bins[timeMs]) {
          bins[timeMs] = {
            time: timeMs,
            formattedTime: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            formattedDate: date.toLocaleDateString([], { day: '2-digit', month: '2-digit' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        bins[timeMs][key] = r.value;
        bins[timeMs][`${key}_raw`] = entry.rawValues[idx];
      });
    });

    return Object.values(bins).sort((a: any, b: any) => a.time - b.time);
  }, [rawDataMap, selectedKeys, metricConfigs, plantsOnScale, densityPerM2, apiDaysRequested, zoomTimeRange]);

  // Dynamic Advanced Agronomic analysis based on mapped chart data to calculate loss of cumulative gain
  const dynamicAgronomicData = useMemo(() => {
    if (chartData.length === 0) return [];
    
    // Group chartData by date string
    const daysMap: { [dateStr: string]: any[] } = {};
    chartData.forEach(row => {
      const d = new Date(row.time);
      const dateStr = d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
      if (!daysMap[dateStr]) daysMap[dateStr] = [];
      daysMap[dateStr].push(row);
    });

    return Object.keys(daysMap).map((dateStr, index) => {
      const rows = daysMap[dateStr];
      const audits: any[] = [];
      let lostPercent = 0;
      let score = 100;
      const physiologicalReasons: string[] = [];
      const actionPlans: string[] = [];

      // Averages and stats helpers
      const getAverage = (key: string) => {
        const valid = rows.filter(r => r[key] !== undefined && r[key] !== null && !isNaN(r[key]));
        if (valid.length === 0) return null;
        return valid.reduce((sum, r) => sum + r[key], 0) / valid.length;
      };

      const getStatsForTimeRange = (key: string, startHour: number, endHour: number) => {
        const valid = rows.filter(r => {
          if (r[key] === undefined || r[key] === null || isNaN(r[key])) return false;
          const d = new Date(r.time);
          const hr = d.getHours();
          return hr >= startHour && hr < endHour;
        });
        if (valid.length === 0) return null;
        const avg = valid.reduce((sum, r) => sum + r[key], 0) / valid.length;
        const values = valid.map(r => r[key]);
        return { avg, max: Math.max(...values), min: Math.min(...values) };
      };

      // Extract basic averages
      const tempKeys = selectedKeys.filter(k => k.toLowerCase().includes("temp") && !k.toLowerCase().includes("out") && !k.toLowerCase().includes("target") && !k.toLowerCase().includes("water"));
      const tempOutKeys = selectedKeys.filter(k => k.toLowerCase().includes("temp") && (k.toLowerCase().includes("out") || k.toLowerCase().includes("ext")));
      const vpdKeys = selectedKeys.filter(k => k.toLowerCase().includes("vpd"));
      const rhKeys = selectedKeys.filter(k => (k.toLowerCase().includes("rh") || k.toLowerCase().includes("humidity") || k.toLowerCase().includes("hum_measured")) && !k.toLowerCase().includes("out"));
      const wcKeys = selectedKeys.filter(k => k.toLowerCase().includes("wc") || k.toLowerCase().includes("vwc"));
      const radKeys = selectedKeys.filter(k => k.toLowerCase().includes("irr_out") || k.toLowerCase().includes("radiation") || k.toLowerCase().includes("solar") || k.toLowerCase().includes("rayonnement"));
      const windKeys = selectedKeys.filter(k => k.toLowerCase().includes("wind"));

      const tempAvg = tempKeys.length > 0 ? getAverage(tempKeys[0]) : null;
      const tempOutAvg = tempOutKeys.length > 0 ? getAverage(tempOutKeys[0]) : null;
      const vpdAvg = vpdKeys.length > 0 ? getAverage(vpdKeys[0]) : null;
      const rhAvg = rhKeys.length > 0 ? getAverage(rhKeys[0]) : null;
      const wcAvg = wcKeys.length > 0 ? getAverage(wcKeys[0]) : null;
      const radAvg = radKeys.length > 0 ? getAverage(radKeys[0]) : null;
      const windAvg = windKeys.length > 0 ? getAverage(windKeys[0]) : null;

      // 1. ADVANCED INDICATOR: Light/Temperature Ratio (Rapport Lumière / Température 24h)
      if (tempAvg !== null && radAvg !== null) {
        const expectedTemp = 18.0 + (radAvg / 100.0) * 1.5;
        if (radAvg < 100 && tempAvg > 21.0) {
          lostPercent += 15;
          score -= 15;
          audits.push({
            name: "Rapport Lumière / Température",
            applied: Number(tempAvg.toFixed(1)),
            targetMin: 18.0,
            targetMax: 19.8,
            unit: "°C (24h)",
            status: "high",
            impact: `Température trop élevée (${tempAvg.toFixed(1)}°C) pour le faible rayonnement disponible (${Math.round(radAvg)} W/m²).`,
            origin: "Technique (Chauffage excessif sous ciel voilé)"
          });
          physiologicalReasons.push("Déséquilibre Lumière/Température : Le faible rayonnement limite la photosynthèse. Maintenir une température moyenne élevée (>21°C) provoque une respiration excessive de la plante, épuisant ses réserves de sucres et affaiblissant l'apex (tête fine, baisse de vigueur).");
          actionPlans.push("Ajuster la consigne de chauffage moyenne 24h à la baisse sous faible ensoleillement (viser 18.5 - 19.5°C).");
        } else if (radAvg > 180 && tempAvg < 19.5) {
          lostPercent += 10;
          score -= 10;
          audits.push({
            name: "Rapport Lumière / Température",
            applied: Number(tempAvg.toFixed(1)),
            targetMin: 21.0,
            targetMax: 22.8,
            unit: "°C (24h)",
            status: "low",
            impact: `Température trop basse (${tempAvg.toFixed(1)}°C) pour valoriser le fort rayonnement (${Math.round(radAvg)} W/m²).`,
            origin: "Technique (Consignes thermiques trop froides par grand soleil)"
          });
          physiologicalReasons.push("Déséquilibre Lumière/Température : Le fort ensoleillement offre un potentiel de croissance élevé. Une température trop basse bloque la plante dans un état excessivement végétatif et ralentit inutilement la maturation des fruits.");
          actionPlans.push("Laisser monter la consigne thermique de jour sous forte luminosité pour accélérer le développement des grappes.");
        } else {
          audits.push({
            name: "Rapport Lumière / Température",
            applied: Number(tempAvg.toFixed(1)),
            targetMin: Number((expectedTemp - 1.2).toFixed(1)),
            targetMax: Number((expectedTemp + 1.2).toFixed(1)),
            unit: "°C (24h)",
            status: "optimal",
            impact: "Rapport Lumière/Température optimal. Excellent équilibre végétatif/génératif.",
            origin: "Optimal"
          });
        }
      } else {
        audits.push({ name: "Équilibre Lumière/Temp (Inactif)", applied: null, status: "missing", impact: "Sélectionnez un capteur de rayonnement extérieur (Rayonnement Solaire) et de température intérieure pour auditer ce rapport.", origin: "-" });
      }

      // 2. ADVANCED INDICATOR: Day/Night DIF (Balance Générative / Végétative)
      if (tempKeys.length > 0) {
        const dayStats = getStatsForTimeRange(tempKeys[0], 8, 18);
        const nightStats = getStatsForTimeRange(tempKeys[0], 21, 6);
        if (dayStats && nightStats) {
          const dif = dayStats.avg - nightStats.avg;
          if (dif > 8.0) {
            lostPercent += 12;
            score -= 12;
            audits.push({
              name: "Écart Jour/Nuit (DIF)",
              applied: Number(dif.toFixed(1)),
              targetMin: 4.0,
              targetMax: 6.5,
              unit: "°C",
              status: "high",
              impact: `DIF excessif (+${dif.toFixed(1)}°C). Étirement excessif des entrenœuds.`,
              origin: "Technique (Nuit trop froide combinée à des pointes de chaleur diurnes)"
            });
            physiologicalReasons.push("DIF excessif : Un écart jour/nuit supérieur à 8°C étire anormalement les entrenœuds de la tige et affine la tête. Les fleurs s'affaiblissent, ce qui augmente le risque de coulure.");
            actionPlans.push("Rehausser légèrement la température minimale nocturne ou abaisser la consigne de ventilation de jour.");
          } else if (dif < 2.0) {
            lostPercent += 8;
            score -= 8;
            audits.push({
              name: "Écart Jour/Nuit (DIF)",
              applied: Number(dif.toFixed(1)),
              targetMin: 4.0,
              targetMax: 6.5,
              unit: "°C",
              status: "low",
              impact: `DIF insuffisant (+${dif.toFixed(1)}°C). Plante trop végétative.`,
              origin: "Technique (Températures nocturnes trop élevées)"
            });
            physiologicalReasons.push("DIF faible : Un climat trop homogène jour/nuit rend la plante excessivement végétative (grosses feuilles sombres, retard de floraison, manque d'énergie dirigée vers les fruits).");
            actionPlans.push("Programmer une baisse thermique (pré-nuit) plus rapide en fin d'après-midi pour stimuler la générativité.");
          } else {
            audits.push({
              name: "Écart Jour/Nuit (DIF)",
              applied: Number(dif.toFixed(1)),
              targetMin: 4.0,
              targetMax: 6.5,
              unit: "°C",
              status: "optimal",
              impact: "DIF équilibré. Port de plante et vigueur idéaux.",
              origin: "Optimal"
            });
          }
        }
      } else {
        audits.push({ name: "Écart DIF Jour/Nuit (Inactif)", applied: null, status: "missing", impact: "Sélectionnez la température intérieure pour surveiller l'équilibre DIF.", origin: "-" });
      }

      // 3. ADVANCED INDICATOR: Night VPD (Root Pressure Audit)
      if (vpdKeys.length > 0) {
        const nightVPD = getStatsForTimeRange(vpdKeys[0], 22, 5);
        if (nightVPD) {
          if (nightVPD.avg < 0.35) {
            lostPercent += 15;
            score -= 15;
            audits.push({
              name: "VPD Nocturne (Pression Racinaire)",
              applied: Number(nightVPD.avg.toFixed(2)),
              targetMin: 0.45,
              targetMax: 0.75,
              unit: "kPa",
              status: "low",
              impact: `VPD de nuit critique (${nightVPD.avg.toFixed(2)} kPa). Risque d'éclatement des fruits.`,
              origin: "Technique (Ventilation fermée et absence de chauffage nocturne minimum)"
            });
            physiologicalReasons.push("VPD nocturne bas : Lorsque l'air de nuit est saturé en humidité, la transpiration foliaire s'arrête alors que l'absorption racinaire se poursuit. Cette surpression hydraulique fait éclater la cuticule des fruits (fendillement) et induit des nécroses apicales (carence en calcium aux apex).");
            actionPlans.push("Activer une température minimale de tuyau de chauffage nocturne avec une légère ouverture des ouvrants pour évacuer l'humidité.");
          } else {
            audits.push({
              name: "VPD Nocturne (Pression Racinaire)",
              applied: Number(nightVPD.avg.toFixed(2)),
              targetMin: 0.45,
              targetMax: 0.75,
              unit: "kPa",
              status: "optimal",
              impact: "Pression racinaire nocturne saine et équilibrée.",
              origin: "Optimal"
            });
          }
        }
      } else {
        audits.push({ name: "VPD Nocturne (Inactif)", applied: null, status: "missing", impact: "Sélectionnez le VPD pour diagnostiquer le risque d'éclatement des fruits.", origin: "-" });
      }

      // 4. ADVANCED INDICATOR: Substrate Dry-Back (Dessèchement nocturne du pain)
      if (wcKeys.length > 0) {
        const eveStats = getStatsForTimeRange(wcKeys[0], 17, 19);
        const morStats = getStatsForTimeRange(wcKeys[0], 5, 7);
        if (eveStats && morStats) {
          const dryBack = eveStats.avg - morStats.avg;
          if (dryBack < 6.0) {
            lostPercent += 18;
            score -= 18;
            audits.push({
              name: "Ressuyage Nocturne (Dry-Back)",
              applied: Number(dryBack.toFixed(1)),
              targetMin: 8.0,
              targetMax: 12.0,
              unit: "%",
              status: "low",
              impact: `Dry-back insuffisant (${dryBack.toFixed(1)}%). Risque d'asphyxie des racines.`,
              origin: "Technique (Irrigations terminées trop tard en fin de journée)"
            });
            physiologicalReasons.push("Dry-back faible : Le substrat reste trop saturé en eau pendant la nuit. Les racines s'asphyxient temporairement par manque d'oxygène, favorisant le Pythium et affaiblissant la capacité d'absorption le lendemain matin.");
            actionPlans.push("Avancer l'heure d'arrêt de la dernière irrigation (viser 2h à 3h avant le coucher du soleil).");
          } else if (dryBack > 14.0) {
            lostPercent += 15;
            score -= 15;
            audits.push({
              name: "Ressuyage Nocturne (Dry-Back)",
              applied: Number(dryBack.toFixed(1)),
              targetMin: 8.0,
              targetMax: 12.0,
              unit: "%",
              status: "high",
              impact: `Dry-back excessif (${dryBack.toFixed(1)}%). Stress hydrique et accumulation d'EC.`,
              origin: "Technique (Irrigations arrêtées trop tôt)"
            });
            physiologicalReasons.push("Dry-back fort : Un égouttage nocturne supérieur à 14% indique un stress hydrique de fin de nuit. Les poils racinaires sèchent et la concentration en sels (EC) augmente trop vite dans le pain.");
            actionPlans.push("Retarder l'heure du dernier arrosage ou augmenter l'apport hydrique nocturne si nécessaire.");
          } else {
            audits.push({
              name: "Ressuyage Nocturne (Dry-Back)",
              applied: Number(dryBack.toFixed(1)),
              targetMin: 8.0,
              targetMax: 12.0,
              unit: "%",
              status: "optimal",
              impact: "Dry-back nocturne optimal (bon équilibre air/eau dans le substrat).",
              origin: "Optimal"
            });
          }
        }
      } else {
        audits.push({ name: "Ressuyage Pain Dry-Back (Inactif)", applied: null, status: "missing", impact: "Sélectionnez le Slab WC pour mesurer le ressuyage nocturne (dry-back).", origin: "-" });
      }

      // 5. External Environment safety checks (Ventilation vs outside wind drafts)
      if (tempAvg !== null && tempOutAvg !== null) {
        if (tempAvg > 22.0) {
          const isOutsideHotter = tempOutAvg > tempAvg;
          if (isOutsideHotter) {
            physiologicalReasons.push(`Alerte Canicule : La température intérieure moyenne est élevée (${tempAvg.toFixed(1)}°C), mais l'air extérieur l'est encore plus (${tempOutAvg.toFixed(1)}°C). Ouvrir les ouvrants amènerait un flux thermique externe massif qui surchaufferait le dôme de culture.`);
            actionPlans.push("Fermer ou restreindre fortement les ouvrants pour bloquer l'air extérieur chaud.");
            actionPlans.push("Activer la brumisation (cooling) pour générer un abaissement de température par évaporation d'eau.");
            actionPlans.push("Déployer les écrans d'ombrage pour réduire le rayonnement solaire incident.");
          } else if (windAvg !== null && windAvg > 4.5) {
            physiologicalReasons.push(`Alerte Vent Fort : La serre surchauffe (${tempAvg.toFixed(1)}°C) sous vent fort (${windAvg.toFixed(1)} m/s). Ouvrir les ouvrants du côté exposé au vent (côté au-vent) créerait des courants d'air froid violents et stresserait les feuilles.`);
            actionPlans.push("Ouvrir uniquement les ouvrants du côté opposé au vent (côté sous-vent) pour aspirer l'air chaud par dépression sans créer de courant d'air direct.");
          }
        }
      }

      // Compute radiation sum in J/cm² (1 W/m² avg over 24h = 8.64 J/cm²/day)
      const radiationSumJcm2 = radAvg !== null ? Math.round(radAvg * 8.64) : 1200;

      // Yield potential under optimal conditions (1g of fruit per 100 J/cm² = 0.01 g/m² per J/cm²)
      const yieldPotentialGrams = radiationSumJcm2 * 0.01;

      // Lost potential in g/m² due to poor crop steering
      const lostGainGrams = yieldPotentialGrams * (lostPercent / 100);

      if (physiologicalReasons.length === 0) {
        physiologicalReasons.push("L'équilibre thermique, le rapport lumière/température et la pression racinaire nocturne sont optimaux. La tomate exprime son plein potentiel végétatif et génératif.");
      }
      if (actionPlans.length === 0) {
        actionPlans.push("Maintenir la stratégie d'irrigation et de régulation climatique en cours.");
      }

      const overallStatus = score >= 90 ? "Optimal" : score >= 75 ? "Ajustement requis" : "Alerte Climat";
      const statusColor = score >= 90 ? "emerald" : score >= 75 ? "amber" : "rose";

      return {
        dateStr,
        day: index + 1,
        status: overallStatus,
        statusColor,
        overallScore: Math.max(10, score),
        potentialGain: Number(lostGainGrams.toFixed(1)),
        radiationSumJcm2,
        yieldPotentialGrams: Number(yieldPotentialGrams.toFixed(1)),
        lostPercent,
        audits,
        physiologicalExplanation: physiologicalReasons.join(" "),
        actionPlan: actionPlans
      };
    });
  }, [chartData, selectedKeys, metricConfigs, plantsOnScale, densityPerM2]);

  const brushIndices = useMemo(() => {
    if (!zoomTimeRange || chartData.length === 0) {
      return { start: 0, end: chartData.length - 1 };
    }
    
    // Find closest index for min time
    let startIdx = 0;
    let minDiff = Infinity;
    chartData.forEach((d: any, idx: number) => {
      const diff = Math.abs(d.time - zoomTimeRange.min);
      if (diff < minDiff) {
        minDiff = diff;
        startIdx = idx;
      }
    });

    // Find closest index for max time
    let endIdx = chartData.length - 1;
    let maxDiff = Infinity;
    chartData.forEach((d: any, idx: number) => {
      const diff = Math.abs(d.time - zoomTimeRange.max);
      if (diff < maxDiff) {
        maxDiff = diff;
        endIdx = idx;
      }
    });

    return { start: startIdx, end: endIdx };
  }, [chartData, zoomTimeRange]);

  const midnightTimestamps = useMemo(() => {
    if (chartData.length === 0) return [];

    const times = chartData.map((d: any) => d.time).filter(Boolean);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    const midnights: number[] = [];
    
    // Start from the day of minTime at 00:00 local time
    const start = new Date(minTime);
    start.setHours(0, 0, 0, 0);
    
    // Increment day by day until we pass maxTime
    const current = new Date(start);
    while (current.getTime() <= maxTime) {
      if (current.getTime() >= minTime) {
        midnights.push(current.getTime());
      }
      current.setDate(current.getDate() + 1);
    }
    
    return midnights;
  }, [chartData]);

  const visibleChartKeys = useMemo(() => {
    return selectedKeys.filter((k) => {
      if (hiddenKeysOnChart.includes(k)) return false;
      const m = allMetrics.find(item => item.key === k);
      if (m && m.isPriva && m.category.includes("Compartiment")) {
        if (selectedCompartment !== "all" && m.category !== `Priva - Compartiment ${selectedCompartment}`) {
          return false;
        }
      }
      return true;
    });
  }, [selectedKeys, hiddenKeysOnChart, selectedCompartment]);

  // Group active sensors into shared axes by unit & side
  const activeYAxes = useMemo(() => {
    const axesMap: {
      [id: string]: {
        axisId: string;
        axis: "left" | "right";
        unitName: string;
        keys: string[];
        color: string;
      };
    } = {};

    visibleChartKeys.forEach((key) => {
      const m = allMetrics.find(item => item.key === key);
      if (!m) return;
      const config = metricConfigs[key] || {};
      const axis = config.axis || "left";
      const unitObj = m.units.find(u => u.id === config.unit) || m.units[0];
      const unitName = unitObj.name;
      const axisId = `${axis}-${unitName}`;
      const color = config.color || m.color;

      if (!axesMap[axisId]) {
        axesMap[axisId] = {
          axisId,
          axis,
          unitName,
          keys: [],
          color
        };
      }
      axesMap[axisId].keys.push(key);
    });

    return Object.values(axesMap);
  }, [visibleChartKeys, metricConfigs]);

  const firstYAxisId = useMemo(() => {
    if (selectedKeys.length === 0) return undefined;
    const key = selectedKeys[0];
    const m = allMetrics.find(item => item.key === key);
    if (!m) return undefined;
    const config = metricConfigs[key] || {};
    const axis = config.axis || "left";
    const unitObj = m.units.find(u => u.id === config.unit) || m.units[0];
    return `${axis}-${unitObj.name}`;
  }, [selectedKeys, metricConfigs]);

  // Tooltip content helper
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-muted-foreground/20 p-2.5 rounded-xl shadow-lg space-y-1.5 text-[11px] z-30">
          <p className="font-bold text-foreground">
            Instant : {payload[0].payload.formattedDate}
          </p>
          <div className="space-y-1">
            {payload.map((item: any) => {
              const metric = allMetrics.find(m => m.key === item.dataKey);
              if (!metric) return null;
              const config = metricConfigs[item.dataKey];
              const unitName = metric.units.find(u => u.id === config?.unit)?.name || "";

              return (
                <div key={item.dataKey} className="flex flex-col border-t pt-1 border-muted/50 first:border-t-0 first:pt-0">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground truncate max-w-[100px]">{config?.customName || metric.name} :</span>
                    <span className="text-foreground font-bold">{item.value !== undefined ? item.value.toFixed(2) : "N/A"}</span>
                    <span className="text-muted-foreground text-[9px]">{unitName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Group metrics by visibility (filtered by active compartment)
  const visibleMetrics = allMetrics.filter(m => {
    if (!selectedKeys.includes(m.key)) return false;
    // Aranet only exists in Compartment 1
    if (!m.isPriva && selectedCompartment !== "1" && selectedCompartment !== "all") return false;
    // Priva compartment metrics must match selectedCompartment
    if (m.isPriva && m.category.includes("Compartiment")) {
      if (selectedCompartment !== "all" && m.category !== `Priva - Compartiment ${selectedCompartment}`) {
        return false;
      }
    }
    return true;
  });

  const hiddenMetrics = allMetrics.filter(m => {
    if (selectedKeys.includes(m.key)) return false;
    // Aranet only exists in Compartment 1
    if (!m.isPriva && selectedCompartment !== "1" && selectedCompartment !== "all") return false;
    // Priva compartment metrics must match selectedCompartment
    if (m.isPriva && m.category.includes("Compartiment")) {
      if (selectedCompartment !== "all" && m.category !== `Priva - Compartiment ${selectedCompartment}`) {
        return false;
      }
    }
    return true;
  });

  // Helper function to render a sensor configuration item in the sidebar
  const renderSensorItem = (m: any) => {
    const isSelected = selectedKeys.includes(m.key);
    const config = metricConfigs[m.key] || { unit: m.units[0].id, range: "24h", axis: "left", color: m.color, smooth: false, sgWindow: 9 };
    const sensorColor = config.color || m.color;

    return (
      <div key={m.key} className="border-b pb-2 last:border-0 border-muted/30">
        <div className="flex items-center justify-between gap-2 py-1">
          <button
            onClick={() => toggleKey(m.key)}
            className={`flex-1 flex items-center gap-2 text-left text-[11px] transition-colors ${isSelected ? "text-primary font-bold" : "text-muted-foreground"}`}
          >
            <span className="shrink-0">
              {isSelected ? (
                <CheckSquare className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Square className="h-3.5 w-3.5 text-gray-300" />
              )}
            </span>
            {isSelected ? (
              <input
                type="text"
                value={config.customName || ""}
                onChange={(e) => updateMetricConfig(m.key, "customName", e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder={m.name}
                className="text-[11px] font-bold bg-transparent border-b border-muted/30 focus:border-primary focus:outline-none w-full max-w-[280px] placeholder:text-muted-foreground/45 placeholder:font-normal text-foreground py-0.5"
              />
            ) : (
              <span className="truncate flex-1">{m.name}</span>
            )}
          </button>
          
          {/* Custom Color Selector */}
          <div className="relative w-3.5 h-3.5 shrink-0 rounded-full overflow-hidden border border-muted/30 cursor-pointer shadow-sm hover:scale-110 transition-transform">
            <input
              type="color"
              value={sensorColor}
              onChange={(e) => updateMetricConfig(m.key, "color", e.target.value)}
              onClick={(e) => e.stopPropagation()}
              title="Changer la couleur"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-full h-full rounded-full" style={{ backgroundColor: sensorColor }} />
          </div>
        </div>

        {isSelected && (
          <div className="pl-5 mt-1 space-y-2">
            <div className="grid grid-cols-3 gap-1">
              {/* Unit Select */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] text-muted-foreground uppercase font-bold">Unité</span>
                <select
                  value={config.unit}
                  onChange={(e) => updateMetricConfig(m.key, "unit", e.target.value)}
                  className="text-[9px] border rounded bg-background p-0.5 focus:outline-none focus:ring-1 focus:ring-primary h-5"
                >
                  {m.units.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              {/* Range Select */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] text-muted-foreground uppercase font-bold">Plage X</span>
                <select
                  value={config.range}
                  onChange={(e) => updateMetricConfig(m.key, "range", e.target.value)}
                  className="text-[9px] border rounded bg-background p-0.5 focus:outline-none focus:ring-1 focus:ring-primary font-medium h-5"
                >
                  <option value="1h">1H</option>
                  <option value="3h">3H</option>
                  <option value="6h">6H</option>
                  <option value="12h">12H</option>
                  <option value="24h">24H</option>
                  <option value="72h">3J</option>
                  <option value="7d">7J</option>
                </select>
              </div>

              {/* Y-Axis Assignment */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] text-muted-foreground uppercase font-bold">Axe Y</span>
                <div className="flex border rounded overflow-hidden h-5">
                  <button
                    onClick={() => updateMetricConfig(m.key, "axis", "left")}
                    className={`flex-1 text-[8px] font-bold ${config.axis === "left" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
                  >
                    G
                  </button>
                  <button
                    onClick={() => updateMetricConfig(m.key, "axis", "right")}
                    className={`flex-1 text-[8px] font-bold ${config.axis === "right" ? "bg-green-600 text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}
                  >
                    D
                  </button>
                </div>
              </div>
            </div>

            {/* Savitzky-Golay Smoothing Selector */}
            <div className="flex items-center justify-between border-t pt-1.5 border-muted/20">
              <label className="flex items-center gap-1 cursor-pointer text-[9px] font-medium text-muted-foreground">
                <input
                  type="checkbox"
                  checked={config.smooth === true || config.smooth === "true"}
                  onChange={(e) => updateMetricConfig(m.key, "smooth", e.target.checked)}
                  className="rounded border-muted text-primary focus:ring-primary h-3 w-3 cursor-pointer"
                />
                Lissage SG
              </label>

              {(config.smooth === true || config.smooth === "true") && (
                <div className="flex items-center gap-1">
                  <span className="text-[8px] text-muted-foreground uppercase font-bold">Fenêtre</span>
                  <select
                    value={config.sgWindow || 9}
                    onChange={(e) => updateMetricConfig(m.key, "sgWindow", Number(e.target.value))}
                    className="text-[9px] border rounded bg-background px-1 focus:outline-none focus:ring-1 focus:ring-primary h-4.5"
                  >
                    <option value="5">5 pts</option>
                    <option value="10">10 pts</option>
                    <option value="15">15 pts</option>
                    <option value="20">20 pts</option>
                    <option value="25">25 pts</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper to render grouped metrics in categories
  const renderGroupedMetrics = (metricsList: any[]) => {
    const grouped: Record<string, any[]> = {};
    metricsList.forEach(m => {
      const cat = m.category || "Autres";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(m);
    });

    return Object.entries(grouped).map(([category, items]) => (
      <div key={category} className="space-y-2 mt-3 border border-muted/20 p-3 rounded-2xl bg-muted/5">
        <h4 className="text-[10px] font-black uppercase text-primary tracking-wider border-b pb-1 flex items-center justify-between">
          <span>{category}</span>
          <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{items.length}</span>
        </h4>
        <div className="space-y-2 pl-0.5 pt-1">
          {items.map(renderSensorItem)}
        </div>
      </div>
    ));
  };

  // Group active sensors by Y Axis orientation
  const leftActiveKeys = visibleChartKeys.filter(k => (metricConfigs[k]?.axis || "left") === "left");
  const rightActiveKeys = visibleChartKeys.filter(k => (metricConfigs[k]?.axis || "left") === "right");

  const chartMargin = useMemo(() => {
    const leftCount = leftActiveKeys.length;
    const rightCount = rightActiveKeys.length;
    return {
      top: 20,
      left: Math.max(10, leftCount * 35),
      right: Math.max(10, rightCount * 35),
      bottom: 0
    };
  }, [leftActiveKeys.length, rightActiveKeys.length]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/10">
        <RefreshCw className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/10">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <ArrowLeft className="h-4.5 w-4.5 text-primary" />
            </div>
            <h1 className="text-lg font-bold text-primary">Rawwin</h1>
          </Link>
          <span className="text-xs text-muted-foreground">/</span>
          
          {/* Tabs for switching views */}
          <div className="flex items-center gap-1 bg-muted p-0.5 rounded-xl border">
            <button
              onClick={() => setActiveTab("agronomic")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === "agronomic"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground animate-in duration-200"
              }`}
            >
              Analyseur Agronomique
            </button>
            <button
              onClick={() => setActiveTab("selection")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === "selection"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground animate-in duration-200"
              }`}
            >
              Sélection des données
            </button>
            <button
              onClick={() => {
                setActiveTab("charts");
                setStartDate(getPastDateStr(2));
                setEndDate(getPastDateStr(1));
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === "charts"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground animate-in duration-200"
              }`}
            >
              Graphique
            </button>
            <button
              onClick={() => setActiveTab("climatique")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === "climatique"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground animate-in duration-200"
              }`}
            >
              Ordinateur Climatique
            </button>
          </div>

          {/* Compartment Selection Dropdown */}
          <div className="flex items-center gap-1.5 bg-muted/40 border border-muted/20 px-2 py-0.5 rounded-xl h-8">
            <span className="text-[9px] font-black uppercase text-muted-foreground">Compartiment :</span>
            <select
              value={selectedCompartment}
              onChange={(e) => setSelectedCompartment(e.target.value)}
              className="text-[10px] font-bold bg-transparent focus:outline-none cursor-pointer h-full"
            >
              <option value="all">Tous les compartiments (Aranet + Priva)</option>
              <option value="1">Compartiment 1 (Aranet + Priva)</option>
              <option value="2">Compartiment 2 (Priva)</option>
              <option value="3">Compartiment 3 (Priva)</option>
              <option value="4">Compartiment 4 (Priva)</option>
              <option value="5">Compartiment 5 (Priva)</option>
              <option value="6">Compartiment 6 (Priva)</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {activeTab === "charts" && (
            <Button variant="ghost" size="icon" onClick={fetchActiveData} disabled={loading} className="h-8 w-8">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          )}
          {activeTab === "climatique" && (
            <Button variant="ghost" size="icon" onClick={fetchPrivaData} disabled={privaLoading} className="h-8 w-8">
              <RefreshCw className={`h-3.5 w-3.5 ${privaLoading ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>
      </header>

      {/* Helper to format days J1-J10 into real dates ending on the selected endDate */}
      {(() => {
        const getFormattedDateForDay = (dayNum: number) => {
          try {
            const baseDate = new Date(endDate);
            if (isNaN(baseDate.getTime())) {
              return `Jour ${dayNum}`;
            }
            const offset = 10 - dayNum;
            baseDate.setDate(baseDate.getDate() - offset);
            return baseDate.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
          } catch {
            return `Jour ${dayNum}`;
          }
        };

        return (
          <>
            {activeTab === "charts" ? (
              <div className="flex flex-1 flex-col overflow-hidden lg:h-[calc(100vh-3.5rem)]">
                {/* Right Side: Charts Display Area (takes full width) */}
                <main className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col gap-4 min-h-0 bg-muted/10">
                  {/* Calendar & Title Row */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-background p-4 rounded-2xl border border-muted/20 shadow-sm shrink-0">
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                        <ChartIcon className="h-4.5 w-4.5 text-primary" /> Période d&apos;Analyse (Max. 30 jours)
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        className="border rounded-xl px-2.5 py-1 text-xs font-bold bg-background focus:outline-none focus:ring-1 focus:ring-primary h-8"
                      />
                      <span className="text-xs text-muted-foreground font-bold">à</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        className="border rounded-xl px-2.5 py-1 text-xs font-bold bg-background focus:outline-none focus:ring-1 focus:ring-primary h-8"
                      />
                    </div>
                  </div>

                  {/* Sensor Visibility Toggles */}
                  {selectedKeys.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 bg-background p-3 rounded-2xl border border-muted/20 shadow-sm shrink-0 animate-in fade-in duration-300">
                      <span className="text-[10px] font-black text-muted-foreground uppercase mr-1">Afficher / Masquer :</span>
                      {selectedKeys.map(key => {
                        const m = allMetrics.find(item => item.key === key);
                        if (!m) return null;
                        const isVisible = !hiddenKeysOnChart.includes(key);
                        const config = metricConfigs[key] || {};
                        const sensorColor = config.color || m.color;
                        return (
                          <button
                            key={`toggle-chart-${key}`}
                            onClick={() => {
                              if (isVisible) {
                                setHiddenKeysOnChart([...hiddenKeysOnChart, key]);
                              } else {
                                setHiddenKeysOnChart(hiddenKeysOnChart.filter(k => k !== key));
                              }
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                              isVisible 
                                ? "text-white shadow-sm" 
                                : "bg-muted/10 text-muted-foreground border-muted-foreground/15 opacity-60 hover:opacity-85"
                            }`}
                            style={{
                              backgroundColor: isVisible ? sensorColor : undefined,
                              borderColor: isVisible ? sensorColor : undefined
                            }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            {config.customName || m.name}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Combined/Aligned Chart Card */}
                  {selectedKeys.length === 0 ? (
                    <Card className="flex-1 flex flex-col items-center justify-center p-8 bg-background border border-muted/20 shadow-sm min-h-[300px]">
                      <Activity className="h-8 w-8 text-muted-foreground animate-pulse mb-2" />
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider text-center">Aucun capteur sélectionné</p>
                      <p className="text-[10px] text-muted-foreground text-center mt-1">Allez dans l&apos;onglet &quot;Sélection des données&quot; pour cocher les capteurs à afficher.</p>
                    </Card>
                  ) : (
                    <Card className="flex-1 flex flex-col bg-background border border-muted/20 shadow-sm overflow-hidden min-h-[400px]">
                      <CardHeader className="p-4 border-b bg-muted/5 flex flex-row items-center justify-between shrink-0">
                        <div>
                          <CardTitle className="text-xs font-black uppercase tracking-tight">Graphique Agronomique Comparatif</CardTitle>
                          <p className="text-[9px] text-muted-foreground font-medium mt-0.5">Chaque capteur possède sa propre échelle Y automatique (de la couleur de sa courbe) alignée sur le côté gauche ou droit.</p>
                        </div>
                        {loading && (
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold">
                            <RefreshCw className="h-3 w-3 animate-spin text-primary" />
                            Synchronisation...
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
                        {privaChartError && (
                          <div className={`border p-2.5 rounded-xl text-[10px] font-bold flex items-center gap-2 mb-2 shrink-0 ${
                            privaChartError.startsWith("Info")
                              ? "bg-blue-500/10 border-blue-500/25 text-blue-700"
                              : "bg-amber-500/10 border-amber-500/25 text-amber-700"
                          }`}>
                            {privaChartError.startsWith("Info") ? (
                              <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            ) : (
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            )}
                            <span>{privaChartError}</span>
                          </div>
                        )}
                        {error ? (
                          <div className="h-full w-full flex items-center justify-center text-xs text-red-500 font-medium">
                            {error}
                          </div>
                        ) : chartData.length === 0 ? (
                          <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                            En attente de relevés pour cette période...
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col gap-2 overflow-hidden min-h-0">
                            {/* The Chart Container */}
                            <div className="w-full h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px] xl:h-[600px] min-h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={chartMargin}>
                                  <CartesianGrid yAxisId={firstYAxisId} strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                                  
                                  {/* Midnight vertical reference lines */}
                                  {midnightTimestamps.map((ts) => (
                                    <ReferenceLine
                                      key={`midnight-${ts}`}
                                      x={ts}
                                      yAxisId={firstYAxisId}
                                      stroke="#cbd5e1"
                                      strokeDasharray="3 3"
                                      strokeWidth={1}
                                      label={{ 
                                        value: "Minuit", 
                                        position: "top", 
                                        fill: "#94a3b8", 
                                        fontSize: 8, 
                                        fontWeight: "bold" 
                                      }}
                                    />
                                  ))}

                                  <XAxis 
                                    dataKey="time"
                                    type="number"
                                    scale="time"
                                    domain={['auto', 'auto']}
                                    tickFormatter={(ts) => {
                                      const d = new Date(ts);
                                      return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    }}
                                    tick={{ fontSize: 8, fill: "#64748b", fontWeight: "600" }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={5}
                                  />

                                  {/* DYNAMIC GROUPED Y-AXES BY UNIT & SIDE */}
                                  {activeYAxes.map((yAxis) => {
                                    const isShared = yAxis.keys.length > 1;
                                    const axisColor = isShared ? "#64748b" : yAxis.color;
                                    
                                    const domainMin = yAxis.axis === "left" 
                                      ? (yLeftMin !== "" ? Number(yLeftMin) : "auto") 
                                      : (yRightMin !== "" ? Number(yRightMin) : "auto");
                                    const domainMax = yAxis.axis === "left" 
                                      ? (yLeftMax !== "" ? Number(yLeftMax) : "auto") 
                                      : (yRightMax !== "" ? Number(yRightMax) : "auto");

                                    return (
                                      <YAxis
                                        key={`yAxis-${yAxis.axisId}`}
                                        yAxisId={yAxis.axisId}
                                        orientation={yAxis.axis}
                                        stroke={axisColor}
                                        tick={{ fontSize: 8, fill: axisColor }}
                                        domain={[domainMin, domainMax]}
                                        width={40}
                                        label={{
                                          value: yAxis.unitName,
                                          angle: yAxis.axis === "left" ? -90 : 90,
                                          position: yAxis.axis === "left" ? "insideLeft" : "insideRight",
                                          style: { textAnchor: "middle", fill: axisColor, fontSize: 8, fontWeight: "bold" }
                                        }}
                                      />
                                    );
                                  })}

                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend 
                                    verticalAlign="bottom" 
                                    iconType="plainline" 
                                    iconSize={12}
                                    wrapperStyle={{ 
                                      paddingTop: 10,
                                      fontSize: '10px', 
                                      fontWeight: '600' 
                                    }} 
                                  />

                                  {/* lines mapping */}
                                  {visibleChartKeys.flatMap(key => {
                                    const m = allMetrics.find(item => item.key === key)!;
                                    const config = metricConfigs[key] || {};
                                    const unitObj = m.units.find(u => u.id === config.unit) || m.units[0];
                                    const unitName = unitObj ? unitObj.name : "";
                                    const sensorColor = config.color || m.color;
                                    const isSmooth = config.smooth === true || config.smooth === "true";

                                    const lines = [
                                      <Line
                                        key={`${key}-smoothed`}
                                        yAxisId={`${config.axis || "left"}-${unitName}`}
                                        type="monotone"
                                        dataKey={key}
                                        name={`${config.customName || m.name} (${unitName})`}
                                        stroke={sensorColor}
                                        strokeWidth={1.4}
                                        dot={false}
                                        connectNulls={true}
                                        isAnimationActive={false}
                                      />
                                    ];

                                    if (isSmooth) {
                                      lines.unshift(
                                        <Line
                                          key={`${key}-raw`}
                                          yAxisId={`${config.axis || "left"}-${unitName}`}
                                          type="monotone"
                                          dataKey={`${key}_raw`}
                                          name={`${config.customName || m.name} (Brut)`}
                                          stroke={sensorColor}
                                          strokeWidth={0.8}
                                          opacity={0.25}
                                          dot={false}
                                          connectNulls={true}
                                          legendType="none"
                                          isAnimationActive={false}
                                        />
                                      );
                                    }

                                    return lines;
                                  })}

                                  {/* RECHARTS BRUSH SELECTOR */}
                                  <Brush 
                                    dataKey="time" 
                                    height={45} 
                                    stroke="#cbd5e1" 
                                    fill="#f8fafc"
                                    startIndex={brushIndices.start}
                                    endIndex={brushIndices.end}
                                    tickFormatter={(timeMs) => {
                                      if (!timeMs || isNaN(Number(timeMs))) return "";
                                      const date = new Date(Number(timeMs));
                                      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    }}
                                    onChange={(brushState) => {
                                      if (brushState && brushState.startIndex !== undefined && brushState.endIndex !== undefined) {
                                        const startItem = chartData[brushState.startIndex];
                                        const endItem = chartData[Math.min(chartData.length - 1, brushState.endIndex)];
                                        if (startItem && endItem) {
                                          updateZoomTimeRangeDebounced({ min: startItem.time, max: endItem.time });
                                        }
                                      }
                                    }}
                                  >
                                    <LineChart data={chartData}>
                                      {visibleChartKeys.map(key => {
                                        const m = allMetrics.find(item => item.key === key)!;
                                        const config = metricConfigs[key] || {};
                                        const sensorColor = config.color || m.color;
                                        return (
                                          <Line
                                            key={`brush-line-${key}`}
                                            type="monotone"
                                            dataKey={key}
                                            stroke={sensorColor}
                                            strokeWidth={0.6}
                                            dot={false}
                                            connectNulls={true}
                                            isAnimationActive={false}
                                          />
                                        );
                                      })}
                                    </LineChart>
                                  </Brush>
                                </LineChart>
                              </ResponsiveContainer>
                            </div>

                            {/* Colored Bottom Indicator Badges */}
                            <div className="flex items-center justify-between border-t pt-2 mt-0.5 px-1 text-[10px] font-bold shrink-0">
                              {/* Left Side Badges */}
                              <div className="flex flex-wrap gap-1.5">
                                {leftActiveKeys.map(key => {
                                  const m = allMetrics.find(item => item.key === key)!;
                                  const config = metricConfigs[key] || {};
                                  const label = config.customName || METRIC_BADGES[key] || key.substring(0, 3);
                                  const sensorColor = config.color || m.color;
                                  return (
                                    <div 
                                      key={`badge-${key}`}
                                      className="px-1.5 py-0.5 border rounded shadow-sm text-[9px]"
                                      style={{ borderColor: sensorColor, color: sensorColor, backgroundColor: `${sensorColor}05` }}
                                    >
                                      {label}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Right Side Badges */}
                              <div className="flex flex-wrap gap-1.5">
                                {rightActiveKeys.map(key => {
                                  const m = allMetrics.find(item => item.key === key)!;
                                  const config = metricConfigs[key] || {};
                                  const label = config.customName || METRIC_BADGES[key] || key.substring(0, 3);
                                  const sensorColor = config.color || m.color;
                                  return (
                                    <div 
                                      key={`badge-${key}`}
                                      className="px-1.5 py-0.5 border rounded shadow-sm text-[9px]"
                                      style={{ borderColor: sensorColor, color: sensorColor, backgroundColor: `${sensorColor}05` }}
                                    >
                                      {label}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </main>
              </div>
            ) : activeTab === "selection" ? (
              /* Data Selection Tab Content (Beautiful Form Layout) */
              <div className="flex-1 overflow-y-auto bg-muted/10 p-6 md:p-10 max-h-[calc(100vh-3.5rem)] space-y-6">
                <Card className="border-none shadow-md bg-background rounded-3xl overflow-hidden">
                  <CardHeader className="p-6 border-b bg-muted/10">
                    <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                      <Sliders className="h-5 w-5 text-primary animate-pulse" /> Configuration & Sélection des Capteurs
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Cochez les capteurs que vous souhaitez tracer sur le graphique et ajustez leurs options d&apos;axes et de lissage.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-8">
                    
                    {/* Settings cards row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Physiology Parameters */}
                      <Card className="border border-muted-foreground/15 shadow-sm bg-muted/5 rounded-2xl">
                        <CardHeader className="p-4 pb-2 border-b bg-muted/10">
                          <CardTitle className="text-xs font-black uppercase tracking-tight flex items-center gap-1.5 text-primary">
                            <Activity className="h-4 w-4" /> Paramètres Physiologiques
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-muted-foreground uppercase font-bold">Plants sur balance</label>
                            <input
                              type="number"
                              min="1"
                              value={plantsOnScale}
                              onChange={(e) => setPlantsOnScale(Math.max(1, Number(e.target.value)))}
                              className="w-full text-xs border rounded-xl bg-background p-2 focus:outline-none focus:ring-1 focus:ring-primary text-center font-bold"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-muted-foreground uppercase font-bold">Densité / m²</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={densityPerM2}
                              onChange={(e) => setDensityPerM2(Math.max(0.1, Number(e.target.value)))}
                              className="w-full text-xs border rounded-xl bg-background p-2 focus:outline-none focus:ring-1 focus:ring-primary text-center font-bold"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Y-Axes Limits */}
                      <Card className="border border-muted-foreground/15 shadow-sm bg-muted/5 rounded-2xl">
                        <CardHeader className="p-4 pb-2 border-b bg-muted/10">
                          <CardTitle className="text-xs font-black uppercase tracking-tight flex items-center gap-1.5 text-primary">
                            <Sliders className="h-4 w-4" /> Échelles des Axes Y
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-primary block">Axe Y Gauche</label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  placeholder="Min"
                                  value={yLeftMin}
                                  onChange={(e) => setYLeftMin(e.target.value)}
                                  className="w-full text-xs border rounded-xl bg-background p-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-center h-8 font-semibold"
                                />
                                <input
                                  type="number"
                                  placeholder="Max"
                                  value={yLeftMax}
                                  onChange={(e) => setYLeftMax(e.target.value)}
                                  className="w-full text-xs border rounded-xl bg-background p-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-center h-8 font-semibold"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-green-600 block">Axe Y Droit</label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  placeholder="Min"
                                  value={yRightMin}
                                  onChange={(e) => setYRightMin(e.target.value)}
                                  className="w-full text-xs border rounded-xl bg-background p-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-center h-8 font-semibold"
                                />
                                <input
                                  type="number"
                                  placeholder="Max"
                                  value={yRightMax}
                                  onChange={(e) => setYRightMax(e.target.value)}
                                  className="w-full text-xs border rounded-xl bg-background p-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-center h-8 font-semibold"
                                />
                              </div>
                            </div>
                          </div>
                          {(yLeftMin !== "" || yLeftMax !== "" || yRightMin !== "" || yRightMax !== "") && (
                            <Button 
                              variant="ghost" 
                              size="xs" 
                              onClick={() => { setYLeftMin(""); setYLeftMax(""); setYRightMin(""); setYRightMax(""); }}
                              className="w-full text-[10px] h-7 mt-1"
                            >
                              Réinitialiser les limites Y
                            </Button>
                          )}
                        </CardContent>
                      </Card>

                      {/* Global Savitzky-Golay */}
                      <Card className="border border-muted-foreground/15 shadow-sm bg-muted/5 rounded-2xl">
                        <CardHeader className="p-4 pb-2 border-b bg-muted/10">
                          <CardTitle className="text-xs font-black uppercase tracking-tight flex items-center gap-1.5 text-primary">
                            <Sparkles className="h-4 w-4" /> Lissage des Courbes
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 flex flex-col justify-center h-[96px]">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                            <input
                              type="checkbox"
                              onChange={(e) => applyGlobalSmoothing(e.target.checked)}
                              className="rounded border-muted text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                            />
                            Lisser tous les capteurs coché
                          </label>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Sensor list grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                      {/* Left: Visible metrics */}
                      <Card className="border border-muted-foreground/15 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="p-4 pb-2 border-b bg-muted/5">
                          <CardTitle className="text-xs font-black uppercase tracking-tight text-primary flex items-center justify-between">
                            <span>Capteurs Actuellement Sélectionnés ({visibleMetrics.length})</span>
                            {visibleMetrics.length > 0 && (
                              <button 
                                onClick={() => setSelectedKeys([])} 
                                className="text-[10px] text-muted-foreground hover:text-primary font-bold transition-colors cursor-pointer"
                              >
                                Tout effacer
                              </button>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 max-h-[500px] overflow-y-auto space-y-1">
                          {visibleMetrics.length === 0 ? (
                            <div className="text-center py-8 text-xs text-muted-foreground font-semibold">
                              Aucun capteur activé. Cochez des capteurs dans la liste de droite.
                            </div>
                          ) : (
                            renderGroupedMetrics(visibleMetrics)
                          )}
                        </CardContent>
                      </Card>

                      {/* Right: Hidden metrics */}
                      <Card className="border border-muted-foreground/15 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="p-4 pb-2 border-b bg-muted/5">
                          <CardTitle className="text-xs font-black uppercase tracking-tight text-muted-foreground">
                            Autres Capteurs Disponibles ({hiddenMetrics.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 max-h-[500px] overflow-y-auto space-y-1">
                          {hiddenMetrics.length === 0 ? (
                            <div className="text-center py-8 text-xs text-emerald-500 font-bold">
                              Tous les capteurs sont actuellement actifs sur le graphique !
                            </div>
                          ) : (
                            renderGroupedMetrics(hiddenMetrics)
                          )}
                        </CardContent>
                      </Card>
                    </div>

                  </CardContent>
                </Card>
              </div>
            ) : activeTab === "climatique" ? (
              /* Climate Computer Tab Content */
              <div className="flex-1 overflow-y-auto bg-muted/10 p-6 md:p-10 max-h-[calc(100vh-3.5rem)] space-y-6">
                
                {/* Header title */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-background p-6 rounded-3xl border border-muted/20 shadow-md">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-foreground">
                      <Cpu className="h-5 w-5 text-primary animate-pulse" /> Ordinateur Climatique Priva
                    </h2>
                    <p className="text-[10px] text-muted-foreground mt-1 font-bold">
                      Données en direct de la station météo et des compartiments de <span className="font-bold text-foreground">La Landelle aux Menards</span> (SCEA Rousse).
                    </p>
                  </div>
                  {privaLoading && (
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                      Mise à jour...
                    </div>
                  )}
                </div>

                {privaError && (
                  <Card className="border-red-500/30 bg-red-500/5 p-4 rounded-2xl flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-red-600">Erreur lors de la récupération des données</p>
                      <p className="text-[10px] text-red-500 mt-0.5">{privaError}</p>
                    </div>
                  </Card>
                )}

                {/* Dashboard Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  
                  {/* Card 1: Température Extérieure */}
                  <Card className="border border-muted-foreground/15 shadow-sm bg-background rounded-2xl">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                        <Thermometer className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider truncate">Température Extérieure</p>
                        <h3 className="text-lg font-black text-foreground mt-0.5">
                          {privaValues.temp_out ? `${privaValues.temp_out.value} °C` : "N/A"}
                        </h3>
                        <p className="text-[9px] text-muted-foreground mt-0.5 font-bold">
                          {privaValues.temp_out ? `À ${privaValues.temp_out.time}` : "Aucune donnée"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 2: Humidité Extérieure */}
                  <Card className="border border-muted-foreground/15 shadow-sm bg-background rounded-2xl">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                        <Droplets className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider truncate">Humidité Extérieure</p>
                        <h3 className="text-lg font-black text-foreground mt-0.5">
                          {privaValues.hum_out ? `${privaValues.hum_out.value} %` : "N/A"}
                        </h3>
                        <p className="text-[9px] text-muted-foreground mt-0.5 font-bold">
                          {privaValues.hum_out ? `À ${privaValues.hum_out.time}` : "Aucune donnée"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 3: Rayonnement Solaire */}
                  <Card className="border border-muted-foreground/15 shadow-sm bg-background rounded-2xl">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl">
                        <Sun className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider truncate">Rayonnement Solaire</p>
                        <h3 className="text-lg font-black text-foreground mt-0.5">
                          {privaValues.irr_out ? `${privaValues.irr_out.value} W/m²` : "N/A"}
                        </h3>
                        <p className="text-[9px] text-muted-foreground mt-0.5 font-bold">
                          {privaValues.irr_out ? `À ${privaValues.irr_out.time}` : "Aucune donnée"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 4: Vitesse du vent */}
                  <Card className="border border-muted-foreground/15 shadow-sm bg-background rounded-2xl">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl">
                        <Wind className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider truncate">Vitesse du Vent</p>
                        <h3 className="text-lg font-black text-foreground mt-0.5">
                          {privaValues.wind_out ? `${privaValues.wind_out.value} m/s` : "N/A"}
                        </h3>
                        <p className="text-[9px] text-muted-foreground mt-0.5 font-bold">
                          {privaValues.wind_out ? `À ${privaValues.wind_out.time}` : "Aucune donnée"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Heating and Humidification Detailed Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Heating 1 Card */}
                  <Card className="border border-muted/20 shadow-sm bg-background rounded-2xl">
                    <CardHeader className="p-4 pb-2 border-b bg-muted/5 flex flex-row items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
                      <CardTitle className="text-xs font-black uppercase tracking-tight text-foreground">Gestion du Chauffage (Zone 1)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 grid grid-cols-2 gap-4">
                      <div className="bg-muted/5 border border-muted/10 p-3.5 rounded-xl flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wide">Consigne Demandée</span>
                        <span className="text-base font-black text-foreground mt-1">
                          {privaValues.heat_target ? `${privaValues.heat_target.value} °C` : "N/A"}
                        </span>
                      </div>
                      <div className="bg-muted/5 border border-muted/10 p-3.5 rounded-xl flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wide">Température Mesurée</span>
                        <span className="text-base font-black text-foreground mt-1">
                          {privaValues.heat_measured ? `${privaValues.heat_measured.value} °C` : "N/A"}
                        </span>
                      </div>
                      <div className="bg-muted/5 border border-muted/10 p-3.5 rounded-xl flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wide">Eau Retour</span>
                        <span className="text-base font-black text-foreground mt-1">
                          {privaValues.water_ret ? `${privaValues.water_ret.value} °C` : "N/A"}
                        </span>
                      </div>
                      <div className="bg-muted/5 border border-muted/10 p-3.5 rounded-xl flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wide">Eau Calculée</span>
                        <span className="text-base font-black text-foreground mt-1">
                          {privaValues.water_calc ? `${privaValues.water_calc.value} °C` : "N/A"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Humidification 5 Card */}
                  <Card className="border border-muted/20 shadow-sm bg-background rounded-2xl">
                    <CardHeader className="p-4 pb-2 border-b bg-muted/5 flex flex-row items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
                      <CardTitle className="text-xs font-black uppercase tracking-tight text-foreground">Brumisation & Humidité (Zone 5)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 grid grid-cols-2 gap-4">
                      <div className="bg-muted/5 border border-muted/10 p-3.5 rounded-xl flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wide">Humidité Mesurée</span>
                        <span className="text-base font-black text-foreground mt-1">
                          {privaValues.hum_measured ? `${privaValues.hum_measured.value} %` : "N/A"}
                        </span>
                      </div>
                      <div className="bg-muted/5 border border-muted/10 p-3.5 rounded-xl flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wide">Consigne Limite</span>
                        <span className="text-base font-black text-foreground mt-1">
                          {privaValues.hum_target ? `${privaValues.hum_target.value} %` : "N/A"}
                        </span>
                      </div>
                      <div className="bg-muted/5 border border-muted/10 p-3.5 rounded-xl flex flex-col items-center justify-center text-center col-span-2">
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wide">Statut de Brumisation</span>
                        <span className="text-xs font-black text-emerald-500 mt-1">
                          Fonctionnement normal
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Big Searchable catalog of 1719 datapoints */}
                <Card className="border border-muted/25 shadow-md bg-background rounded-3xl overflow-hidden">
                  <CardHeader className="p-6 border-b bg-muted/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                        <Search className="h-4.5 w-4.5 text-primary" /> Catalogue Complet des Points de Mesure ({privaCatalog.length})
                      </CardTitle>
                      <p className="text-[10px] text-muted-foreground mt-1 font-bold">
                        Localisez n&apos;importe quel capteur de l&apos;ordinateur climatique et copiez ses identifiants uniques.
                      </p>
                    </div>
                    <div className="w-full md:w-80 shrink-0">
                      <input
                        type="text"
                        placeholder="Rechercher un capteur (ex: temp, ventil, co2...)"
                        value={privaSearch}
                        onChange={(e) => setPrivaSearch(e.target.value)}
                        className="w-full border rounded-xl px-3 py-1.5 text-xs bg-muted/10 focus:outline-none focus:ring-1 focus:ring-primary h-9 font-bold"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-muted/10 border-b text-[9px] uppercase font-black tracking-widest text-muted-foreground">
                          <th className="p-3 pl-6 w-12 text-center">Sélection</th>
                          <th className="p-3">Nom de la Variable</th>
                          <th className="p-3">Unité</th>
                          <th className="p-3">ID du Capteur (variableId)</th>
                          <th className="p-3">Matériel (deviceId)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const query = privaSearch.toLowerCase().trim();
                          const filteredCatalog = privaCatalog.filter(dp => 
                            dp.name.toLowerCase().includes(query) || 
                            dp.variableId.toLowerCase().includes(query)
                          );
                          
                          if (filteredCatalog.length === 0) {
                            return (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-xs text-muted-foreground font-bold">
                                  Aucune variable ne correspond à votre recherche.
                                </td>
                              </tr>
                            );
                          }

                          return filteredCatalog.map((dp, idx) => {
                            const isSelected = isDatapointSelected(dp);
                            return (
                              <tr key={idx} className="border-b text-xs hover:bg-muted/5 font-bold text-slate-700 dark:text-slate-300">
                                <td className="p-3 pl-6 text-center">
                                  <button
                                    onClick={() => toggleCatalogDatapoint(dp)}
                                    className="focus:outline-none hover:scale-110 active:scale-95 transition-transform"
                                    title={isSelected ? "Désélectionner du graphique" : "Sélectionner pour le graphique"}
                                  >
                                    {isSelected ? (
                                      <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                                    ) : (
                                      <Square className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0" />
                                    )}
                                  </button>
                                </td>
                                <td className="p-3 font-bold text-foreground text-[11px]">{dp.name}</td>
                                <td className="p-3 text-muted-foreground">{dp.unit || "N/A"}</td>
                                <td className="p-3 font-mono text-[10px] text-primary select-all">{dp.variableId}</td>
                                <td className="p-3 text-muted-foreground font-mono text-[10px]">{dp.deviceId}</td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Agronomic Analysis Tab Content */
              <div className="flex-1 overflow-y-auto bg-muted/10 p-6 md:p-10 space-y-6 max-h-[calc(100vh-3.5rem)] select-none">
                {/* Global Performance Summary Cards */}
                {(() => {
                  const daysCount = dynamicAgronomicData.length;
                  if (daysCount === 0) {
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
                        <Card className="border-none shadow-md bg-background rounded-2xl md:col-span-4 p-8 text-center text-xs text-muted-foreground font-bold">
                          Aucune donnée disponible pour l'analyse. Veuillez d'abord charger les données dans l'onglet Graphique.
                        </Card>
                      </div>
                    );
                  }

                  const avgScore = Math.round(dynamicAgronomicData.reduce((sum, d) => sum + d.overallScore, 0) / daysCount);
                  const totalLoss = dynamicAgronomicData.reduce((sum, d) => sum + d.potentialGain, 0);
                  const optimalDays = dynamicAgronomicData.filter(d => d.status === "Optimal").length;
                  const alertDays = dynamicAgronomicData.filter(d => d.status === "Alerte Climat").length;

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 w-full">
                      <Card className="border-none shadow-md bg-background rounded-2xl md:col-span-1">
                        <CardContent className="p-5 flex items-center gap-4">
                          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                            <Award className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Score Agronomique Moyen</p>
                            <h3 className="text-xl font-black text-foreground">{avgScore} / 100</h3>
                            <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">
                              {avgScore >= 90 ? "Excellent niveau" : avgScore >= 75 ? "Niveau satisfaisant" : "Ajustements urgents requis"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-md bg-gradient-to-br from-rose-500/5 to-transparent border border-rose-500/10 rounded-2xl md:col-span-2">
                        <CardContent className="p-5 flex items-center gap-4">
                          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
                            <TrendingDown className="h-5 w-5 animate-pulse" />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider font-black">Potentiel de Gain Cumulé Perdu</p>
                            <h3 className="text-xl font-black text-rose-600">-{totalLoss.toFixed(1)} g/m²</h3>
                            <p className="text-[9px] text-rose-500 font-bold mt-1 leading-snug">
                              L&apos;optimisation de la conduite, malgré le climat extérieur, aurait pu faire gagner {totalLoss.toFixed(1)} g/m² supplémentaire.
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-md bg-background rounded-2xl md:col-span-1">
                        <CardContent className="p-5 flex items-center gap-4">
                          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Jours Optimaux</p>
                            <h3 className="text-xl font-black text-foreground">{optimalDays} / {daysCount}</h3>
                            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Climat de cible atteint</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-md bg-background rounded-2xl md:col-span-1">
                        <CardContent className="p-5 flex items-center gap-4">
                          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
                            <ShieldAlert className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Alertes Climat</p>
                            <h3 className="text-xl font-black text-rose-500">{alertDays} Jours</h3>
                            <p className="text-[10px] text-rose-400 font-semibold mt-0.5">Fermeture stomatique</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()}

                {/* Main Grid */}
                {dynamicAgronomicData.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Days list */}
                    <div className="lg:col-span-1 space-y-3">
                      <Card className="border-none shadow-md bg-background rounded-2xl">
                        <CardHeader className="p-5 pb-3">
                          <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                            Historique des Jours
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 pt-0 space-y-2">
                          {dynamicAgronomicData.map(d => {
                            const isActive = d.day === selectedDayNum || (selectedDayNum > dynamicAgronomicData.length && d.day === 1)
                            return (
                              <button
                                key={d.day}
                                onClick={() => setSelectedDayNum(d.day)}
                                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                                  isActive 
                                    ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/15" 
                                    : "bg-card border-border/50 hover:bg-slate-50/50 hover:border-slate-300"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                    isActive ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                                  }`}>
                                    J{d.day}
                                  </div>
                                  <div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase">{d.dateStr}</div>
                                    <div className={`text-[10px] font-black uppercase ${
                                      d.statusColor === "emerald" ? "text-emerald-500" : d.statusColor === "amber" ? "text-amber-500" : "text-rose-500"
                                    }`}>
                                      {d.status}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className="text-[9px] font-bold text-slate-400">Perte</div>
                                  <div className={`text-xs font-black ${
                                    isActive ? "text-rose-300" : "text-rose-600"
                                  }`}>
                                    -{d.potentialGain.toFixed(1)} g/m²
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right: Selected Day Audit Detail */}
                    <div className="lg:col-span-2 space-y-6">
                      {(() => {
                        const day = dynamicAgronomicData.find(d => d.day === selectedDayNum) || dynamicAgronomicData[0]
                        return (
                          <Card className="border-none shadow-md bg-background overflow-hidden rounded-2xl">
                            <CardHeader className="p-6 pb-3 border-b bg-muted/15 flex flex-row items-center justify-between">
                              <div>
                                <CardTitle className="text-sm font-black uppercase tracking-tight flex flex-col gap-1">
                                  <span>Audit du {day.dateStr} — Score : {day.overallScore}/100</span>
                                  <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase mt-0.5">
                                    Somme de Radiation : <span className="text-primary">{day.radiationSumJcm2} J/cm²</span> | Potentiel Optimal : <span className="text-emerald-600">{day.yieldPotentialGrams} g/m²</span> | Perte : <span className="text-rose-600">-{day.potentialGain} g/m²</span>
                                  </span>
                                </CardTitle>
                              </div>
                              <Badge className={`bg-${day.statusColor}-500/10 text-${day.statusColor}-500 border-${day.statusColor}-500/20 font-bold px-2 py-0.5 text-[10px]`}>
                                {day.status}
                              </Badge>
                            </CardHeader>
                            
                            <CardContent className="p-6 space-y-6">
                              {/* Target ranges */}
                              <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b pb-1.5 flex items-center gap-1.5">
                                  <Maximize2 className="h-3.5 w-3.5 text-emerald-500" /> Facteurs Limitant le Gain Cumulé
                                </h4>

                                <div className="space-y-4">
                                  {day.audits.map((audit) => {
                                    const isOptimal = audit.status === "optimal"
                                    const isMissing = audit.status === "missing"
                                    
                                    if (isMissing) {
                                      return (
                                        <div key={audit.name} className="p-3 rounded-xl bg-muted/10 border border-border/20 border-dashed space-y-1">
                                          <div className="flex justify-between items-center text-xs opacity-60">
                                            <span className="font-bold text-muted-foreground">{audit.name}</span>
                                            <Badge className="font-black text-[9px] bg-muted/40 text-muted-foreground/60 border border-muted-foreground/10">Non surveillé</Badge>
                                          </div>
                                          <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                                            {audit.impact}
                                          </p>
                                        </div>
                                      );
                                    }

                                    const percentApplied = ((audit.applied - (audit.targetMin - 2)) / ((audit.targetMax + 2) - (audit.targetMin - 2))) * 100
                                    const clampedPercent = Math.max(5, Math.min(95, percentApplied))
                                    
                                    return (
                                      <div key={audit.name} className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                          <div>
                                            <span className="font-bold text-foreground">{audit.name}</span>
                                            <span className="text-[10px] text-muted-foreground font-semibold ml-1.5">
                                              (Cible : {audit.targetMin} - {audit.targetMax} {audit.unit})
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-muted-foreground">Relevé :</span>
                                            <Badge className={`font-black text-[10px] ${
                                              audit.status === "optimal" 
                                                ? "bg-emerald-500 text-white" 
                                                : "bg-rose-500 text-white"
                                            }`}>
                                              {audit.applied} {audit.unit}
                                            </Badge>
                                          </div>
                                        </div>

                                        {/* Slider visual */}
                                        <div className="relative pt-3 pb-1">
                                          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full relative">
                                            <div 
                                              className="absolute h-1.5 bg-emerald-400 rounded-full opacity-50" 
                                              style={{ left: "25%", right: "25%" }} 
                                            />
                                            <div 
                                              className={`absolute h-3 w-3 -top-0.5 rounded-full border border-white shadow-md transition-all ${
                                                audit.status === "optimal" ? "bg-emerald-500" : "bg-rose-500"
                                              }`}
                                              style={{ left: `${clampedPercent}%`, transform: 'translateX(-50%)' }}
                                            />
                                          </div>
                                          
                                          <div className="flex justify-between text-[8px] font-bold text-slate-400 pt-1.5">
                                            <span>Bas ({audit.targetMin - 1} {audit.unit})</span>
                                            <span className="text-emerald-500">Cible Min ({audit.targetMin})</span>
                                            <span className="text-emerald-500">Cible Max ({audit.targetMax})</span>
                                            <span>Élevé ({audit.targetMax + 1} {audit.unit})</span>
                                          </div>
                                        </div>

                                        <div className="flex justify-between items-center text-[10px] font-semibold">
                                          <p className={isOptimal ? "text-emerald-600" : "text-rose-500"}>
                                            {isOptimal ? "✓ Performance optimale atteinte." : `✗ ${audit.impact}`}
                                          </p>
                                          {!isOptimal && (
                                            <span className="text-[9px] uppercase font-black text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded-md border border-rose-500/10">
                                              Origine : {audit.origin}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Agronomic / Economic explanations */}
                              <div className="p-4 bg-slate-900/5 dark:bg-slate-100/5 rounded-xl border border-border/50 flex gap-3">
                                <div className="p-2 bg-emerald-500 text-white rounded-lg h-fit shrink-0">
                                  <Leaf className="h-4 w-4" />
                                </div>
                                <div>
                                  <h4 className="text-xs font-black text-foreground uppercase tracking-wider mb-1">Commentaire Physiologique</h4>
                                  <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                                    {day.physiologicalExplanation}
                                  </p>
                                </div>
                              </div>

                              {/* Step-by-Step Action Plan */}
                              <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b pb-1.5 flex items-center gap-1.5">
                                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Actions Recommandées
                                </h4>
                                <ul className="space-y-2">
                                  {day.actionPlan.map((action, index) => (
                                    <li key={index} className="flex gap-2.5 items-start text-xs font-semibold text-slate-700 dark:text-slate-300">
                                      <div className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">
                                        {index + 1}
                                      </div>
                                      <span>{action}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-12 bg-background border border-muted/20 shadow-sm rounded-2xl">
                    <p className="text-xs text-muted-foreground font-bold uppercase">Aucune donnée chargée pour la période sélectionnée.</p>
                  </div>
                )}
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}
