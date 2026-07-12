"use client"

import { useState, useEffect } from "react"
import { Metadata } from "next"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Upload, RotateCcw, CheckCircle2, Sparkles, RefreshCw, Plus, Trash2, AlertTriangle, Gauge, Droplets, Wand2, BrainCircuit } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/client" 

const Months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"]
const supabase = createClient()

interface Culture {
  id: string
  name: string
  surfaceN1: number
  surfaceCible: number
  rendement: number // Tonnes/ha
  volume: number    // Tonnes
  gnrMonthly?: number[] // Keep for backwards compatibility
  gnrQuarterly?: number[] // L/ha (T1, T2, T3, T4)
  fertilizerMonthly: number[] // kg/ha
  reasoning?: string
}

const CROP_INDICATIVES: Record<string, { gnr_leger: number[], gnr_lourd: number[], engrais_nature: string[] }> = {
    'blé': {
        gnr_leger: [15, 15, 35, 15],
        gnr_lourd: [20, 20, 45, 25],
        engrais_nature: ["", "N1 (Ammo)", "N2 (Sol/Urée)", "N3 (Ammo)", "", "", "", "", "PK", "", "", ""]
    },
    'colza': {
        gnr_leger: [15, 15, 30, 20],
        gnr_lourd: [20, 25, 40, 25],
        engrais_nature: ["", "N1", "N2", "", "", "", "", "Fumure de fond", "", "", "", ""]
    },
    'maïs': {
        gnr_leger: [0, 30, 15, 35],
        gnr_lourd: [0, 40, 20, 50],
        engrais_nature: ["", "", "", "Starter NP", "N (Urée/Sol)", "N (Sol)", "", "", "", "", "", ""]
    },
    'orge': {
         gnr_leger: [15, 15, 35, 15],
         gnr_lourd: [20, 20, 45, 25],
         engrais_nature: ["", "N1", "N2", "N3", "", "", "", "", "PK", "", "", ""]
    },
    'tournesol': {
         gnr_leger: [0, 20, 20, 40],
         gnr_lourd: [0, 30, 30, 50],
         engrais_nature: ["", "", "", "NP", "Bore", "", "", "", "", "", "", ""]
    },
    'pois': {
         gnr_leger: [15, 30, 40, 15],
         gnr_lourd: [20, 40, 50, 20],
         engrais_nature: ["", "", "P/K", "", "", "", "", "", "", "", "", ""]
    },
    'betterave': {
         gnr_leger: [20, 30, 30, 50],
         gnr_lourd: [25, 40, 40, 65],
         engrais_nature: ["", "", "N/K", "Bore", "", "", "", "", "", "", "", ""]
    },
    'pomme de terre': {
         gnr_leger: [15, 60, 45, 30],
         gnr_lourd: [20, 80, 60, 40],
         engrais_nature: ["", "NPK", "", "Azote", "", "", "", "", "", "", "", ""]
    },
    'prairie': {
         gnr_leger: [0, 25, 25, 0],
         gnr_lourd: [0, 35, 35, 0],
         engrais_nature: ["", "N", "", "", "", "", "", "", "", "", "", ""]
    }
}

const getIndicativeData = (cultureName: string) => {
    const name = cultureName.toLowerCase();
    if (name.includes('blé') || name.includes('ble')) return CROP_INDICATIVES['blé'];
    if (name.includes('colza')) return CROP_INDICATIVES['colza'];
    if (name.includes('maïs') || name.includes('mais')) return CROP_INDICATIVES['maïs'];
    if (name.includes('orge')) return CROP_INDICATIVES['orge'];
    if (name.includes('tournesol')) return CROP_INDICATIVES['tournesol'];
    if (name.includes('pois') || name.includes('féverole') || name.includes('feverole') || name.includes('lin') || name.includes('protéagineux')) return CROP_INDICATIVES['pois'];
    if (name.includes('betterave')) return CROP_INDICATIVES['betterave'];
    if (name.includes('pomme de terre') || name.includes('patate')) return CROP_INDICATIVES['pomme de terre'];
    if (name.includes('prairie') || name.includes('fauche') || name.includes('herbe')) return CROP_INDICATIVES['prairie'];
    return null;
}

export default function ParametrageCerealesPage() {
  const router = useRouter()
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    resultat: null,
    intrants: null,
  })

  const createEmptyArray = () => Array.from({ length: 12 }, () => 0)

  const [cultures, setCultures] = useState<Culture[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisMode, setAnalysisMode] = useState<"quick" | "financial">("quick")
  const [analysisStep, setAnalysisStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [showReasoning, setShowReasoning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorDetail, setErrorDetail] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0) // 0: Import, 1: Paramétrage
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Frais fixes
  const [expenses, setExpenses] = useState({ 
    c60_semences: 0, 
    c60_phyto: 0,
    c61_mecanisation: 0, 
    c61_fermages: 0,
    c64_personnel: 0,
    c68_amort: 0,
    audit_meta: "" 
  })
  
  const [prices, setPrices] = useState({
      gnr_price: 1.0, // €/L
      fertilizer_price: 350 // €/T
  })

  const [lastImports, setLastImports] = useState<{ [key: string]: { fileName: string, date: string } | null }>({
    resultat: null,
    intrants: null,
  })

  const analysisLog = [
    "Initialisation du moteur de raisonnement Gemini 2.5 Pro...",
    "Lecture intégrale de la Liasse Fiscale (SIG & Résultat)...",
    "Extraction des surfaces de cultures (Blé, Colza, Maïs)...",
    "Audit profond des charges de mécanisation et fermages...",
    "Analyse des factures d'intrants (GNR, Engrais)...",
    "Répartition agro-technique de la consommation annuelle...",
    "Validation finale de la cohérence économique..."
  ]

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: settingsData } = await supabase
        .from('cereales_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (settingsData?.cultures && settingsData.cultures.length > 0) {
        const mappedCultures = settingsData.cultures.map((c: any) => ({
            ...c,
            gnrQuarterly: c.gnrQuarterly || [0,0,0,0]
        }));
        setCultures(mappedCultures)
        setIsDataLoaded(true)
      }
      if (settingsData?.expenses && Object.keys(settingsData.expenses).length > 0) {
        setExpenses(settingsData.expenses)
      }
      if (settingsData?.gnr_price) {
        setPrices(prev => ({ ...prev, gnr_price: settingsData.gnr_price, fertilizer_price: settingsData.fertilizer_price || prev.fertilizer_price }))
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (isDataLoaded) setIsDirty(true)
  }, [cultures, expenses, prices])


  const handleManualSave = async () => {
    setSaving(true)
    setError(null)
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Vous n'êtes pas connecté.")

        const { error: upsertError } = await supabase.from('cereales_settings').upsert({
            user_id: user.id,
            cultures: cultures,
            expenses: expenses,
            gnr_price: prices.gnr_price,
            fertilizer_price: prices.fertilizer_price,
            updated_at: new Date().toISOString()
        })
        
        if (upsertError) throw new Error(upsertError.message)
        
        setIsDirty(false)
        return true
    } catch (err: any) {
        setError(err.message)
        return false
    } finally {
        setSaving(false)
    }
  }

  const handleFinalValidate = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Vous n'êtes pas connecté.")

        setAnalyzing(true)
        setAnalysisStep(0)
        setProgress(5)
        setError(null)

        const success = await handleManualSave()
        if (!success) throw new Error("La sauvegarde a échoué.")

        setProgress(100)
        setTimeout(() => router.push("/dashboard/cereales/cout-production"), 1000)
    } catch (err: any) {
        setError(err.message)
    } finally {
        setAnalyzing(false)
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (analyzing) {
      setAnalysisStep(0)
      interval = setInterval(() => {
        setAnalysisStep(prev => {
          if (prev < analysisLog.length - 1) return prev + 1
          return prev
        })
      }, 800)
    }
    return () => clearInterval(interval)
  }, [analyzing, analysisMode])

  const handleFileChange = async (key: string, file: File | null) => {
    if (!file) {
      setFiles(prev => ({ ...prev, [key]: null }))
      return
    }
    setFiles(prev => ({ ...prev, [key]: file }))
    setLastImports(prev => ({ ...prev, [key]: { fileName: file.name, date: new Date().toISOString() } }))
  }

  // Mock de l'IA pour simuler l'extraction (remplace le backend réel pour l'instant)
  const runGeminiAnalysis = async (mode: "quick" | "financial" = "quick") => {
    setAnalyzing(true)
    setAnalysisMode(mode)
    setError(null)
    setProgress(0)
    
    try {
      setProgress(40)
      await new Promise(resolve => setTimeout(resolve, 3000))
      setProgress(85)
      setAnalysisStep(6)
      
      const mockCultures: Culture[] = [
          { id: '1', name: "Blé Tendre", surfaceN1: 85, surfaceCible: 90, rendement: 8.5, volume: 765, gnrQuarterly: [15, 15, 35, 15], fertilizerMonthly: [0,50,80,40,0,0,0,0,0,0,0,0], reasoning: "Assolement majoritaire détecté via factures." },
          { id: '2', name: "Colza", surfaceN1: 30, surfaceCible: 40, rendement: 3.5, volume: 140, gnrQuarterly: [15, 15, 30, 20], fertilizerMonthly: [0,60,60,0,0,0,0,20,0,0,0,0], reasoning: "Rotation triennale standard." },
          { id: '3', name: "Maïs Grain", surfaceN1: 20, surfaceCible: 20, rendement: 10.0, volume: 200, gnrQuarterly: [0, 30, 15, 35], fertilizerMonthly: [0,0,0,50,100,0,0,0,0,0,0,0], reasoning: "Parcelles irriguées." }
      ]

      setCultures(mockCultures)
      setExpenses({
          c60_semences: 120, // €/ha moyen
          c60_phyto: 180,
          c61_mecanisation: 250,
          c61_fermages: 150,
          c64_personnel: 50,
          c68_amort: 200,
          audit_meta: "Les charges de mécanisation sont légèrement supérieures à la moyenne régionale (+12%)."
      })

      setProgress(100)
      setIsDataLoaded(true)
      setShowReasoning(true)
      setCurrentStep(1)
      
    } catch (err: any) {
      setError("Erreur IA")
    } finally {
      setAnalyzing(false)
    }
  }

  const updateCulture = (id: string, field: keyof Culture, value: string | number) => {
    setCultures(prev => prev.map(cult => {
      if (cult.id === id) {
        const updated = { ...cult, [field]: field === 'name' ? value : parseFloat(value as string) || 0 }
        if (field === 'surfaceCible' || field === 'rendement') {
           const s = Number(field === 'surfaceCible' ? value : cult.surfaceCible) || 0
           const r = Number(field === 'rendement' ? value : cult.rendement) || 0
           updated.volume = Math.round(s * r)
        }
        return updated
      }
      return cult
    }))
  }

  const addCulture = () => {
    const newId = Math.random().toString(36).substr(2, 9)
    setCultures(prev => [
      ...prev, 
      { id: newId, name: "Nouvelle Culture", surfaceN1: 0, surfaceCible: 0, rendement: 0, volume: 0, gnrQuarterly: [0,0,0,0], fertilizerMonthly: createEmptyArray() }
    ])
  }

  const deleteCulture = (id: string) => {
    setCultures(prev => prev.filter(c => c.id !== id))
  }

  const updateInputMonthly = (cultureId: string, type: 'gnrMonthly' | 'fertilizerMonthly' | 'gnrQuarterly', monthIndex: number, value: number) => {
      setCultures(prev => prev.map(cult => {
          if (cult.id === cultureId) {
              const currentArr = cult[type] || [];
              const newArr = [...currentArr];
              newArr[monthIndex] = isNaN(value) ? 0 : value;
              return { ...cult, [type]: newArr }
          }
          return cult
      }))
  }

  return (
    <div className="container mx-auto p-6 md:p-20 max-w-[1800px] animate-in fade-in duration-1000">
      {analyzing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/40 backdrop-blur-2xl animate-in fade-in duration-500">
              <div className="w-full max-w-4xl p-16 bg-slate-950 rounded-[4rem] border-4 border-amber-500/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                  <div className="mb-16 space-y-6">
                      <div className="flex justify-between items-end">
                          <div className="space-y-2">
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Audit Financier IA</span>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Extraction <span className="text-amber-500 italic">Céréales</span></h3>
                          </div>
                          <span className="text-6xl font-black text-white italic tracking-tighter">{progress}%</span>
                      </div>
                      <div className="h-6 w-full bg-slate-900 rounded-full overflow-hidden border-2 border-slate-800 p-1.5">
                          <div 
                              className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400 rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_30px_rgba(245,158,11,0.6)]"
                              style={{ width: `${progress}%` }}
                          />
                      </div>
                  </div>
                  <div className="space-y-6">
                      {analysisLog.map((log, i) => (
                          <div key={i} className={`font-mono text-xl flex items-center gap-6 transition-all duration-700 ${i <= analysisStep ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                              <div className={`h-4 w-4 rounded-full ${i <= analysisStep ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,1)] animate-pulse' : 'bg-slate-800'}`} />
                              <span className={`${i <= analysisStep ? 'text-slate-100 font-bold' : 'text-slate-600'}`}>{log}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* HEADER / INDICATEUR D'ÉTAPE */}
      <div className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-600 text-white font-black text-[10px] tracking-[0.3em] uppercase py-1 px-3">
              {currentStep === 0 ? "PHASE 1 : IMPORTATION" : "PHASE 2 : PARAMÉTRAGE"}
            </Badge>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <h2 className="text-5xl font-black tracking-tighter text-slate-900 font-outfit uppercase leading-tight">
                {currentStep === 0 ? "Import de " : "Paramétrage "} 
                <span className="text-amber-600 italic">Données</span>
            </h2>
            {currentStep === 1 && (
                <Button variant="outline" onClick={() => setCurrentStep(0)} className="rounded-[2.5rem] border-2 h-14 px-8 gap-4 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm hover:shadow-md bg-white mt-2 md:mt-0">
                    <RotateCcw className="h-4 w-4" /> Nouvel Import
                </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
            <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl transition-all duration-700 ${currentStep === 0 ? 'bg-amber-600 text-white shadow-2xl shadow-amber-600/40 rotate-6' : 'bg-slate-100 text-slate-400'}`}>1</div>
            <div className={`h-1.5 w-12 rounded-full transition-all duration-700 ${currentStep === 1 ? 'bg-amber-600' : 'bg-slate-100'}`} />
            <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl transition-all duration-700 ${currentStep === 1 ? 'bg-amber-600 text-white shadow-2xl shadow-amber-600/40 rotate-6' : 'bg-slate-100 text-slate-400'}`}>2</div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-12 rounded-[2rem] border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-black">Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* --- ÉTAPE 1 : IMPORT DE DONNÉES --- */}
      {currentStep === 0 && (
        <div className="space-y-20 animate-in slide-in-from-left-10 duration-700">
            {!analyzing && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                  {[{ id: 'resultat', label: 'Liasse Fiscale (SIG)', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { id: 'intrants', label: 'Factures Intrants (GNR, Engrais)', icon: Droplets, color: 'text-amber-600', bg: 'bg-amber-50' }
                  ].map((doc) => (
                    <Card key={doc.id} className="border-none shadow-2xl rounded-[4rem] bg-white group hover:scale-105 transition-all duration-300">
                        <CardContent className="p-12 text-center space-y-8">
                            <div className={`mx-auto h-24 w-24 rounded-3xl ${doc.bg} ${doc.color} flex items-center justify-center shadow-inner relative`}>
                                <doc.icon className="h-12 w-12" />
                                {(files[doc.id] || lastImports[doc.id]) && (
                                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                )}
                            </div>
                            <h4 className="font-black text-3xl text-slate-900 uppercase tracking-tighter">{doc.label}</h4>
                            <div className="space-y-4">
                                <Label htmlFor={`import-${doc.id}`} className="cursor-pointer block">
                                    <div className={`py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] border-2 transition-all ${files[doc.id] ? 'bg-white text-amber-600 border-amber-600' : 'bg-slate-900 text-white border-slate-900 hover:bg-black shadow-xl'}`}>
                                        {files[doc.id] ? 'Fichier Prêt' : 'Importer'}
                                    </div>
                                </Label>
                                <Input id={`import-${doc.id}`} type="file" className="hidden" accept=".pdf" onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)} />
                            </div>
                        </CardContent>
                    </Card>
                  ))}
                    </div>

                    <div className="flex flex-col items-center gap-6 pt-10">
                         {isDataLoaded && cultures.length > 0 && currentStep === 0 && (
                            <Button onClick={() => setCurrentStep(1)} variant="outline" className="rounded-full px-12 h-16 border-2 font-black uppercase tracking-widest text-slate-500 hover:text-amber-600 hover:border-amber-600 transition-all bg-white">
                                <RotateCcw className="mr-3 h-5 w-5" /> Reprendre le paramétrage existant
                            </Button>
                         )}
                         <Button 
                            onClick={() => runGeminiAnalysis("quick")} 
                            className="bg-amber-600 hover:bg-amber-700 text-white rounded-[3rem] px-24 h-28 text-3xl font-black shadow-2xl shadow-amber-600/40 transition-all hover:scale-110 active:scale-95"
                        >
                            <Wand2 className="h-10 w-10 mr-6" /> ANALYSER LES DOCUMENTS
                        </Button>
                    </div>
                </>
            )}
        </div>
      )}

      {/* --- ÉTAPE 2 : PARAMÉTRAGE --- */}
      {currentStep === 1 && (
        <div className="space-y-16 animate-in slide-in-from-right-10 duration-700 pb-40">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-6">
                <div className="flex items-center gap-6">
                     <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Etape 1 : <span className="text-amber-600 italic">Assolement et Rendements</span></h3>
                </div>
                <Button onClick={addCulture} className="bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-full h-16 px-10 font-black uppercase tracking-widest text-xs gap-4 transition-all">
                    <Plus className="h-5 w-5" /> Ajouter une Culture
                </Button>
           </div>

           <Card className="overflow-hidden border-none shadow-xl rounded-[2.5rem] bg-white border border-slate-100">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 border-b border-slate-100 h-16">
                            <TableRow>
                                <TableHead className="font-black text-slate-500 px-8 uppercase tracking-widest text-[9px] w-[35%]">Culture</TableHead>
                                <TableHead className="font-black text-slate-500 px-4 text-center uppercase tracking-widest text-[9px]">Surf. N-1 (ha)</TableHead>
                                <TableHead className="font-black text-slate-500 px-4 text-center uppercase tracking-widest text-[9px]">Surf. Cible (ha)</TableHead>
                                <TableHead className="font-black text-slate-500 px-4 text-center uppercase tracking-widest text-[9px]">Rendement (T/ha)</TableHead>
                                <TableHead className="font-black text-amber-600 px-8 text-right uppercase tracking-widest text-[9px]">Production Cible (T)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cultures.map((row) => (
                                <TableRow key={row.id} className="group border-slate-50 border-b last:border-0 hover:bg-amber-50/30 transition-colors">
                                    <TableCell className="py-6 px-8 max-w-[400px]">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Input value={row.name} onChange={(e) => updateCulture(row.id, 'name', e.target.value)} className="font-bold text-xl border-none focus:ring-0 bg-transparent text-slate-900 h-8 px-0 w-full tracking-tight" />
                                            </div>
                                            {showReasoning && row.reasoning && (
                                                <div className="flex items-start gap-1.5 text-amber-600/60 mt-2">
                                                    <Sparkles className="h-3 w-3 mt-0.5 shrink-0" />
                                                    <span className="text-[10px] font-medium italic leading-relaxed">{row.reasoning}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-4">
                                        <div className="flex justify-center">
                                            <Input type="number" value={row.surfaceN1} onChange={(e) => updateCulture(row.id, 'surfaceN1', e.target.value)} className="w-24 text-center font-bold text-lg border-2 rounded-xl focus:border-amber-500" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-4">
                                        <div className="flex justify-center">
                                            <Input type="number" value={row.surfaceCible} onChange={(e) => updateCulture(row.id, 'surfaceCible', e.target.value)} className="w-24 text-center font-bold text-lg border-2 rounded-xl border-amber-200 focus:border-amber-500 bg-amber-50/50 text-amber-900" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-4">
                                        <div className="flex justify-center">
                                            <Input type="number" value={row.rendement} onChange={(e) => updateCulture(row.id, 'rendement', e.target.value)} className="w-24 text-center font-bold text-lg border-2 rounded-xl focus:border-amber-500" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-8 text-right">
                                        <div className="flex items-center justify-end gap-4">
                                            <span className="text-3xl font-black text-amber-600 tracking-tighter">{row.volume.toLocaleString('fr-FR')} <span className="text-sm text-amber-600/50 uppercase">T</span></span>
                                            <Button variant="ghost" size="icon" onClick={() => deleteCulture(row.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-300 hover:text-red-600 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {cultures.length > 0 && (
                                <TableRow className="bg-slate-900 hover:bg-slate-900 border-none">
                                    <TableCell className="py-8 px-8"><span className="text-white font-black text-xl uppercase tracking-widest">Total Exploitation</span></TableCell>
                                    <TableCell className="text-center"><span className="text-slate-400 font-bold text-lg">{cultures.reduce((sum, r) => sum + r.surfaceN1, 0).toFixed(1)} ha</span></TableCell>
                                    <TableCell className="text-center"><span className="text-white font-black text-xl">{cultures.reduce((sum, r) => sum + r.surfaceCible, 0).toFixed(1)} ha</span></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell className="text-right px-8"><span className="text-amber-400 font-black text-3xl">{cultures.reduce((sum, r) => sum + r.volume, 0).toLocaleString('fr-FR')} T</span></TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
           </Card>

           <div className="mt-16 mb-6">
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Etape 2 : <span className="text-amber-600 italic">Itinéraires Techniques (Intrants)</span></h3>
           </div>

           {cultures.map((cult) => (
             <Card key={cult.id} className="border-none shadow-xl rounded-[2.5rem] bg-white border border-slate-100 mb-8 overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 py-6 px-8">
                    <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-4">
                        {cult.name} <Badge className="bg-amber-100 text-amber-700">{cult.surfaceCible} ha</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    
                    {/* Consommation GNR */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Gauge className="w-5 h-5" /></div>
                            <h4 className="font-bold text-slate-700 uppercase tracking-widest text-sm">Consommation GNR (Litres / ha)</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-[repeat(13,minmax(0,1fr))] gap-2">
                            {["T1 (Jan-Mar)", "T2 (Avr-Juin)", "T3 (Juil-Sep)", "T4 (Oct-Déc)"].map((m, i) => {
                                const indic = getIndicativeData(cult.name);
                                return (
                                    <div key={`gnr-${i}`} className="flex flex-col gap-2 items-center col-span-1 sm:col-span-2 md:col-span-3">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{m}</span>
                                        <Input 
                                            type="number" 
                                            className="text-center border-2 rounded-xl focus:border-orange-500 h-12 font-bold px-1"
                                            value={cult.gnrQuarterly?.[i] || 0} 
                                            onChange={(e) => updateInputMonthly(cult.id, 'gnrQuarterly', i, parseFloat(e.target.value))}
                                        />
                                        <div className="h-8 flex flex-col items-center w-full">
                                            {indic && (indic.gnr_leger[i] > 0 || indic.gnr_lourd[i] > 0) ? (
                                                <>
                                                    <span className="text-[10px] text-slate-400 whitespace-nowrap leading-[1.2]">Terre légère: {indic.gnr_leger[i]}L</span>
                                                    <span className="text-[10px] text-slate-400 whitespace-nowrap leading-[1.2] mt-0.5">Terre Lourde: {indic.gnr_lourd[i]}L</span>
                                                </>
                                            ) : null}
                                        </div>
                                    </div>
                                )
                            })}
                            <div className="flex flex-col gap-2 items-center md:ml-2 md:border-l-2 md:pl-2 border-slate-100 col-span-2 sm:col-span-4 md:col-span-1 mt-4 md:mt-0">
                                <span className="text-[10px] font-black text-orange-600 uppercase">Total (L/ha)</span>
                                <div className="flex items-center justify-center h-12 w-full bg-orange-50 rounded-xl border-2 border-orange-200">
                                    <span className="font-black text-orange-600">{(cult.gnrQuarterly || [0,0,0,0]).reduce((sum, val) => sum + (val || 0), 0)}</span>
                                </div>
                                {(() => {
                                    const indic = getIndicativeData(cult.name);
                                    if (!indic) return <div className="h-8 w-full" />;
                                    return (
                                        <div className="h-8 flex flex-col items-center w-full">
                                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap leading-[1.2]">Terre légère: {indic.gnr_leger.reduce((a, b) => a + b, 0)}L</span>
                                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap leading-[1.2] mt-0.5">Terre Lourde: {indic.gnr_lourd.reduce((a, b) => a + b, 0)}L</span>
                                        </div>
                                    )
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Consommation Engrais */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Droplets className="w-5 h-5" /></div>
                            <h4 className="font-bold text-slate-700 uppercase tracking-widest text-sm">Apports Engrais (Kg / ha)</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-[repeat(13,minmax(0,1fr))] gap-2">
                            {Months.map((m, i) => {
                                const indic = getIndicativeData(cult.name);
                                return (
                                    <div key={`fert-${i}`} className="flex flex-col gap-2 items-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{m}</span>
                                        <Input 
                                            type="number" 
                                            className="text-center border-2 rounded-xl focus:border-blue-500 h-12 font-bold px-1"
                                            value={cult.fertilizerMonthly[i]} 
                                            onChange={(e) => updateInputMonthly(cult.id, 'fertilizerMonthly', i, parseFloat(e.target.value))}
                                        />
                                        <div className="h-8 flex items-start justify-center w-full pt-1">
                                            {indic && indic.engrais_nature[i] ? (
                                                <span className="text-[10px] text-slate-400 leading-tight text-center" title={indic.engrais_nature[i]}>
                                                    {indic.engrais_nature[i]}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                )
                            })}
                            <div className="flex flex-col gap-2 items-center md:ml-2 md:border-l-2 md:pl-2 border-slate-100 col-span-2 sm:col-span-4 md:col-span-1 mt-4 md:mt-0">
                                <span className="text-[10px] font-black text-blue-600 uppercase">Total (kg/ha)</span>
                                <div className="flex items-center justify-center h-12 w-full bg-blue-50 rounded-xl border-2 border-blue-200">
                                    <span className="font-black text-blue-600">{cult.fertilizerMonthly.reduce((sum, val) => sum + (val || 0), 0)}</span>
                                </div>
                                <div className="h-8 w-full" />
                            </div>
                        </div>
                    </div>

                </CardContent>
             </Card>
           ))}

           {/* Bouton de Validation Globale */}
           <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-200 p-6 z-50 transform transition-transform duration-500 ease-in-out flex justify-center shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
               <div className="flex gap-6 max-w-5xl w-full">
                    <Button 
                        size="lg" 
                        className="flex-1 rounded-full h-16 text-xl font-black uppercase tracking-widest bg-amber-600 hover:bg-amber-700 text-white shadow-xl shadow-amber-600/30 transition-all hover:scale-[1.02]"
                        onClick={handleFinalValidate}
                        disabled={analyzing || saving || cultures.length === 0}
                    >
                        {saving ? (
                            <><RefreshCw className="mr-3 h-5 w-5 animate-spin" /> SAUVEGARDE EN COURS...</>
                        ) : analyzing ? (
                            <><RefreshCw className="mr-3 h-5 w-5 animate-spin" /> ANALYSE EN COURS...</>
                        ) : (
                            <>VALIDER ET PASSER AUX COÛTS DE PRODUCTION <CheckCircle2 className="ml-3 h-6 w-6" /></>
                        )}
                    </Button>
               </div>
           </div>
        </div>
      )}
    </div>
  )
}
