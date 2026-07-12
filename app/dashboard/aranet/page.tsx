"use client";

import { useEffect, useState, useMemo } from "react";
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
  CheckCircle2,
  AlertTriangle,
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
  { key: "sap_ratio_24", name: "Sap Flow ration Top/bottom", category: "Physiologie", metricId: "24", color: "#4f46e5", sensorId: "135267405", units: [{ id: "18", name: "Ratio" }, { id: "123", name: "/" }] }
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
  sap_ratio_24: "Ratio"
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
  const [privaSearch, setPrivaSearch] = useState("");

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
        throw new Error(errJson.details || `Erreur Priva API status ${valRes.status}`);
      }

      const valData = await valRes.json();
      const series = valData.data || [];

      // Extract the last non-null value for each variable
      const valuesMap: Record<string, { value: number; time: string; unit: string }> = {};
      
      keyMetrics.forEach(m => {
        const matchSeries = series.find((s: any) => s.variableId === m.variableId);
        if (matchSeries && matchSeries.values && matchSeries.values.length > 0) {
          const nonNullValues = matchSeries.values.filter((v: any) => v.value !== null && v.value !== undefined);
          if (nonNullValues.length > 0) {
            const latest = nonNullValues[nonNullValues.length - 1];
            valuesMap[m.key] = {
              value: Number(latest.value.toFixed(2)),
              time: new Date(latest.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              unit: m.unit
            };
          }
        }
      });

      setPrivaValues(valuesMap);
    } catch (err: any) {
      console.error("fetchPrivaData error:", err);
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

  const [startDate, setStartDate] = useState<string>(getPastDateStr(7));
  const [endDate, setEndDate] = useState<string>(getTodayStr());
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
      // Date ranges are determined dynamically relative to today's date on every reload
    } catch (e) {
      console.error("Failed to load saved configurations", e);
    }

    // Merge/initialize missing configs
    PLOTTABLE_METRICS.forEach(m => {
      if (!activeConfigs[m.key]) {
        activeConfigs[m.key] = {
          unit: m.units[0].id,
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
      // Date ranges default to relative periods on every reload
    } catch (e) {
      console.error("Failed to save configurations", e);
    }
  }, [selectedKeys, metricConfigs, isLoaded, plantsOnScale, densityPerM2, startDate, endDate]);

  const toggleKey = (key: string) => {
    setSelectedKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const updateMetricConfig = (key: string, field: string, value: any) => {
    setMetricConfigs(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const applyGlobalSmoothing = (smooth: boolean) => {
    setMetricConfigs(prev => {
      const next = { ...prev };
      PLOTTABLE_METRICS.forEach(m => {
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
      PLOTTABLE_METRICS.forEach(m => {
        next[m.key] = {
          ...next[m.key],
          sgWindow: size
        };
      });
      return next;
    });
  };

  // Fetch data for active metrics
  const fetchActiveData = async () => {
    if (selectedKeys.length === 0) {
      setRawDataMap({});
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const promises = selectedKeys.map(async (key) => {
        const m = PLOTTABLE_METRICS.find(item => item.key === key)!;
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
            // Sort ascending by time to find the earliest reading (midnight baseline)
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

          // Sort back computed readings by time
          computedReadings.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
          readings = computedReadings;
        }

        return {
          key,
          readings
        };
      });

      const results = await Promise.all(promises);
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

  // Re-fetch when selections, configurations, or date range changes
  useEffect(() => {
    if (Object.keys(metricConfigs).length > 0) {
      fetchActiveData();
    }
  }, [selectedKeys, metricConfigs, startDate, endDate]);

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

  // Merge datasets into a single chart structure based on absolute timestamp alignment with dynamic decimation
  const chartData = useMemo(() => {
    if (Object.keys(rawDataMap).length === 0) return [];

    const step = 2; // Pas fixe de 2 minutes pour tous les temps et zooms

    // Apply smoothing if enabled for each sensor
    const smoothedDataMap: { [key: string]: { readings: any[], rawValues: number[] } } = {};
    selectedKeys.forEach((key) => {
      const readings = rawDataMap[key] || [];
      
      // Decimate readings first
      const decimatedReadings = [];
      for (let i = 0; i < readings.length; i += step) {
        if (readings[i]) {
          decimatedReadings.push(readings[i]);
        }
      }

      const config = metricConfigs[key];
      const isSmooth = config?.smooth === true || config?.smooth === "true";
      let windowSize = Number(config?.sgWindow || 9);
      
      // Savitzky-Golay requires an odd window size
      if (windowSize % 2 === 0) {
        windowSize += 1;
      }

      const rawValues = decimatedReadings.map((r: any) => {
        if (key === "plant_weight_gain") {
          return (r.value / plantsOnScale) * densityPerM2;
        }
        return r.value;
      });
      if (isSmooth && decimatedReadings.length > 0) {
        const smoothedValues = applySavitzkyGolay(rawValues, windowSize, 2);
        smoothedDataMap[key] = {
          readings: decimatedReadings.map((r: any, idx: number) => ({
            ...r,
            value: smoothedValues[idx]
          })),
          rawValues
        };
      } else {
        smoothedDataMap[key] = {
          readings: decimatedReadings.map((r: any, idx: number) => ({
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
    return selectedKeys.filter((k) => !hiddenKeysOnChart.includes(k));
  }, [selectedKeys, hiddenKeysOnChart]);

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
      const m = PLOTTABLE_METRICS.find(item => item.key === key);
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
    const m = PLOTTABLE_METRICS.find(item => item.key === key);
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
              const metric = PLOTTABLE_METRICS.find(m => m.key === item.dataKey);
              if (!metric) return null;
              const config = metricConfigs[item.dataKey];
              const unitName = metric.units.find(u => u.id === config?.unit)?.name || "";

              return (
                <div key={item.dataKey} className="flex flex-col border-t pt-1 border-muted/50 first:border-t-0 first:pt-0">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground truncate max-w-[100px]">{metric.name} :</span>
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

  // Group metrics by visibility
  const visibleMetrics = PLOTTABLE_METRICS.filter(m => selectedKeys.includes(m.key));
  const hiddenMetrics = PLOTTABLE_METRICS.filter(m => !selectedKeys.includes(m.key));

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
            <span className="truncate flex-1">{m.name}</span>
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
              onClick={() => setActiveTab("charts")}
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
                        const m = PLOTTABLE_METRICS.find(item => item.key === key);
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
                            {m.name}
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
                                    const m = PLOTTABLE_METRICS.find(item => item.key === key)!;
                                    const config = metricConfigs[key] || { axis: "left" };
                                    const unitName = m.units.find(u => u.id === config.unit)?.name || "";
                                    const sensorColor = config.color || m.color;
                                    const isSmooth = config.smooth === true || config.smooth === "true";

                                    const lines = [
                                      <Line
                                        key={`${key}-smoothed`}
                                        yAxisId={`${config.axis || "left"}-${unitName}`}
                                        type="monotone"
                                        dataKey={key}
                                        name={`${m.name} (${unitName})`}
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
                                          name={`${m.name} (Brut)`}
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
                                        const m = PLOTTABLE_METRICS.find(item => item.key === key)!;
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
                                  const m = PLOTTABLE_METRICS.find(item => item.key === key)!;
                                  const label = METRIC_BADGES[key] || key.substring(0, 3);
                                  const config = metricConfigs[key] || {};
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
                                  const m = PLOTTABLE_METRICS.find(item => item.key === key)!;
                                  const label = METRIC_BADGES[key] || key.substring(0, 3);
                                  const config = metricConfigs[key] || {};
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
                        <CardContent className="p-4 max-h-[380px] overflow-y-auto space-y-1">
                          {visibleMetrics.length === 0 ? (
                            <div className="text-center py-8 text-xs text-muted-foreground font-semibold">
                              Aucun capteur activé. Cochez des capteurs dans la liste de droite.
                            </div>
                          ) : (
                            visibleMetrics.map(renderSensorItem)
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
                        <CardContent className="p-4 max-h-[380px] overflow-y-auto space-y-1">
                          {hiddenMetrics.length === 0 ? (
                            <div className="text-center py-8 text-xs text-emerald-500 font-bold">
                              Tous les capteurs sont actuellement actifs sur le graphique !
                            </div>
                          ) : (
                            hiddenMetrics.map(renderSensorItem)
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
                          <th className="p-3 pl-6">Nom de la Variable</th>
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
                                <td colSpan={4} className="p-8 text-center text-xs text-muted-foreground font-bold">
                                  Aucune variable ne correspond à votre recherche.
                                </td>
                              </tr>
                            );
                          }

                          return filteredCatalog.map((dp, idx) => (
                            <tr key={idx} className="border-b text-xs hover:bg-muted/5 font-bold text-slate-700 dark:text-slate-300">
                              <td className="p-3 pl-6 font-bold text-foreground text-[11px]">{dp.name}</td>
                              <td className="p-3 text-muted-foreground">{dp.unit || "N/A"}</td>
                              <td className="p-3 font-mono text-[10px] text-primary select-all">{dp.variableId}</td>
                              <td className="p-3 text-muted-foreground font-mono text-[10px]">{dp.deviceId}</td>
                            </tr>
                          ));
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="border-none shadow-md bg-background rounded-2xl">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Score Agronomique Moyen</p>
                        <h3 className="text-xl font-black text-foreground">81 / 100</h3>
                        <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">Niveau satisfaisant</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-md bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10 rounded-2xl">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                        <TrendingUp className="h-5 w-5 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Marge Manquée</p>
                        <h3 className="text-xl font-black text-foreground">+1.39 €/m²</h3>
                        <p className="text-[10px] text-emerald-500 font-bold mt-0.5">Optimisation potentielle</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-md bg-background rounded-2xl">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Jours Optimaux</p>
                        <h3 className="text-xl font-black text-foreground">3 / 10</h3>
                        <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Climat de cible parfait</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-md bg-background rounded-2xl">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
                        <ShieldAlert className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Alertes Climat</p>
                        <h3 className="text-xl font-black text-rose-500">2 Jours</h3>
                        <p className="text-[10px] text-rose-400 font-semibold mt-0.5">Fermeture stomatique</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Grid */}
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
                        {AGRONOMIC_DATA.map(d => {
                          const isActive = d.day === selectedDayNum
                          const formattedDate = getFormattedDateForDay(d.day)
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
                                  <div className="text-[9px] font-bold text-slate-400 uppercase">{formattedDate}</div>
                                  <div className={`text-[10px] font-black uppercase ${
                                    d.statusColor === "emerald" ? "text-emerald-500" : d.statusColor === "amber" ? "text-amber-500" : "text-rose-500"
                                  }`}>
                                    {d.status}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-[9px] font-bold text-slate-400">Potentiel</div>
                                <div className={`text-xs font-black ${
                                  isActive ? "text-emerald-300" : "text-emerald-600"
                                }`}>
                                  +{d.potentialGain.toFixed(2)} €/m²
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
                      const day = AGRONOMIC_DATA.find(d => d.day === selectedDayNum) || AGRONOMIC_DATA[0]
                      const dayDate = getFormattedDateForDay(day.day)
                      return (
                        <Card className="border-none shadow-md bg-background overflow-hidden rounded-2xl">
                          <CardHeader className="p-6 pb-3 border-b bg-muted/15 flex flex-row items-center justify-between">
                            <div>
                              <CardTitle className="text-sm font-black uppercase tracking-tight">
                                Audit du {dayDate} — Score : {day.overallScore}/100
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
                                <Maximize2 className="h-3.5 w-3.5 text-emerald-500" /> Plages de paramètres à optimiser
                              </h4>

                              <div className="space-y-4">
                                {day.audits.map((audit) => {
                                  const isOptimal = audit.status === "optimal"
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
                                          <span className="text-[10px] text-muted-foreground">Appliqué :</span>
                                          <Badge className={`font-black text-[10px] ${
                                            audit.status === "optimal" 
                                              ? "bg-emerald-500 text-white" 
                                              : audit.status === "high" 
                                                ? "bg-rose-500 text-white" 
                                                : "bg-blue-500 text-white"
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
                                              audit.status === "optimal" ? "bg-emerald-500" : audit.status === "high" ? "bg-rose-500" : "bg-blue-500"
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

                                      <p className={`text-[10px] font-semibold ${
                                        isOptimal ? "text-emerald-600" : "text-rose-500"
                                      }`}>
                                        {isOptimal ? "✓ Performance optimale atteinte." : `✗ ${audit.impact}`}
                                      </p>
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
                                <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Plan d&apos;action correctif
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
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}
