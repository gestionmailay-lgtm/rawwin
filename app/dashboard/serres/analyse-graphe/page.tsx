"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { TrendingUp, ArrowLeft, Lightbulb, TrendingDown, Thermometer, Flame, Sliders, CheckCircle2, AlertTriangle, ArrowRight, Gauge, HelpCircle, Coins, Percent } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Types
interface DayData {
  day: number
  yield: number         // kg/m²
  price: number         // €/kg
  energyCost: number    // €/m²
  laborCost: number     // €/m²
  otherCosts: number    // €/m²
  
  // Paramètres réels appliqués
  tempDay: number       // °C
  tempNight: number     // °C
  co2: number           // ppm
  ventilation: number   // %
  irrigationEC: number  // mS/cm
  shadingScreen: number // %
  
  // Paramètres optimisés proposés par l'expert IA
  optTempDay: number
  optTempNight: number
  optCo2: number
  optVentilation: number
  optIrrigationEC: number
  optShadingScreen: number
  
  // Textes explicatifs de l'expert
  analysis: string
}

// Données simulées d'un cycle de production de tomates sous serre High-Tech (jours 1 à 25 complétés)
const COMPLETED_DAYS_DATA: DayData[] = [
  {
    day: 1, yield: 0.8, price: 2.10, energyCost: 0.65, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 21.5, tempNight: 16.5, co2: 500, ventilation: 30, irrigationEC: 2.8, shadingScreen: 10,
    optTempDay: 20.8, optTempNight: 15.5, optCo2: 600, optVentilation: 20, optIrrigationEC: 3.0, optShadingScreen: 0,
    analysis: "Première journée caractérisée par un faible rayonnement solaire. La température diurne a été maintenue trop élevée, entraînant un gaspillage d'énergie de chauffage. Une baisse de 0.7°C de consigne jour et de 1.0°C de consigne nuit aurait économisé 12% d'énergie sans nuire à l'assimilation."
  },
  {
    day: 2, yield: 0.85, price: 2.12, energyCost: 0.68, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 22.0, tempNight: 17.0, co2: 550, ventilation: 35, irrigationEC: 2.8, shadingScreen: 15,
    optTempDay: 21.0, optTempNight: 16.0, optCo2: 700, optVentilation: 25, optIrrigationEC: 3.0, optShadingScreen: 5,
    analysis: "Une ventilation excessive a causé une fuite importante du CO2 injecté. Limiter l'aération à 25% aurait permis d'atteindre 700 ppm de CO2 avec la même quantité de gaz brûlé, stimulant le développement foliaire initial."
  },
  {
    day: 3, yield: 0.90, price: 2.15, energyCost: 0.60, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 21.0, tempNight: 16.0, co2: 600, ventilation: 25, irrigationEC: 2.9, shadingScreen: 0,
    optTempDay: 21.2, optTempNight: 15.5, optCo2: 750, optVentilation: 20, optIrrigationEC: 3.1, optShadingScreen: 0,
    analysis: "Journée très lumineuse sous-exploitée. Les plantes réclamaient une dose de CO2 supérieure (750 ppm) et un EC d'irrigation légèrement plus élevé (3.1) pour soutenir la transpiration active et maximiser le taux de nouaison."
  },
  {
    day: 4, yield: 0.95, price: 2.15, energyCost: 0.72, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 22.5, tempNight: 17.5, co2: 500, ventilation: 40, irrigationEC: 2.7, shadingScreen: 20,
    optTempDay: 21.5, optTempNight: 16.0, optCo2: 650, optVentilation: 30, optIrrigationEC: 3.0, optShadingScreen: 10,
    analysis: "Température nocturne trop élevée. Cela stimule une respiration inutile de la plante la nuit, brûlant les sucres produits pendant la journée. Un abaissement à 16°C préserve la qualité des fruits et réduit la facture de chauffage de 15%."
  },
  {
    day: 5, yield: 1.05, price: 2.20, energyCost: 0.58, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 20.5, tempNight: 15.5, co2: 650, ventilation: 20, irrigationEC: 3.0, shadingScreen: 0,
    optTempDay: 20.8, optTempNight: 15.0, optCo2: 800, optVentilation: 15, optIrrigationEC: 3.2, optShadingScreen: 0,
    analysis: "Bonne gestion globale, mais l'EC à 3.0 limite l'absorption hydrique sous fort rayonnement. Augmenter le CO2 à 800 ppm avec une aération resserrée à 15% aurait catalysé une croissance végétative plus équilibrée."
  },
  {
    day: 6, yield: 1.10, price: 2.18, energyCost: 0.63, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 21.8, tempNight: 16.2, co2: 600, ventilation: 25, irrigationEC: 3.0, shadingScreen: 0,
    optTempDay: 21.0, optTempNight: 15.5, optCo2: 750, optVentilation: 20, optIrrigationEC: 3.2, optShadingScreen: 0,
    analysis: "La température moyenne 24h était un peu élevée par rapport au rayonnement cumulé. Un compromis à 21°C le jour aurait maintenu le bon équilibre génératif/végétatif tout en économisant sur les chaudières."
  },
  {
    day: 7, yield: 1.12, price: 2.22, energyCost: 0.70, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 22.0, tempNight: 17.0, co2: 500, ventilation: 35, irrigationEC: 2.9, shadingScreen: 10,
    optTempDay: 21.2, optTempNight: 16.0, optCo2: 700, optVentilation: 25, optIrrigationEC: 3.1, optShadingScreen: 0,
    analysis: "L'écran d'ombrage a été déployé trop tôt (à 10%), réduisant le rayonnement photosynthétiquement actif (PAR). Il valait mieux laisser entrer toute la lumière et compenser par une transpiration accrue via un EC ajusté."
  },
  {
    day: 8, yield: 1.15, price: 2.25, energyCost: 0.66, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 21.0, tempNight: 16.0, co2: 600, ventilation: 25, irrigationEC: 3.0, shadingScreen: 0,
    optTempDay: 21.2, optTempNight: 15.0, optCo2: 800, optVentilation: 18, optIrrigationEC: 3.3, optShadingScreen: 0,
    analysis: "Une conductivité électrique (EC) trop basse sous climat stable réduit la concentration en sucres des tomates. Une cible à 3.3 aurait favorisé la fermeté et l'indice Brix du fruit."
  },
  {
    day: 9, yield: 1.20, price: 2.20, energyCost: 0.55, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 20.2, tempNight: 15.0, co2: 700, ventilation: 15, irrigationEC: 3.2, shadingScreen: 0,
    optTempDay: 20.5, optTempNight: 14.8, optCo2: 850, optVentilation: 15, optIrrigationEC: 3.3, optShadingScreen: 0,
    analysis: "Journée froide mais ensoleillée. Excellente économie d'énergie réalisée. Pousser le CO2 à 850 ppm aurait permis de surcharger l'activité métabolique et de stocker plus d'assimilats dans les fruits."
  },
  {
    day: 10, yield: 1.25, price: 2.24, energyCost: 0.74, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 23.0, tempNight: 18.0, co2: 450, ventilation: 50, irrigationEC: 2.7, shadingScreen: 30,
    optTempDay: 22.0, optTempNight: 16.5, optCo2: 600, optVentilation: 35, optIrrigationEC: 3.0, optShadingScreen: 15,
    analysis: "Climat de type estival précoce. Les ventilations ont été ouvertes en grand (50%), provoquant un dessèchement rapide de l'air. L'aération régulée à 35% avec brumisation aurait maintenu un bon VPD (déficit de pression de vapeur)."
  },
  {
    day: 11, yield: 1.22, price: 2.25, energyCost: 0.78, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 22.8, tempNight: 17.5, co2: 500, ventilation: 45, irrigationEC: 2.8, shadingScreen: 25,
    optTempDay: 21.8, optTempNight: 16.0, optCo2: 650, optVentilation: 30, optIrrigationEC: 3.1, optShadingScreen: 10,
    analysis: "Le compromis thermique jour/nuit n'a pas été respecté. Trop de chauffage a été consommé en début de nuit pour maintenir 17.5°C. Les tomates tolèrent parfaitement 16°C sous ces rayonnements, réduisant les pertes par respiration."
  },
  {
    day: 12, yield: 1.30, price: 2.28, energyCost: 0.52, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 20.0, tempNight: 15.0, co2: 750, ventilation: 10, irrigationEC: 3.3, shadingScreen: 0,
    optTempDay: 20.5, optTempNight: 14.5, optCo2: 800, optVentilation: 10, optIrrigationEC: 3.3, optShadingScreen: 0,
    analysis: "Journée presque parfaite. Les consignes correspondent quasiment au modèle optimal. La plante a converti l'énergie avec une efficience remarquable."
  },
  {
    day: 13, yield: 1.35, price: 2.30, energyCost: 0.50, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 20.5, tempNight: 15.2, co2: 700, ventilation: 12, irrigationEC: 3.2, shadingScreen: 0,
    optTempDay: 20.8, optTempNight: 14.8, optCo2: 800, optVentilation: 10, optIrrigationEC: 3.4, optShadingScreen: 0,
    analysis: "Une légère sous-évaluation de l'EC (3.2 au lieu de 3.4) a entraîné un drainage trop important. En concentrant la solution nutritive à 3.4, nous aurions amélioré la saveur et évité des rejets de nitrates."
  },
  {
    day: 14, yield: 1.40, price: 2.32, energyCost: 0.64, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 21.6, tempNight: 16.4, co2: 600, ventilation: 25, irrigationEC: 3.0, shadingScreen: 5,
    optTempDay: 20.8, optTempNight: 15.2, optCo2: 750, optVentilation: 18, optIrrigationEC: 3.2, optShadingScreen: 0,
    analysis: "Ventilation trop ouverte pour stabiliser l'humidité relative. Il aurait été plus rentable d'activer l'extracteur mécanique cyclique plutôt que de perdre le CO2 par les ouvrants supérieurs."
  },
  {
    day: 15, yield: 1.38, price: 2.35, energyCost: 0.62, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 21.2, tempNight: 16.0, co2: 600, ventilation: 22, irrigationEC: 3.1, shadingScreen: 0,
    optTempDay: 20.8, optTempNight: 15.0, optCo2: 750, optVentilation: 15, optIrrigationEC: 3.3, optShadingScreen: 0,
    analysis: "Optimisation possible sur le chauffage nocturne. Passer de 16°C à 15°C préserve l'énergie sans stresser les plants, à condition que l'humidité soit maintenue sous 85%."
  },
  {
    day: 16, yield: 1.42, price: 2.34, energyCost: 0.58, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 20.8, tempNight: 15.5, co2: 650, ventilation: 18, irrigationEC: 3.2, shadingScreen: 0,
    optTempDay: 21.0, optTempNight: 15.0, optCo2: 800, optVentilation: 15, optIrrigationEC: 3.3, optShadingScreen: 0,
    analysis: "Le niveau de CO2 à 650 ppm était satisfaisant, mais l'ensoleillement de fin d'après-midi justifiait de repousser la consigne à 800 ppm pour capitaliser sur l'assimilation tardive."
  },
  {
    day: 17, yield: 1.45, price: 2.38, energyCost: 0.70, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 22.4, tempNight: 17.2, co2: 500, ventilation: 38, irrigationEC: 2.8, shadingScreen: 15,
    optTempDay: 21.4, optTempNight: 16.0, optCo2: 650, optVentilation: 28, optIrrigationEC: 3.1, optShadingScreen: 5,
    analysis: "L'ombrage à 15% a trop limité la lumière utile. En maintenant un écran ouvert et une température diurne de 21.4°C, on évitait la surchauffe sans pénaliser la photosynthèse globale."
  },
  {
    day: 18, yield: 1.48, price: 2.40, energyCost: 0.60, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 21.0, tempNight: 15.8, co2: 620, ventilation: 20, irrigationEC: 3.0, shadingScreen: 0,
    optTempDay: 20.8, optTempNight: 14.8, optCo2: 750, optVentilation: 15, optIrrigationEC: 3.3, optShadingScreen: 0,
    analysis: "Excellent rendement aujourd'hui. L'abaissement ciblé de la consigne nocturne à 14.8°C aurait permis de dégager 3% de marge opérationnelle supplémentaire sur le gaz."
  },
  {
    day: 19, yield: 1.50, price: 2.42, energyCost: 0.54, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 20.5, tempNight: 15.0, co2: 700, ventilation: 12, irrigationEC: 3.2, shadingScreen: 0,
    optTempDay: 20.6, optTempNight: 14.5, optCo2: 800, optVentilation: 10, optIrrigationEC: 3.4, optShadingScreen: 0,
    analysis: "Une augmentation de la dose nutritionnelle à 3.4 EC est fortement conseillée pour ce niveau de récolte afin d'éviter le ramollissement précoce du collet des fruits."
  },
  {
    day: 20, yield: 1.52, price: 2.45, energyCost: 0.68, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 22.0, tempNight: 16.8, co2: 550, ventilation: 32, irrigationEC: 2.9, shadingScreen: 10,
    optTempDay: 21.0, optTempNight: 15.5, optCo2: 700, optVentilation: 22, optIrrigationEC: 3.2, optShadingScreen: 0,
    analysis: "Les ouvrants de ventilation trop sollicités ont asséché l'air ambiant. Refermer légèrement (22%) et augmenter le CO2 (700 ppm) aurait stabilisé le rendement des bouquets supérieurs."
  },
  {
    day: 21, yield: 1.48, price: 2.44, energyCost: 0.72, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 22.2, tempNight: 17.0, co2: 500, ventilation: 35, irrigationEC: 2.8, shadingScreen: 15,
    optTempDay: 21.2, optTempNight: 15.8, optCo2: 650, optVentilation: 25, optIrrigationEC: 3.1, optShadingScreen: 0,
    analysis: "Perte d'efficacité thermique. Le chauffage a fonctionné en continu alors que l'écran d'ombrage bloquait le soleil passif de l'après-midi. Une gestion dynamique de l'écran s'impose."
  },
  {
    day: 22, yield: 1.55, price: 2.48, energyCost: 0.48, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 20.0, tempNight: 14.8, co2: 780, ventilation: 8, irrigationEC: 3.3, shadingScreen: 0,
    optTempDay: 20.2, optTempNight: 14.5, optCo2: 800, optVentilation: 8, optIrrigationEC: 3.4, optShadingScreen: 0,
    analysis: "Très bonne corrélation entre les faibles besoins énergétiques et la physiologie de la plante. Le niveau de sucre de la récolte de demain s'annonce exceptionnel."
  },
  {
    day: 23, yield: 1.58, price: 2.50, energyCost: 0.50, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 20.2, tempNight: 14.9, co2: 750, ventilation: 10, irrigationEC: 3.2, shadingScreen: 0,
    optTempDay: 20.5, optTempNight: 14.5, optCo2: 800, optVentilation: 10, optIrrigationEC: 3.3, optShadingScreen: 0,
    analysis: "Un ajustement mineur de -0.4°C la nuit permet d'optimiser le gain financier du gaz de 4% additionnels sans impacter le rythme de maturation des grappes."
  },
  {
    day: 24, yield: 1.54, price: 2.52, energyCost: 0.65, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 21.8, tempNight: 16.5, co2: 580, ventilation: 28, irrigationEC: 3.0, shadingScreen: 5,
    optTempDay: 20.8, optTempNight: 15.2, optCo2: 720, optVentilation: 20, optIrrigationEC: 3.2, optShadingScreen: 0,
    analysis: "L'aération forcée a dilué le CO2. Maintenir une humidité de 78% avec aération réduite (20%) aurait augmenté la photosynthèse nette sans induire de risques cryptogamiques (mildiou)."
  },
  {
    day: 25, yield: 1.60, price: 2.55, energyCost: 0.55, laborCost: 0.20, otherCosts: 0.15,
    tempDay: 20.5, tempNight: 15.2, co2: 720, ventilation: 15, irrigationEC: 3.1, shadingScreen: 0,
    optTempDay: 20.5, optTempNight: 14.5, optCo2: 800, optVentilation: 12, optIrrigationEC: 3.3, optShadingScreen: 0,
    analysis: "Journée de fin de cycle intermédiaire. Limiter la consommation de chauffage nocturne à 14.5°C (au lieu de 15.2°C) valorise pleinement le CO2 injecté à 800 ppm pendant les heures de fort ensoleillement."
  }
]

export default function AnalyseGraphePage() {
  const [selectedDayNum, setSelectedDayNum] = useState<number>(25)
  const [activeMetric, setActiveMetric] = useState<"gain" | "climat" | "yield">("gain")
  
  // États pour le simulateur interactif (liés au jour sélectionné)
  const selectedDay = useMemo(() => {
    return COMPLETED_DAYS_DATA.find(d => d.day === selectedDayNum) || COMPLETED_DAYS_DATA[COMPLETED_DAYS_DATA.length - 1]
  }, [selectedDayNum])

  // Valeurs simulées par l'utilisateur
  const [simTempDay, setSimTempDay] = useState<number>(selectedDay.tempDay)
  const [simTempNight, setSimTempNight] = useState<number>(selectedDay.tempNight)
  const [simCo2, setSimCo2] = useState<number>(selectedDay.co2)
  const [simIrrigationEC, setSimIrrigationEC] = useState<number>(selectedDay.irrigationEC)

  // Mettre à jour les sliders lorsque le jour sélectionné change
  React.useEffect(() => {
    setSimTempDay(selectedDay.tempDay)
    setSimTempNight(selectedDay.tempNight)
    setSimCo2(selectedDay.co2)
    setSimIrrigationEC(selectedDay.irrigationEC)
  }, [selectedDay])

  // Modèle physiologique et financier simplifié pour le simulateur de gain
  const simulatedResults = useMemo(() => {
    // Calcul de l'écart par rapport aux paramètres optimaux de l'expert IA
    const diffTempDay = Math.abs(simTempDay - selectedDay.optTempDay)
    const diffTempNight = Math.abs(simTempNight - selectedDay.optTempNight)
    const diffCo2 = Math.abs(simCo2 - selectedDay.optCo2)
    const diffEC = Math.abs(simIrrigationEC - selectedDay.optIrrigationEC)

    // Calcul de l'impact énergétique (chauffage) : déviation par rapport à la température optimale
    // Chauffer plus augmente le coût. Réduire par rapport à l'optimum peut réduire le coût mais baisse le rendement.
    const tempAppliedAvg = (simTempDay + simTempNight) / 2
    const tempOptAvg = (selectedDay.optTempDay + selectedDay.optTempNight) / 2
    const heatingFactor = 1 + (tempAppliedAvg - tempOptAvg) * 0.08 // +8% de coût par degré supplémentaire
    const simEnergyCost = Math.max(0.2, selectedDay.energyCost * heatingFactor)

    // Calcul de l'impact sur le rendement (Photosynthèse & nutrition)
    // Le rendement chute si on s'éloigne de l'optimum de température, de CO2 et de nutrition (EC)
    const penaltyTemp = Math.pow(diffTempDay, 2) * 0.05 + Math.pow(diffTempNight, 2) * 0.03
    const penaltyCo2 = (simCo2 < selectedDay.optCo2) 
      ? ((selectedDay.optCo2 - simCo2) / selectedDay.optCo2) * 0.15 // Jusqu'à -15% si manque de CO2
      : 0 // Pas de pénalité si plus de CO2, mais coût d'injection supplémentaire
    const penaltyEC = Math.pow(diffEC, 2) * 0.1

    const yieldFactor = Math.max(0.6, 1 - (penaltyTemp + penaltyCo2 + penaltyEC))
    const simYield = selectedDay.yield * yieldFactor

    // Calcul financier final
    const revenue = simYield * selectedDay.price
    const netMargin = revenue - simEnergyCost - selectedDay.laborCost - selectedDay.otherCosts
    const actualNetMargin = (selectedDay.yield * selectedDay.price) - selectedDay.energyCost - selectedDay.laborCost - selectedDay.otherCosts
    const optNetMargin = (selectedDay.yield * 1.05 * selectedDay.price) - (selectedDay.energyCost * 0.88) - selectedDay.laborCost - selectedDay.otherCosts // Hypothèse Expert

    const diffToActual = netMargin - actualNetMargin

    return {
      yield: simYield,
      energyCost: simEnergyCost,
      netMargin,
      diffToActual,
      actualNetMargin,
      optNetMargin
    }
  }, [simTempDay, simTempNight, simCo2, simIrrigationEC, selectedDay])

  // Génération des données pour le grand graphique chronologique
  const chartData = useMemo(() => {
    let actualCum = 0
    let optCum = 0
    
    return COMPLETED_DAYS_DATA.map(d => {
      const actualNet = (d.yield * d.price) - d.energyCost - d.laborCost - d.otherCosts
      // On estime le gain optimisé moyen à +13.5% par rapport au réel suite aux corrections d'énergie et de CO2
      const optNet = (d.yield * 1.06 * d.price) - (d.energyCost * 0.86) - d.laborCost - d.otherCosts
      
      actualCum += actualNet
      optCum += optNet

      return {
        jour: `J${d.day}`,
        "Gain Cumulé Réel (€/m²)": Number(actualCum.toFixed(2)),
        "Gain Cumulé Optimisé (€/m²)": Number(optCum.toFixed(2)),
        "Rendement (kg/m²)": d.yield,
        "Prix (€/kg)": d.price,
        "Température (°C)": d.tempDay,
        "Consommation Gaz (€/m²)": d.energyCost,
        "CO2 Appliqué (ppm)": d.co2,
        "CO2 Optimal (ppm)": d.optCo2
      }
    })
  }, [])

  // KPI globaux calculés sur les 25 jours
  const totals = useMemo(() => {
    const totalActualGain = chartData[chartData.length - 1]["Gain Cumulé Réel (€/m²)"]
    const totalOptGain = chartData[chartData.length - 1]["Gain Cumulé Optimisé (€/m²)"]
    const totalYield = COMPLETED_DAYS_DATA.reduce((acc, d) => acc + d.yield, 0)
    const avgPrice = COMPLETED_DAYS_DATA.reduce((acc, d) => acc + d.price, 0) / COMPLETED_DAYS_DATA.length
    const totalEnergy = COMPLETED_DAYS_DATA.reduce((acc, d) => acc + d.energyCost, 0)
    
    return {
      totalActualGain,
      totalOptGain,
      gainGainPercent: ((totalOptGain - totalActualGain) / totalActualGain) * 100,
      totalYield,
      avgPrice,
      totalEnergy
    }
  }, [chartData])

  return (
    <div className="container mx-auto p-6 md:p-12 max-w-7xl space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/50 pb-8">
        <div className="space-y-3">
          <Link href="/dashboard/serres" className="inline-flex items-center gap-2 text-muted-foreground font-bold text-xs uppercase tracking-widest hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour au module Serres
          </Link>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground uppercase flex items-center gap-4">
            <TrendingUp className="h-10 w-10 text-cyan-500" />
            Graphique
          </h2>
          <p className="text-muted-foreground text-xl font-medium max-w-3xl">
            Optimisation physiologique et économique journalière de la culture de tomates sous serres High-Tech.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2 bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20">
          <Badge className="bg-cyan-500 text-white hover:bg-cyan-600 font-bold px-3 py-1">
            Expertise Agronomique IA
          </Badge>
          <p className="text-xs font-bold text-muted-foreground mt-1">Cycle de Production : Tomates Grappes</p>
        </div>
      </div>

      {/* KPI Global Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-xl bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/15 text-emerald-500 rounded-2xl">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Gain Cumulé Réel</p>
              <h3 className="text-2xl font-black text-foreground">{totals.totalActualGain.toFixed(2)} €/m²</h3>
              <p className="text-xs text-emerald-500 font-semibold mt-1">Sur 25 jours terminés</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/15 text-cyan-500 rounded-2xl">
              <Lightbulb className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Gain Cumulé Cible (IA)</p>
              <h3 className="text-2xl font-black text-foreground">{totals.totalOptGain.toFixed(2)} €/m²</h3>
              <p className="text-xs text-cyan-500 font-bold mt-1">
                Optimisation : +{totals.gainGainPercent.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/15 text-blue-500 rounded-2xl">
              <Gauge className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Production Totale</p>
              <h3 className="text-2xl font-black text-foreground">{totals.totalYield.toFixed(1)} kg/m²</h3>
              <p className="text-xs text-muted-foreground font-semibold mt-1">Prix moyen: {totals.avgPrice.toFixed(2)} €/kg</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-500/15 text-orange-500 rounded-2xl">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Facture Énergie Réelle</p>
              <h3 className="text-2xl font-black text-foreground">{totals.totalEnergy.toFixed(2)} €/m²</h3>
              <p className="text-xs text-red-400 font-semibold mt-1">Pertes estimées par surchauffe: 14%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Graph Card */}
      <Card className="shadow-2xl border-border/50 bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
        <CardHeader className="p-8 pb-4 bg-muted/30 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-cyan-500" /> Analyse Climat & Économie
            </CardTitle>
            <CardDescription className="text-base">
              Visualisez le décrochage entre la courbe réelle et le potentiel agronomique optimisé.
            </CardDescription>
          </div>
          
          {/* Métrique selectors */}
          <div className="flex gap-2 bg-slate-900/5 dark:bg-slate-100/5 p-1 rounded-xl w-fit">
            <Button
              variant={activeMetric === "gain" ? "default" : "ghost"}
              onClick={() => setActiveMetric("gain")}
              className="rounded-lg text-xs font-bold"
            >
              Gain Cumulé
            </Button>
            <Button
              variant={activeMetric === "yield" ? "default" : "ghost"}
              onClick={() => setActiveMetric("yield")}
              className="rounded-lg text-xs font-bold"
            >
              Rendement / Prix
            </Button>
            <Button
              variant={activeMetric === "climat" ? "default" : "ghost"}
              onClick={() => setActiveMetric("climat")}
              className="rounded-lg text-xs font-bold"
            >
              CO2 Climatisé
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeMetric === "gain" ? (
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="jour" tick={{ fill: "hsl(var(--muted-foreground))", fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontWeight: 700 }} tickFormatter={(val) => `${val} €`} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', padding: '12px' }}
                    itemStyle={{ fontWeight: 800 }}
                  />
                  <Legend wrapperStyle={{ fontWeight: 700, fontSize: '12px' }} />
                  <Line type="monotone" dataKey="Gain Cumulé Réel (€/m²)" stroke="#10b981" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="Gain Cumulé Optimisé (€/m²)" stroke="#06b6d4" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                </LineChart>
              ) : activeMetric === "yield" ? (
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="jour" tick={{ fill: "hsl(var(--muted-foreground))", fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', padding: '12px' }}
                    itemStyle={{ fontWeight: 800 }}
                  />
                  <Legend wrapperStyle={{ fontWeight: 700, fontSize: '12px' }} />
                  <Bar dataKey="Rendement (kg/m²)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Consommation Gaz (€/m²)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="jour" tick={{ fill: "hsl(var(--muted-foreground))", fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontWeight: 700 }} unit="ppm" axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', padding: '12px' }}
                    itemStyle={{ fontWeight: 800 }}
                  />
                  <Legend wrapperStyle={{ fontWeight: 700, fontSize: '12px' }} />
                  <Line type="monotone" dataKey="CO2 Appliqué (ppm)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="CO2 Optimal (ppm)" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Selector of Day (Timeline selector) */}
      <Card className="border-none shadow-xl bg-card">
        <CardHeader className="p-6">
          <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-cyan-500" /> Historique Journalier - Sélectionner un Jour
          </CardTitle>
          <CardDescription>
            Parcourez chaque jour complété pour afficher son diagnostic physiologique et le potentiel d'optimisation.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200">
            {COMPLETED_DAYS_DATA.map(d => (
              <Button
                key={d.day}
                onClick={() => setSelectedDayNum(d.day)}
                variant={selectedDayNum === d.day ? "default" : "outline"}
                className={`h-12 w-16 shrink-0 rounded-xl font-bold flex flex-col items-center justify-center transition-all ${
                  selectedDayNum === d.day ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : ""
                }`}
              >
                <span className="text-[10px] opacity-75">JOUR</span>
                <span className="text-base font-black">{d.day}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grid: Selected Day details, AI Advice and Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Climat comparison & Economics for Selected Day */}
        <div className="lg:col-span-2 space-y-8">
          
          <Card className="border-none shadow-xl bg-card overflow-hidden">
            <CardHeader className="p-8 pb-4 bg-muted/20 border-b border-border/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">
                  Diagnostic Climat - Jour {selectedDayNum}
                </CardTitle>
                <CardDescription>
                  Comparatif des paramètres physiques réels vs. consignes de l'expert IA.
                </CardDescription>
              </div>
              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold px-3 py-1">
                Optimisation requise
              </Badge>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Physical metrics */}
                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b pb-2">Climat de la Serre</h4>
                  
                  <div className="space-y-4">
                    {/* Temp Day */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold flex items-center gap-2"><Thermometer className="h-4 w-4 text-orange-500" /> T° Jour</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground line-through font-medium">{selectedDay.tempDay} °C</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-black text-emerald-500 bg-emerald-500/10 py-1 px-2 rounded-lg">{selectedDay.optTempDay} °C</span>
                      </div>
                    </div>

                    {/* Temp Night */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold flex items-center gap-2"><Thermometer className="h-4 w-4 text-blue-500" /> T° Nuit</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground line-through font-medium">{selectedDay.tempNight} °C</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-black text-emerald-500 bg-emerald-500/10 py-1 px-2 rounded-lg">{selectedDay.optTempNight} °C</span>
                      </div>
                    </div>

                    {/* CO2 level */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold flex items-center gap-2"><Gauge className="h-4 w-4 text-cyan-500" /> CO2 Injecté</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground line-through font-medium">{selectedDay.co2} ppm</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-black text-emerald-500 bg-emerald-500/10 py-1 px-2 rounded-lg">{selectedDay.optCo2} ppm</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agronomic adjustments */}
                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b pb-2">Paramètres de Culture</h4>
                  
                  <div className="space-y-4">
                    {/* Irrigation EC */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold flex items-center gap-2"><Percent className="h-4 w-4 text-green-500" /> Irrigation (EC)</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground line-through font-medium">{selectedDay.irrigationEC} mS</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-black text-emerald-500 bg-emerald-500/10 py-1 px-2 rounded-lg">{selectedDay.optIrrigationEC} mS</span>
                      </div>
                    </div>

                    {/* Ventilation */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold flex items-center gap-2"><Gauge className="h-4 w-4 text-purple-500" /> Ouvrants Vent.</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground line-through font-medium">{selectedDay.ventilation} %</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-black text-emerald-500 bg-emerald-500/10 py-1 px-2 rounded-lg">{selectedDay.optVentilation} %</span>
                      </div>
                    </div>

                    {/* Shading Screen */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold flex items-center gap-2"><Sliders className="h-4 w-4 text-slate-500" /> Ombrage</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground line-through font-medium">{selectedDay.shadingScreen} %</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-black text-emerald-500 bg-emerald-500/10 py-1 px-2 rounded-lg">{selectedDay.optShadingScreen} %</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Rationale commentary */}
              <div className="mt-8 p-6 bg-slate-900/5 dark:bg-slate-100/5 rounded-2xl border border-border/50 flex gap-4">
                <div className="p-2 bg-cyan-500 text-white rounded-xl h-fit">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-foreground uppercase tracking-wider mb-1">Analyse du Spécialiste Tomates Hors-Sol</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    {selectedDay.analysis}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Simulator / Interaction */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="border-none shadow-xl bg-slate-950 text-white overflow-hidden relative">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 text-white">
                <Sliders className="h-6 w-6 text-cyan-400" /> Banc de Simulation
              </CardTitle>
              <CardDescription className="text-slate-400">
                Ajustez les curseurs du Jour {selectedDayNum} pour tester l'impact direct sur la marge et la physiologie.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6">
              
              {/* Temp Day slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>TEMPERATURE JOUR (°C)</span>
                  <span className="font-black text-cyan-400">{simTempDay.toFixed(1)} °C</span>
                </div>
                <input 
                  type="range" 
                  min="18" 
                  max="25" 
                  step="0.1"
                  value={simTempDay}
                  onChange={(e) => setSimTempDay(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Temp Night slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>TEMPERATURE NUIT (°C)</span>
                  <span className="font-black text-cyan-400">{simTempNight.toFixed(1)} °C</span>
                </div>
                <input 
                  type="range" 
                  min="12" 
                  max="20" 
                  step="0.1"
                  value={simTempNight}
                  onChange={(e) => setSimTempNight(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* CO2 slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>INJECTION CO2 (ppm)</span>
                  <span className="font-black text-cyan-400">{simCo2} ppm</span>
                </div>
                <input 
                  type="range" 
                  min="350" 
                  max="1000" 
                  step="10"
                  value={simCo2}
                  onChange={(e) => setSimCo2(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* EC Irrigation slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>IRRIGATION (EC in mS)</span>
                  <span className="font-black text-cyan-400">{simIrrigationEC.toFixed(1)} mS</span>
                </div>
                <input 
                  type="range" 
                  min="2.0" 
                  max="4.0" 
                  step="0.1"
                  value={simIrrigationEC}
                  onChange={(e) => setSimIrrigationEC(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Simulator output box */}
              <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Résultat de la Simulation</h4>
                
                {/* Yield output */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 font-medium">Rendement Stimulé :</span>
                  <span className="font-black">{simulatedResults.yield.toFixed(2)} kg/m²</span>
                </div>

                {/* Energy cost output */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 font-medium">Coût Gaz Simulé :</span>
                  <span className="font-black text-orange-400">{simulatedResults.energyCost.toFixed(2)} €/m²</span>
                </div>

                {/* Net Margin result */}
                <div className="flex justify-between items-center text-md border-t border-slate-800 pt-3">
                  <span className="text-slate-300 font-bold">Marge Nette Jour :</span>
                  <span className="font-black text-lg text-emerald-400">{simulatedResults.netMargin.toFixed(2)} €/m²</span>
                </div>

                {/* Comparison to actual applied */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-bold uppercase">Écart vs Réel Appliqué :</span>
                  <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                    simulatedResults.diffToActual >= 0 ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
                  }`}>
                    {simulatedResults.diffToActual >= 0 ? "+" : ""}{simulatedResults.diffToActual.toFixed(2)} €/m²
                  </span>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

      {/* Expert Tips block for cumulative tomato quality */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
        <Card className="border-l-4 border-l-cyan-500 shadow-md">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Équilibre Végétatif / Génératif</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Le pilotage par la température moyenne 24h permet d'orienter la tomate vers la fructification (génératif, température élevée) ou le feuillage (végétatif, basse température). L'IA veille à optimiser cet équilibre selon l'âge de la culture.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-md">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Efficience d'Injection du CO2</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              L'apport de CO2 n'est rentable que si la lumière est suffisante et que les ouvrants de ventilation ne dépassent pas 25% d'ouverture. Au-delà, l'air extérieur dilue instantanément le CO2 injecté à perte.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-md">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Optimisation du VPD</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Le déficit de pression de vapeur (VPD) idéal pour les tomates se situe entre 0.8 et 1.2 kPa. Une déviation ferme les stomates de la feuille, bloquant la photosynthèse et causant le dessèchement de la pointe des fruits (nécrose apicale).
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
