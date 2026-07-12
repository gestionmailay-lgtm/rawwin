"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Lightbulb, 
  Thermometer, 
  Gauge, 
  CheckCircle2, 
  AlertTriangle, 
  Leaf, 
  ArrowRight, 
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Award,
  Maximize2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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

export default function AnalyseAgronomiquePage() {
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1)
  
  const selectedDay = useMemo(() => {
    return AGRONOMIC_DATA.find(d => d.day === selectedDayNum) || AGRONOMIC_DATA[0]
  }, [selectedDayNum])

  // Statistiques moyennes sur l'ensemble de la période d'audit
  const auditSummary = useMemo(() => {
    const totalPotentialGain = AGRONOMIC_DATA.reduce((acc, d) => acc + d.potentialGain, 0)
    const avgScore = Math.round(AGRONOMIC_DATA.reduce((acc, d) => acc + d.overallScore, 0) / AGRONOMIC_DATA.length)
    const optimalDaysCount = AGRONOMIC_DATA.filter(d => d.status === "Optimal").length
    const alertDaysCount = AGRONOMIC_DATA.filter(d => d.status === "Alerte Climat").length

    return {
      totalPotentialGain,
      avgScore,
      optimalDaysCount,
      alertDaysCount
    }
  }, [])

  return (
    <div className="container mx-auto p-6 md:p-12 max-w-7xl space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/50 pb-8">
        <div className="space-y-3">
          <Link href="/dashboard/serres" className="inline-flex items-center gap-2 text-muted-foreground font-bold text-xs uppercase tracking-widest hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour au module Serres
          </Link>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground uppercase flex items-center gap-4">
            <Leaf className="h-10 w-10 text-emerald-500" />
            Analyse <span className="text-emerald-500 italic">Agronomique</span>
          </h2>
          <p className="text-muted-foreground text-xl font-medium max-w-3xl">
            Optimisation physiologique et économique journalière de la culture de tomates sous serres High-Tech.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
          <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 font-bold px-3 py-1">
            Diagnostic & Cibles
          </Badge>
          <p className="text-xs font-bold text-muted-foreground mt-1">Culture : Tomates Hors-Sol</p>
        </div>
      </div>

      {/* Global Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-xl bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/15 text-emerald-500 rounded-2xl">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Score Agronomique Moyen</p>
              <h3 className="text-2xl font-black text-foreground">{auditSummary.avgScore} / 100</h3>
              <p className="text-xs text-emerald-500 font-semibold mt-1">Niveau satisfaisant</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/15 text-emerald-500 rounded-2xl">
              <TrendingUp className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Gain Cumulé Manqué</p>
              <h3 className="text-2xl font-black text-foreground">+{auditSummary.totalPotentialGain.toFixed(2)} €/m²</h3>
              <p className="text-xs text-emerald-500 font-bold mt-1">Perte d'optimisation cumulée</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/15 text-blue-500 rounded-2xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Jours en Cible Optimale</p>
              <h3 className="text-2xl font-black text-foreground">{auditSummary.optimalDaysCount} / {AGRONOMIC_DATA.length}</h3>
              <p className="text-xs text-muted-foreground font-semibold mt-1">Alignement physiologique parfait</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-rose-500/15 text-rose-500 rounded-2xl">
              <ShieldAlert className="h-6 w-6 animate-bounce" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Alertes Climat Majeures</p>
              <h3 className="text-2xl font-black text-rose-500">{auditSummary.alertDaysCount} Jours</h3>
              <p className="text-xs text-rose-400 font-semibold mt-1">Fermeture stomatique critique</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Days List & Detail Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Days Selection Table */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-none shadow-xl bg-card">
            <CardHeader className="p-6">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                Historique des Audits
              </CardTitle>
              <CardDescription>
                Cliquez sur un jour pour voir les plages cibles de paramètres à travailler.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-3">
              {AGRONOMIC_DATA.map(d => {
                const isActive = d.day === selectedDayNum
                return (
                  <button
                    key={d.day}
                    onClick={() => setSelectedDayNum(d.day)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                      isActive 
                        ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/15" 
                        : "bg-card border-border/50 hover:bg-slate-50/50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isActive ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        J{d.day}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Audit Physiologique</div>
                        <div className={`text-xs font-black uppercase ${
                          d.statusColor === "emerald" ? "text-emerald-500" : d.statusColor === "amber" ? "text-amber-500" : "text-rose-500"
                        }`}>
                          {d.status}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400">Potentiel</div>
                      <div className={`text-sm font-black ${
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

        {/* Right: Selected Day Audit details & ranges */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Selected Day Card */}
          <Card className="border-none shadow-xl bg-card overflow-hidden">
            <CardHeader className="p-8 pb-4 bg-muted/20 border-b border-border/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">
                  Audit du Jour {selectedDayNum} — Score : {selectedDay.overallScore}/100
                </CardTitle>
                <CardDescription>
                  Comparatif agronomique détaillé et diagnostic des plages limites.
                </CardDescription>
              </div>
              <Badge className={`bg-${selectedDay.statusColor}-500/10 text-${selectedDay.statusColor}-500 border-${selectedDay.statusColor}-500/20 font-bold px-3 py-1`}>
                {selectedDay.status}
              </Badge>
            </CardHeader>
            
            <CardContent className="p-8 space-y-8">
              
              {/* Target Ranges to work on (Plages à travailler) */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b pb-2 flex items-center gap-2">
                  <Maximize2 className="h-4 w-4 text-emerald-500" /> Plages de paramètres à travailler
                </h3>

                <div className="space-y-6">
                  {selectedDay.audits.map((audit) => {
                    const isOptimal = audit.status === "optimal"
                    const percentApplied = ((audit.applied - (audit.targetMin - 2)) / ((audit.targetMax + 2) - (audit.targetMin - 2))) * 100
                    const clampedPercent = Math.max(5, Math.min(95, percentApplied))
                    
                    return (
                      <div key={audit.name} className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-bold text-sm text-foreground">{audit.name}</span>
                            <span className="text-xs text-muted-foreground font-semibold ml-2">
                              (Cible : {audit.targetMin} - {audit.targetMax} {audit.unit})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-medium">Appliqué :</span>
                            <Badge className={`font-black ${
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

                        {/* Slider visual representation of the range */}
                        <div className="relative pt-4 pb-2">
                          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full relative">
                            {/* Target optimal range block highlighted */}
                            <div 
                              className="absolute h-2 bg-emerald-400 rounded-full opacity-60" 
                              style={{ 
                                left: "25%", 
                                right: "25%" 
                              }} 
                            />
                            {/* Applied value indicator dot */}
                            <div 
                              className={`absolute h-4 w-4 -top-1 rounded-full border-2 border-white shadow-lg transition-all ${
                                audit.status === "optimal" ? "bg-emerald-500" : audit.status === "high" ? "bg-rose-500" : "bg-blue-500"
                              }`}
                              style={{ left: `${clampedPercent}%`, transform: 'translateX(-50%)' }}
                            />
                          </div>
                          
                          {/* Legend values */}
                          <div className="flex justify-between text-[9px] font-bold text-slate-400 pt-2">
                            <span>Trois Bas ({audit.targetMin - 1} {audit.unit})</span>
                            <span className="text-emerald-500">Cible Minimum ({audit.targetMin} {audit.unit})</span>
                            <span className="text-emerald-500">Cible Maximum ({audit.targetMax} {audit.unit})</span>
                            <span>Trop Élevé ({audit.targetMax + 1} {audit.unit})</span>
                          </div>
                        </div>

                        {/* Impact description */}
                        <p className={`text-xs font-semibold leading-relaxed ${
                          isOptimal ? "text-emerald-600" : "text-rose-500"
                        }`}>
                          {isOptimal ? "✓ Performance optimale atteinte." : `✗ ${audit.impact}`}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Advanced Physiological Explanation */}
              <div className="p-6 bg-slate-900/5 dark:bg-slate-100/5 rounded-2xl border border-border/50 flex gap-4">
                <div className="p-3 bg-emerald-500 text-white rounded-xl h-fit">
                  <Leaf className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-foreground uppercase tracking-wider mb-2">Explications Agronomiques & Économiques</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    {selectedDay.physiologicalExplanation}
                  </p>
                </div>
              </div>

              {/* Step-by-Step Action Plan */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b pb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" /> Plan d'action correctif recommandé
                </h4>
                <ul className="space-y-3">
                  {selectedDay.actionPlan.map((action, index) => (
                    <li key={index} className="flex gap-3 items-start text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  )
}
