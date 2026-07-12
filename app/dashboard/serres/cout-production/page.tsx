"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/client"
import { 
    Coins, 
    Calculator, 
    TrendingUp, 
    UserRound, 
    Zap, 
    Package, 
    Building2, 
    Save, 
    RefreshCw, 
    CheckCircle2, 
    Euro, 
    Info, 
    ArrowLeft
} from "lucide-react"
import Link from "next/link"

const supabase = createClient()

interface Segment {
    id: string
    culture: string
    surfaceN1: number
    surfaceCible: number
    rendement: number
    gasMonthly: number[]
}

export default function CoutProductionSerresPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    
    // Data from Supabase
    const [segments, setSegments] = useState<Segment[]>([])
    const [historicalGasTotal, setHistoricalGasTotal] = useState<number[]>(Array(12).fill(0))
    const [gasLegumesPercents, setGasLegumesPercents] = useState<number[]>(Array(12).fill(100))
    const [expenses, setExpenses] = useState({ 
        c60_achats: 0, 
        c60_elec: 0,
        c61_62_externes: 0, 
        c63_impots: 0, 
        c64_personnel: 0,
        c65_autres: 0,
        c66_67_fin_exc: 0,
        c68_amort: 0
    })
    const [gasTaxes, setGasTaxes] = useState({ transport: 0, ticgn: 0, abonnement: 0, cta: 0 })
    const [gasTotalMWhDoc, setGasTotalMWhDoc] = useState(0)
    
    // User parameters
    const [laborRate, setLaborRate] = useState(25)
    const [gasMoleculePrice, setGasMoleculePrice] = useState(45)
    const [segmentLaborHHa, setSegmentLaborHHa] = useState<{ [key: string]: number }>({})

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                setLoading(true)
                const { data: { user } } = await supabase.auth.getUser()
                if (!isMounted) return

                let settings = null
                if (user) {
                    const { data } = await supabase
                        .from('greenhouse_settings')
                        .select('*, gas_total_mwh_doc')
                        .eq('user_id', user.id)
                        .single()
                    settings = data
                } else {
                    const local = localStorage.getItem('greenhouse_settings_guest')
                    if (local) {
                        try {
                            settings = JSON.parse(local)
                        } catch (e) {}
                    }
                }

                if (settings && isMounted) {
                    setSegments(settings.segments || [])
                    setHistoricalGasTotal(settings.historical_gas_total || Array(12).fill(0))
                    setGasLegumesPercents(settings.gas_legumes_percents || Array(12).fill(100))
                    setExpenses(settings.expenses || { 
                        c60_achats: 0, 
                        c60_elec: 0,
                        c61_62_externes: 0, 
                        c63_impots: 0, 
                        c64_personnel: 0,
                        c65_autres: 0,
                        c66_67_fin_exc: 0,
                        c68_amort: 0
                    })
                    setGasTaxes(prev => ({ ...prev, ...(settings.gas_taxes || {}) }))
                    setGasTotalMWhDoc(settings.gas_total_mwh_doc || 0)
                    setLaborRate(settings.labor_rate || 25)
                    setGasMoleculePrice(settings.gas_molecule_price || 45)
                    setSegmentLaborHHa(settings.segment_labor_h_ha || {})
                }
            } catch (err) {
                // Silencieusement ignorer les erreurs de Lock navigator en dev
                if (!(err instanceof Error && err.message.includes("Lock"))) {
                    console.error("Fetch Error:", err);
                }
            } finally {
                if (isMounted) setLoading(false)
            }
        }
        fetchData()
        return () => { isMounted = false }
    }, [])

    const handleSaveParams = async () => {
        setSaving(true)
        setSaveSuccess(false)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                // Mode invité : simulation en mémoire + localStorage
                const local = localStorage.getItem('greenhouse_settings_guest')
                let guestData: any = {}
                if (local) {
                    try { guestData = JSON.parse(local) } catch(e){}
                }
                guestData.labor_rate = laborRate
                guestData.gas_molecule_price = gasMoleculePrice
                guestData.segment_labor_h_ha = segmentLaborHHa
                localStorage.setItem('greenhouse_settings_guest', JSON.stringify(guestData))
                setSaveSuccess(true)
                setTimeout(() => setSaveSuccess(false), 3000)
                return
            }

            await supabase.from('greenhouse_settings').upsert({
                user_id: user.id,
                labor_rate: laborRate,
                gas_molecule_price: gasMoleculePrice,
                segment_labor_h_ha: segmentLaborHHa,
                gas_total_mwh_doc: gasTotalMWhDoc, // On le préserve aussi ici
                updated_at: new Date().toISOString()
            })
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    // CALCULATIONS
    const totalSurface = segments.reduce((acc, s) => acc + (s.surfaceCible || s.surfaceN1 || 0), 0)
    const totalGasMWhLegumes = historicalGasTotal.reduce((acc, val, idx) => acc + (val * (gasLegumesPercents[idx] / 100)), 0) / 1000
    
    const gasTaxesTotal = (gasTaxes.transport || 0) + (gasTaxes.ticgn || 0) + (gasTaxes.abonnement || 0) + (gasTaxes.cta || 0)
    // IMPORTANT: On divise par le volume TOTAL de la facture (doc) pour avoir le coût au MWh réel,
    // car les taxes (Transport, CTA, Abonnement) sont liées au compteur/volume global, pas juste aux légumes.
    const gasTaxRatePerMWh = gasTotalMWhDoc > 0 ? gasTaxesTotal / gasTotalMWhDoc : 0
    const fullGasPrice = Number(gasMoleculePrice) + gasTaxRatePerMWh

    // Global costs per m² (Distributed by total surface)
    const totalSurfaceM2 = Math.max(1, totalSurface * 10000)
    // On n'utilise plus les anciennes clés, on passe tout sur le format c60, c61...

    // Main d'oeuvre Breakdown
    // 1. Calcul de la M.O Opérationnelle totale (basée sur les saisies h/ha/an)
    const totalOperationalLaborCost = segments.reduce((acc, seg) => {
        const sHa = seg.surfaceCible || seg.surfaceN1 || 0
        const hHa = segmentLaborHHa[seg.id] || 0
        return acc + (sHa * hHa * laborRate)
    }, 0)

    // 2. Calcul de la M.O Autre (Résidu entre le SIG/Comptabilité et l'Opérationnel)
    const totalLaborCharges = expenses.c64_personnel || 0
    const residualLaborCost = Math.max(0, totalLaborCharges - totalOperationalLaborCost)
    const laborOtherCostM2 = totalSurfaceM2 > 0 ? residualLaborCost / totalSurfaceM2 : 0

    // Other accounting classes per m²
    const c60M2 = Number(expenses.c60_achats || 0) / totalSurfaceM2
    const elecCostM2 = Number(expenses.c60_elec || 0) / totalSurfaceM2
    const c61_62M2 = Number(expenses.c61_62_externes || 0) / totalSurfaceM2
    const c63M2 = Number(expenses.c63_impots || 0) / totalSurfaceM2
    const c65M2 = Number(expenses.c65_autres || 0) / totalSurfaceM2
    const c66_67M2 = Number(expenses.c66_67_fin_exc || 0) / totalSurfaceM2
    const c68M2 = Number(expenses.c68_amort || 0) / totalSurfaceM2

    const chartData = segments.map(seg => {
        const sHa = seg.surfaceCible || seg.surfaceN1 || 0
        const hHa = segmentLaborHHa[seg.id] || 0
        
        // Labor Cost per m2 (Opérationnelle)
        const moOpM2 = (hHa * laborRate) / 10000
        
        // Energy Cost per m2
        const segTotalKwhM2 = (seg.gasMonthly && seg.gasMonthly.some(v => v > 0))
            ? seg.gasMonthly.reduce((a, b) => a + b, 0)
            : (historicalGasTotal.reduce((a, b) => a + b, 0) * (gasLegumesPercents.reduce((a, b) => a + b, 0) / (12 * 100))) / (totalSurfaceM2 / 10000 || 1)
        
        const energyCostM2 = (segTotalKwhM2 / 1000) * fullGasPrice // Kwh to Mwh * Price/Mwh
        
        const total = moOpM2 + laborOtherCostM2 + energyCostM2 + elecCostM2 + c60M2 + c61_62M2 + c63M2 + c65M2 + c66_67M2 + c68M2
        
        return {
            name: seg.culture,
            "M.O Opérationnelle": Number(moOpM2.toFixed(2)) || 0,
            "M.O Autre (Admin)": Number(laborOtherCostM2.toFixed(2)) || 0,
            "Gaz (Param)": Number(energyCostM2.toFixed(2)) || 0,
            "Électricité (Doc)": Number(elecCostM2.toFixed(2)) || 0,
            "C60 - Achats": Number(c60M2.toFixed(2)) || 0,
            "C61/62 - Externes": Number(c61_62M2.toFixed(2)) || 0,
            "C63 - Impôts": Number(c63M2.toFixed(2)) || 0,
            "C65 - Autres": Number(c65M2.toFixed(2)) || 0,
            "C66/67 - Fin/Exc": Number(c66_67M2.toFixed(2)) || 0,
            "C68 - Amort.": Number(c68M2.toFixed(2)) || 0,
            total: Number(total.toFixed(2))
        }
    }).filter((d : any) => d.total > 0)

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <RefreshCw className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 md:p-20 max-w-[1800px] animate-in fade-in duration-1000">
            {/* HEADER */}
            <div className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-100 pb-12">
                <div className="space-y-4">
                    <Link href="/dashboard/serres/parametrage" className="inline-flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-primary transition-colors mb-4">
                        <ArrowLeft className="h-4 w-4" /> Retour au Paramétrage
                    </Link>
                    <h2 className="text-5xl font-black tracking-tighter text-slate-900 font-outfit uppercase leading-tight">
                        Coûts de <span className="text-primary italic">Production</span>
                    </h2>
                    <p className="text-slate-500 text-2xl font-medium max-w-4xl">
                        Analyse détaillée du coût de revient au m² par segment de culture.
                    </p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-100 py-2 px-4 rounded-xl font-bold">
                        <Coins className="h-4 w-4 mr-2" /> Analyse Financière Active
                    </Badge>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculé sur {totalSurface.toFixed(1)} ha</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
                
                {/* COLONNE PARAMÈTRES */}
                <div className="xl:col-span-1 space-y-8">
                    <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                <Calculator className="h-6 w-6 text-primary" /> Paramètres Globaux
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coût horaire Main d'œuvre (€/h)</Label>
                                <div className="relative">
                                    <Input 
                                        type="number" 
                                        value={laborRate}
                                        onChange={(e) => setLaborRate(Number(e.target.value))}
                                        className="bg-slate-800 border-none h-14 rounded-2xl text-lg font-black pl-12 text-white"
                                    />
                                    <Euro className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coût molécule Gaz (€/MWh)</Label>
                                <div className="relative">
                                    <Input 
                                        type="number" 
                                        value={gasMoleculePrice}
                                        onChange={(e) => setGasMoleculePrice(Number(e.target.value))}
                                        className="bg-slate-800 border-none h-14 rounded-2xl text-lg font-black pl-12 text-white"
                                    />
                                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Taxes extraites (IA)</span>
                                        <span className="text-xs font-black text-emerald-400">+{gasTaxRatePerMWh.toFixed(2)} €/MWh</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[8px] text-slate-500 italic mb-2">
                                        <span>Sur base de {gasTotalMWhDoc} MWh (Doc)</span>
                                    </div>
                                    <p className="text-[8px] text-slate-500 italic leading-tight">Inclut: Transport, TICGN, CTA, Abonnement. Calculé sur le volume total documenté.</p>
                                </div>
                            </div>
                            
                            <Button 
                                onClick={handleSaveParams}
                                disabled={saving}
                                className="w-full bg-primary hover:bg-primary/90 text-white h-16 rounded-2xl font-black uppercase tracking-widest transition-all"
                            >
                                {saving ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                Enregistrer
                            </Button>
                            {saveSuccess && (
                                <p className="text-center text-[10px] font-black text-emerald-400 animate-in fade-in slide-in-from-top-2">Paramètres sauvegardés !</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                <UserRound className="h-6 w-6 text-primary" /> Volume Horaire Segment
                            </CardTitle>
                            <p className="text-[10px] font-bold text-slate-400 -mt-2 italic">(heures / ha / an)</p>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            {segments.map(seg => (
                                <div key={seg.id} className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all">
                                    <Label className="text-[10px] font-black text-slate-900 uppercase truncate block">{seg.culture}</Label>
                                    <div className="flex items-center gap-3">
                                        <Input 
                                            type="number"
                                            value={segmentLaborHHa[seg.id] || 0}
                                            onChange={(e) => setSegmentLaborHHa(prev => ({ ...prev, [seg.id]: Number(e.target.value) }))}
                                            className="h-10 text-center font-black border-slate-200 rounded-lg"
                                        />
                                        <span className="text-[10px] font-bold text-slate-400">h/ha</span>
                                    </div>
                                </div>
                            ))}

                            <Button 
                                onClick={handleSaveParams}
                                disabled={saving}
                                className="w-full bg-slate-900 hover:bg-black text-white h-14 rounded-2xl font-black uppercase tracking-widest transition-all mt-4 shadow-lg shadow-black/10"
                            >
                                {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Enregistrer Volumes
                            </Button>
                            {saveSuccess && (
                                <p className="text-center text-[10px] font-black text-emerald-500 animate-in fade-in slide-in-from-top-2">Volumes enregistrés avec succès !</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* COLONNE GRAPHIQUES */}
                <div className="xl:col-span-3 space-y-12">
                    
                    {/* KPI SUMMARY CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="p-8 bg-white rounded-[2.5rem] shadow-xl border border-slate-50 flex flex-col justify-between group hover:border-primary/20 transition-all">
                             <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6"><UserRound className="h-6 w-6" /></div>
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">C64 - Personnel</p>
                                <p className="text-3xl font-black text-slate-900">{(expenses.c64_personnel || 0).toLocaleString()} €</p>
                             </div>
                        </div>
                        <div className="p-8 bg-white rounded-[2.5rem] shadow-xl border border-slate-50 flex flex-col justify-between group hover:border-primary/20 transition-all">
                             <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6"><Zap className="h-6 w-6" /></div>
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gaz (Calculé) / Élec (Doc)</p>
                                <p className="text-3xl font-black text-slate-900">{Math.round((totalGasMWhLegumes * fullGasPrice) + (expenses.c60_elec || 0)).toLocaleString()} €</p>
                             </div>
                        </div>
                        <div className="p-8 bg-white rounded-[2.5rem] shadow-xl border border-slate-50 flex flex-col justify-between group hover:border-primary/20 transition-all">
                             <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6"><Package className="h-6 w-6" /></div>
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">C60 - Achats Mat. (Audité)</p>
                                <p className="text-3xl font-black text-slate-900">{(expenses.c60_achats || 0).toLocaleString()} €</p>
                             </div>
                        </div>
                        <div className="p-8 bg-white rounded-[2.5rem] shadow-xl border border-slate-50 flex flex-col justify-between group hover:border-primary/20 transition-all">
                             <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center mb-6"><Building2 className="h-6 w-6" /></div>
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amortissements + Taxes</p>
                                <p className="text-3xl font-black text-slate-900">{((expenses.c68_amort || 0) + (expenses.c63_impots || 0)).toLocaleString()} €</p>
                             </div>
                        </div>
                    </div>

                    {/* MAIN CHART */}
                    <Card className="border-none shadow-2xl rounded-[4rem] bg-white overflow-hidden">
                        <CardHeader className="p-12 pb-0 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-3xl font-black uppercase tracking-tighter">Coût de Revient au m²</CardTitle>
                                <CardDescription className="text-lg font-medium mt-2">Répartition par type de charge pour chaque segment de culture.</CardDescription>
                            </div>
                            <div className="flex gap-4">
                                <Badge className="bg-emerald-500 text-white font-black px-4 py-2 rounded-xl">Objectif: 40 €/m²</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-12 pt-16">
                            <div className="h-[600px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={chartData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                        barSize={80}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false}
                                            tickLine={false}
                                            interval={0}
                                            tick={(props: any) => {
                                                const { x, y, payload } = props;
                                                const data = chartData.find(d => d.name === payload.value);
                                                return (
                                                    <g transform={`translate(${x},${y})`}>
                                                        <text x={0} y={20} textAnchor="middle" fill="#64748b" className="text-[10px] font-black uppercase tracking-widest">{payload.value}</text>
                                                        <text x={0} y={45} textAnchor="middle" fill="#0f172a" className="text-sm font-black italic">{data?.total.toFixed(2)} €/m²</text>
                                                    </g>
                                                );
                                            }}
                                        />
                                        <YAxis 
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontWeight: 700, fontSize: 12 }}
                                            tickFormatter={(val) => `${val} €`}
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                borderRadius: '24px', 
                                                border: 'none', 
                                                boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                                                padding: '24px'
                                            }}
                                            itemStyle={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '10px' }}
                                            cursor={{ fill: '#f8fafc' }}
                                        />
                                        <Legend 
                                            verticalAlign="top" 
                                            align="right" 
                                            iconType="circle"
                                            wrapperStyle={{ paddingBottom: '40px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                        />
                                        <Bar dataKey="M.O Opérationnelle" stackId="a" fill="#10b981" />
                                        <Bar dataKey="M.O Autre (Admin)" stackId="a" fill="#059669" />
                                        <Bar dataKey="Gaz (Param)" stackId="a" fill="#2563eb" />
                                        <Bar dataKey="Électricité (Doc)" stackId="a" fill="#60a5fa" />
                                        <Bar dataKey="C60 - Achats" stackId="a" fill="#f59e0b" />
                                        <Bar dataKey="C61/62 - Externes" stackId="a" fill="#6366f1" />
                                        <Bar dataKey="C63 - Impôts" stackId="a" fill="#4f46e5" />
                                        <Bar dataKey="C65 - Autres" stackId="a" fill="#8b5cf6" />
                                        <Bar dataKey="C66/67 - Fin/Exc" stackId="a" fill="#a78bfa" />
                                        <Bar dataKey="C68 - Amort." stackId="a" fill="#c4b5fd" radius={[20, 20, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* TABLEAU RÉCAPITULATIF */}
                    <Card className="border-none shadow-2xl rounded-[4rem] bg-white overflow-hidden">
                        <CardContent className="p-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <h4 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                                        <Info className="h-5 w-5 text-primary" /> Détails du Calcul
                                    </h4>
                                    <ul className="space-y-4 text-sm font-medium text-slate-600">
                                        <li className="flex items-start gap-3">
                                            <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                                            <p><span className="font-black text-slate-900">Énergie :</span> Consommation réelle par segment (€/m²) + Taxes énergétiques pro-ratisées sur les MWh légumes.</p>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                                            <p><span className="font-black text-slate-900">Main d'œuvre :</span> Volume horaire cible (h/ha) multiplié par ton coût horaire chargé, réparti au m².</p>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                                            <p><span className="font-black text-slate-900">Frais Fixes :</span> Les intrants et frais de structure sont répartis uniformément sur la surface totale exploitée.</p>
                                        </li>
                                    </ul>
                                </div>
                                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                     <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Moyenne Pondérée Exploitation</h4>
                                     <div className="space-y-4">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bold text-slate-900">Coût de revient moyen</span>
                                            <span className="text-4xl font-black tracking-tighter text-primary">
                                                {(chartData.reduce((acc, d) => acc + (d.total * (segments.find(s=>s.culture===d.name)?.surfaceCible || 0)), 0) / totalSurface).toFixed(2)} €/m²
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: '75%' }} />
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Performance économique globale</p>
                                     </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
