"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, TrendingUp, AlertTriangle, Info, Download, Target } from "lucide-react"
import { createClient } from "@/lib/client"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea
} from "recharts"

const supabase = createClient()

export default function ProjectionCerealesPage() {
  const router = useRouter()
  const [cultures, setCultures] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any>({})
  const [prices, setPrices] = useState({ gnr_price: 1.0, fertilizer_price: 350 })
  const [gnrHedging, setGnrHedging] = useState<{ volume: number, price: number }>({ volume: 0, price: 0 })
  const [fertHedging, setFertHedging] = useState<{ volume: number, price: number }>({ volume: 0, price: 0 })
  const [salesHedging, setSalesHedging] = useState<{ [key: string]: { volume: number, price: number } }>({})
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: settingsData } = await supabase
        .from('cereales_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (settingsData) {
        setCultures(settingsData.cultures || [])
        setExpenses(settingsData.expenses || {})
        setPrices({
            gnr_price: settingsData.gnr_price || 1.0,
            fertilizer_price: settingsData.fertilizer_price || 350
        })
        if (settingsData.gnr_hedging) setGnrHedging(settingsData.gnr_hedging)
        if (settingsData.fertilizer_hedging) setFertHedging(settingsData.fertilizer_hedging)
        if (settingsData.sales_hedging) setSalesHedging(settingsData.sales_hedging)
        setIsDataLoaded(true)
      }
    }
    fetchData()
  }, [])

  // Calculs Moteur Financier
  const projectionData = useMemo(() => {
      if (!isDataLoaded || cultures.length === 0) return []

      const totalSurface = cultures.reduce((acc, c) => acc + (c.surfaceCible || 0), 0)
      if (totalSurface === 0) return []

      const totalGnrLiters = cultures.reduce((acc, c) => acc + (c.gnrQuarterly || [0,0,0,0]).reduce((a:number,b:number)=>a+b,0) * (c.surfaceCible||0), 0)
      const totalFertKg = cultures.reduce((acc, c) => acc + (c.fertilizerMonthly || []).reduce((a:number,b:number)=>a+b,0) * (c.surfaceCible||0), 0)
      
      const structCost = (expenses.c61_mecanisation || 0) + (expenses.c61_fermages || 0) + (expenses.c64_personnel || 0) + (expenses.c68_amort || 0)
      const opCost = (expenses.c60_semences || 0) + (expenses.c60_phyto || 0)

      const currentYear = new Date().getFullYear()
      const data = []

      // Prix de vente par défaut (Spot estimé) si non défini
      const DEFAULT_CROP_PRICE = 180

      for (let i = 0; i < 5; i++) {
          const year = currentYear + i

          // --- SCENARIO BASE (Inflation douce 2%) ---
          const spotGnrBase = prices.gnr_price * Math.pow(1.02, i)
          const spotFertBase = prices.fertilizer_price * Math.pow(1.02, i)
          const spotCropBase = DEFAULT_CROP_PRICE * Math.pow(1.01, i)

          // --- SCENARIO STRESS (Contexte 2022 : Guerre/Inflation -> Intrants x2, Céréales x1.5 mais les intrants tuent la marge) ---
          const spotGnrStress = prices.gnr_price * 2.0
          const spotFertStress = prices.fertilizer_price * 2.5
          const spotCropStress = DEFAULT_CROP_PRICE * 1.5

          // --- SCENARIO OPPORTUNITE (Contexte 2018 : Intrants bas, récoltes correctes) ---
          const spotGnrOpp = Math.max(0.7, prices.gnr_price * 0.8)
          const spotFertOpp = Math.max(250, prices.fertilizer_price * 0.7)
          const spotCropOpp = DEFAULT_CROP_PRICE * 1.1

          const calculateMargin = (spotGnr: number, spotFert: number, spotCrop: number, useHedging: boolean) => {
              // Intrants
              let gnrCost = 0
              if (useHedging) {
                  const hedgedGnrVol = Math.min(gnrHedging.volume, totalGnrLiters)
                  const spotGnrVol = Math.max(0, totalGnrLiters - hedgedGnrVol)
                  gnrCost = (hedgedGnrVol * gnrHedging.price) + (spotGnrVol * spotGnr)
              } else {
                  gnrCost = totalGnrLiters * spotGnr
              }

              let fertCost = 0
              if (useHedging) {
                  const hedgedFertVol = Math.min(fertHedging.volume, totalFertKg/1000)
                  const spotFertVol = Math.max(0, (totalFertKg/1000) - hedgedFertVol)
                  fertCost = (hedgedFertVol * fertHedging.price) + (spotFertVol * spotFert)
              } else {
                  fertCost = (totalFertKg/1000) * spotFert
              }

              const totalCosts = gnrCost + fertCost + structCost + opCost

              // Revenus Ventes
              let totalRevenue = 0
              cultures.forEach(cult => {
                  const volTotal = cult.volume || 0
                  if (useHedging && salesHedging[cult.id]) {
                      const hedgedVol = Math.min(salesHedging[cult.id].volume, volTotal)
                      const spotVol = Math.max(0, volTotal - hedgedVol)
                      totalRevenue += (hedgedVol * salesHedging[cult.id].price) + (spotVol * spotCrop)
                  } else {
                      totalRevenue += volTotal * spotCrop
                  }
              })

              return (totalRevenue - totalCosts) / totalSurface
          }

          // En année 0, on a des couvertures. En N+1 et après, les couvertures actuelles expirent
          // Sauf si l'utilisateur met en place de nouvelles couvertures, mais la projection suppose
          // que la "Stratégie" sera maintenue au même prorata, ou alors on expose au spot.
          // Faisons l'hypothèse que la stratégie de couverture de l'Année 0 est répliquée 
          // par rapport au marché (i.e. on amortit les chocs).
          
          // Marge de Base
          const margeBase = calculateMargin(spotGnrBase, spotFertBase, spotCropBase, i === 0)
          
          // Marges Scénarios
          const margeStress = calculateMargin(spotGnrStress, spotFertStress, spotCropStress, i === 0)
          const margeOpp = calculateMargin(spotGnrOpp, spotFertOpp, spotCropOpp, i === 0)

          data.push({
              year: year.toString(),
              margeBase: Math.round(margeBase),
              margeStress: Math.round(margeStress),
              margeOpp: Math.round(margeOpp)
          })
      }

      return data
  }, [cultures, expenses, prices, gnrHedging, fertHedging, salesHedging, isDataLoaded])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-100">
          <p className="font-black text-slate-900 mb-3">{label}</p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => {
                const isBase = entry.dataKey === 'margeBase'
                return (
                  <div key={index} className={`flex justify-between gap-6 items-center ${isBase ? '' : 'opacity-60 text-xs'}`}>
                    <span style={{ color: entry.color }} className={isBase ? 'font-bold' : 'font-medium'}>
                        {entry.name}
                    </span>
                    <span className={`font-black ${isBase ? 'text-lg' : 'text-sm'} text-slate-800`}>
                        {entry.value.toLocaleString('fr-FR')} €/ha
                    </span>
                  </div>
                )
            })}
          </div>
        </div>
      );
    }
    return null;
  }

  const handleExportCSV = () => {
      let csvContent = "data:text/csv;charset=utf-8,"
      csvContent += "Culture;Surface (ha);Rendement (T/ha);GNR T1 (L/ha);GNR T2 (L/ha);GNR T3 (L/ha);GNR T4 (L/ha);Engrais Total (kg/ha)\n"
      cultures.forEach(c => {
          const gnr = c.gnrQuarterly || [0,0,0,0]
          const fert = (c.fertilizerMonthly || []).reduce((a:number,b:number)=>a+b, 0)
          csvContent += `${c.name};${c.surfaceCible};${c.rendement};${gnr[0]};${gnr[1]};${gnr[2]};${gnr[3]};${fert}\n`
      })
      csvContent += "\nAnnee;Marge Base (EUR/ha);Stress (EUR/ha);Opp (EUR/ha)\n"
      projectionData.forEach(p => {
          csvContent += `${p.year};${p.margeBase};${p.margeStress};${p.margeOpp}\n`
      })

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", "rawwin_projection_cereales.csv")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
  }

  if (!isDataLoaded) return null

  const currentMargin = projectionData.length > 0 ? projectionData[0].margeBase : 0

  return (
    <div className="container mx-auto p-6 md:p-12 max-w-7xl animate-in fade-in duration-500">
      
      <div className="mb-12 flex justify-between items-center border-b border-slate-100 pb-8">
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
                Projection des <span className="text-amber-600 italic">Marges Brutes</span>
            </h2>
            <p className="text-slate-500 font-medium text-lg mt-2">
                Simulations financières à 5 ans basées sur votre stratégie.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard/cereales/conseil")} className="rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour Conseil
          </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="border-none shadow-xl rounded-[2rem] bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-2 opacity-80">
                      <Target className="w-5 h-5" />
                      <h3 className="font-bold uppercase tracking-widest text-xs">Marge Actuelle (Année N)</h3>
                  </div>
                  <div className="text-5xl font-black tracking-tighter">
                      {currentMargin.toLocaleString('fr-FR')} <span className="text-2xl">€/ha</span>
                  </div>
                  <p className="mt-4 text-sm font-medium opacity-90">
                      Inclut l'effet positif de vos stratégies de couverture.
                  </p>
              </CardContent>
          </Card>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden mb-12">
          <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
              <div className="flex items-center justify-between">
                  <div>
                      <CardTitle className="text-2xl font-black text-slate-900 uppercase">Évolution de la Marge à l'Hectare</CardTitle>
                      <CardDescription className="text-base mt-2">Projection avec intégration des risques extrêmes (Stress-Tests).</CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleExportCSV} className="rounded-full gap-2 text-primary font-bold">
                      <Download className="w-4 h-4" /> EXPORTER
                  </Button>
              </div>
          </CardHeader>
          <CardContent className="p-8 h-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData} margin={{ top: 20, right: 120, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                          dataKey="year" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontWeight: 'bold' }}
                          dy={10}
                      />
                      <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontWeight: 'bold' }}
                          tickFormatter={(val) => `${val} €`}
                          width={80}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ paddingTop: '40px' }} />
                      
                      {/* Ligne Principale */}
                      <Line 
                          type="monotone" 
                          dataKey="margeBase" 
                          name="Marge Prévisionnelle (Base)" 
                          stroke="#d97706" // amber-600
                          strokeWidth={5} 
                          dot={{ r: 6, fill: '#d97706', strokeWidth: 2, stroke: '#fff' }} 
                          activeDot={{ r: 8 }}
                      />
                      
                      {/* Scénarios Stress (Pointillés) */}
                      <Line 
                          type="monotone" 
                          dataKey="margeStress" 
                          name="Stress Test (Contexte Crise)" 
                          stroke="#ef4444" 
                          strokeWidth={2} 
                          strokeDasharray="5 5"
                          dot={false}
                      />
                      <Line 
                          type="monotone" 
                          dataKey="margeOpp" 
                          name="Stress Test (Contexte Favorable)" 
                          stroke="#10b981" 
                          strokeWidth={2} 
                          strokeDasharray="5 5"
                          dot={false}
                      />
                  </LineChart>
              </ResponsiveContainer>
          </CardContent>
      </Card>
      
    </div>
  )
}
