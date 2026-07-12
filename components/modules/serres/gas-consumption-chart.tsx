"use client"

import React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Données calculées à partir de "Total Gaz Légumes"
// Unité: MWh
const baseVolumeData = [
  { q: "Q1", value: 7090 },
  { q: "Q2", value: 2926 },
  { q: "Q3", value: 1642 },
  { q: "Q4", value: 3596 },
]

const MARKET_PRICES: Record<string, number> = {
  "2026 Q3": 45.52, "2026 Q4": 44.64,
  "2027 Q1": 43.36, "2027 Q2": 35.25, "2027 Q3": 33.63, "2027 Q4": 33.87,
  "2028 Q1": 32.81, "2028 Q2": 26.66, "2028 Q3": 24.77, "2028 Q4": 25.75,
  "2029 Q1": 26.14, "2029 Q2": 22.61, "2029 Q3": 22.40, "2029 Q4": 23.16,
  "2030 Q1": 24.15, "2030 Q2": 22.48, "2030 Q3": 20.41, "2030 Q4": 21.50,
}

const isPastPeriod = (year: number, period: string) => {
  // Aujourd'hui est le 05/05/2026 (Q2 2026)
  return year < 2026 || (year === 2026 && (period === "Q1" || period === "Q2"))
}

const generateData = (hedgingData: Record<string, any>) => {
  const rawData: any[] = []
  const reductionRate = 0.02

  for (let year = 2025; year <= 2030; year++) {
    const i = year - 2025
    const multiplier = Math.pow(1 - reductionRate, i)
    baseVolumeData.forEach((item) => {
      rawData.push({
        year,
        period: item.q,
        value: Math.round(item.value * multiplier)
      })
    })
  }
  return rawData.map(item => {
    const isPast = isPastPeriod(item.year, item.period)
    const periodKey = `${item.year} ${item.period}`
    const hedge = hedgingData[periodKey] || { percentage: 0, price: 0 }
    
    const mktPrice = MARKET_PRICES[periodKey] || 30.25
    const wac = isPast ? 30.25 : (hedge.percentage / 100 * hedge.price) + ((1 - hedge.percentage / 100) * mktPrice)

    const coveredVolume = (hedge.percentage / 100) * item.value
    const spotVolume = item.value - coveredVolume

    return {
      name: `${item.year} ${item.period}`,
      value: item.value,
      covered: coveredVolume,
      spot: spotVolume,
      isProjection: item.year > 2025,
      percentage: hedge.percentage,
      wac: wac,
      marketPrice: mktPrice,
      fixedPrice: hedge.price,
      isPast
    }
  }).filter(item => !item.isPast)
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-card border border-border p-4 rounded-xl shadow-2xl backdrop-blur-md z-50">
        <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest">{label}</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-8">
            <span className="text-sm text-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              Volume Total :
            </span>
            <span className="text-sm font-black">{data.value.toLocaleString()} MWh</span>
          </div>

          <div className="pt-2 border-t border-border/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Part Couverte ({data.percentage}%) :</span>
              <span className="text-xs font-bold text-green-600">{data.covered.toLocaleString(undefined, { maximumFractionDigits: 0 })} MWh</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Part Marché Spot :</span>
              <span className="text-xs font-bold text-slate-500">{data.spot.toLocaleString(undefined, { maximumFractionDigits: 0 })} MWh</span>
            </div>
          </div>

          <div className="pt-2 border-t border-primary/20">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter text-primary">Coût moyen spot/couverture :</span>
              <span className="text-sm font-black text-primary">{data.wac.toFixed(2)} €/MWh</span>
            </div>
            {data.percentage > 0 && (
              <div className="flex items-center justify-between mt-1">
                <Badge variant="outline" className="text-[9px] h-4 bg-green-500/10 text-green-600 border-green-500/20">
                  Économie vs Spot : {((data.marketPrice - data.wac) * data.value).toLocaleString(undefined, { maximumFractionDigits: 0 })} €
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
  return null
}

interface HedgingInfo {
  percentage: number
  price: number
}

interface GasConsumptionChartProps {
  hedgingData: Record<string, HedgingInfo>
}

export function GasConsumptionChart({ hedgingData }: GasConsumptionChartProps) {
  const data = generateData(hedgingData)

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Projection Coût du Gaz à Terme
            </CardTitle>
            <CardDescription className="text-xs font-medium">
              Simulation financière basée sur votre stratégie de hedging et les cours PEG (EEX).
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-green-500 shadow-sm" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Volume Couvert</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-slate-300 shadow-sm" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Marché Spot</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
                angle={-45}
                textAnchor="end"
                interval={0}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
                tickFormatter={(value) => `${value} MWh`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--primary))', opacity: 0.05 }} />
              <Bar 
                dataKey="covered" 
                stackId="a" 
                fill="#22c55e" 
                radius={[0, 0, 0, 0]} 
                barSize={40}
              />
              <Bar 
                dataKey="spot" 
                stackId="a" 
                fill="#cbd5e1" 
                radius={[4, 4, 0, 0]} 
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
