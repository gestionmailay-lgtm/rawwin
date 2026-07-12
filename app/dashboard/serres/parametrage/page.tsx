"use client"

import { useState, useEffect } from "react"
import { Metadata } from "next"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText, Upload, FileUp, Pencil, RotateCcw, Info, Lock, ChevronRight, CheckCircle2, Sparkles, RefreshCw, Plus, Trash2, AlertTriangle, Search, Zap, Cpu, BarChart3, ScanText, BrainCircuit, Wand2, PieChart, Gauge } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { createClient } from "@/lib/client" 
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const Months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"]
const supabase = createClient()

interface Segment {
  id: string
  culture: string
  surfaceN1: number
  surfaceCible: number
  rendement: number
  volume: number
  confidence: "high" | "low" | "none"
  reasoning?: string
  // Nouveau : Contrôle par points (0 à 47)
  startGrowth: number;  // Curseur 1
  startHarvest: number; // Curseur 2
  endHarvest: number;   // Curseur 3
  // Consommation Gaz (kWh/m2 par mois)
  gasMonthly: number[]
}

export default function ParametrageSerresPage() {
  const router = useRouter()
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    resultat: null,
    gaz: null,
  })

  // Initialisation par défaut pour les nouveaux champs
  const createEmptyGas = () => Array.from({ length: 12 }, () => 0)

  const [segments, setSegments] = useState<Segment[]>([])
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
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isDirty, setIsDirty] = useState(false) // Suivi des modifications non enregistrées
  const [historicalGasTotal, setHistoricalGasTotal] = useState<number[]>(createEmptyGas())
  const [gasLegumesPercents, setGasLegumesPercents] = useState<number[]>(Array.from({ length: 12 }, () => 100))
  const [expenses, setExpenses] = useState({ 
    c60_achats: 0, 
    c60_elec: 0,
    c61_62_externes: 0, 
    c63_impots: 0,
    c64_personnel: 0,
    c65_autres: 0,
    c66_67_fin_exc: 0,
    c68_amort: 0,
    audit_meta: "" 
  })
    const [gasTaxes, setGasTaxes] = useState({
        transport: 4.88,
        ticgn: 8.41,
        abonnement: 120,
        cta: 0
    })
    const [gasTotalMWhDoc, setGasTotalMWhDoc] = useState(0)
  const [lastImports, setLastImports] = useState<{ [key: string]: { fileName: string, date: string } | null }>({
    resultat: null,
    gaz: null,
  })

  const analysisLog = [
    "Initialisation du moteur de raisonnement Gemini 2.5 Pro...",
    "Lecture intégrale de la Liasse Fiscale (SIG & Résultat)...",
    "Recroisement des comptes 60 (Matières) et 64 (Salaires)...",
    "Audit profond du Personnel Extérieur (Compte 621)...",
    "Isolation des frais de structure hors énergie...",
    "Reconciliation avec les taxes énergétiques annuelles...",
    "Validation finale de la cohérence comptable..."
  ]

  // Fetch des derniers imports et segments au chargement
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      let settingsData = null
      if (user) {
        // Load Imports
        const { data: importData } = await supabase
          .from('greenhouse_imports')
          .select('*')
          .eq('user_id', user.id)

        if (importData) {
          const importsMap: any = { resultat: null, gaz: null }
          importData.forEach(imp => {
            if (importsMap[imp.doc_type] !== undefined) {
                importsMap[imp.doc_type] = { 
                  fileName: imp.file_name, 
                  date: imp.last_imported_at 
                }
            }
          })
          setLastImports(importsMap)
        }

        // Load Saved Segments and Historical Gas
        const { data } = await supabase
          .from('greenhouse_settings')
          .select('segments, historical_gas_total, gas_legumes_percents, expenses, gas_taxes, gas_total_mwh_doc')
          .eq('user_id', user.id)
          .single()
        settingsData = data
      } else {
        const local = localStorage.getItem('greenhouse_settings_guest')
        if (local) {
          try {
            settingsData = JSON.parse(local)
          } catch (e) {}
        }
      }

      if (settingsData?.segments) {
        setSegments(settingsData.segments)
        setIsDataLoaded(true)
      }
      if (settingsData?.historical_gas_total) {
        setHistoricalGasTotal(settingsData.historical_gas_total)
      }
      if (settingsData?.gas_legumes_percents) {
        setGasLegumesPercents(settingsData.gas_legumes_percents)
      }
      if (settingsData?.expenses) {
        setExpenses(settingsData.expenses)
      }
      if (settingsData?.gas_taxes) {
        setGasTaxes(prev => ({ ...prev, ...settingsData.gas_taxes }))
      }
      if (settingsData?.gas_total_mwh_doc) {
        setGasTotalMWhDoc(settingsData.gas_total_mwh_doc)
      }
    }
    fetchData()
  }, [])

  // L'auto-sauvegarde a été désactivée pour forcer la validation manuelle de l'utilisateur avant le calcul final.
  // Cela garantit que l'audit financier est basé sur des données confirmées.
  useEffect(() => {
    if (isDataLoaded) {
      setIsDirty(true)
    }
  }, [segments, historicalGasTotal, gasLegumesPercents, expenses, gasTaxes, gasTotalMWhDoc])


  const handleManualSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    setError(null)
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            // Mode invité : simulation en mémoire
            setSaveSuccess(true)
            setIsDirty(false)
            return true
        }

        const { error: upsertError } = await supabase.from('greenhouse_settings').upsert({
            user_id: user.id,
            segments: segments,
            historical_gas_total: historicalGasTotal,
            gas_legumes_percents: gasLegumesPercents,
            expenses: expenses,
            gas_taxes: gasTaxes,
            gas_total_mwh_doc: gasTotalMWhDoc,
            updated_at: new Date().toISOString()
        })
        
        if (upsertError) {
            console.error("Erreur Upsert Supabase:", upsertError)
            throw new Error(upsertError.message || "Erreur lors de la mise à jour des données.")
        }
        
        setSaveSuccess(true)
        setIsDirty(false) // On a enregistré, le bouton Valider peut s'activer
        setTimeout(() => setSaveSuccess(false), 3000)
        return true
    } catch (err: any) {
        console.error("Erreur complète sauvegarde:", err)
        setError(err.message || "Une erreur inconnue est survenue lors de la sauvegarde.")
        return false
    } finally {
        setSaving(false)
    }
  }

  const handleFinalValidate = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser()

        setAnalyzing(true)
        setAnalysisStep(0)
        setProgress(5)
        setError(null)

        // 1. Sauvegarde préalable obligatoire des données de paramétrage
        const success = await handleManualSave()
        if (!success) {
            throw new Error("La sauvegarde initiale a échoué. Impossible de calculer les coûts de production.")
        }

        setProgress(30)
        
        // 2. Lancement de l'audit financier lourd par l'IA (Deep Dive)
        // C'est ici que l'analyse des charges et du SIG se fait
        const analysisResult = await runGeminiAnalysis("financial")
        
        // 3. SAUVEGARDE FINALE DE SÉCURITÉ (Bloquante avec les résultats de l'IA)
        // Uniquement pour les utilisateurs connectés
        if (analysisResult && user) {
            const { error: finalSaveError } = await supabase.from('greenhouse_settings').upsert({
                user_id: user.id,
                segments: segments,
                historical_gas_total: historicalGasTotal,
                gas_legumes_percents: gasLegumesPercents,
                expenses: analysisResult.expenses || expenses,
                gas_taxes: analysisResult.gasTaxes || gasTaxes,
                gas_total_mwh_doc: analysisResult.gasTotalMWhDoc || gasTotalMWhDoc,
                updated_at: new Date().toISOString()
            })
            if (finalSaveError) console.error("Erreur sauvegarde finale post-IA:", finalSaveError)
        }

        setProgress(100)
        // Redirection vers la page Coût de Production
        setTimeout(() => router.push("/dashboard/serres/cout-production"), 1000)
    } catch (err: any) {
        console.error("Erreur lors de la validation finale:", err)
        setError(err.message || "L'analyse finale des coûts a échoué.")
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
      }, analysisMode === "financial" ? 2500 : 1000)
    }
    return () => clearInterval(interval)
  }, [analyzing, analysisMode])

  const handleFileChange = async (key: string, file: File | null) => {
    if (!file) {
      setFiles(prev => ({ ...prev, [key]: null }))
      return
    }

    setFiles(prev => ({ ...prev, [key]: file }))
    setError(null)

    // SAUVEGARDE AUTOMATIQUE SUR LE CLOUD
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const filePath = `${user.id}/${key}-${Date.now()}.pdf`
        const { data, error: uploadError } = await supabase.storage
            .from('greenhouse-docs')
            .upload(filePath, file)

        if (uploadError) throw uploadError

        await supabase.from('greenhouse_imports').upsert({
            user_id: user.id,
            doc_type: key,
            file_name: file.name,
            file_url: filePath,
            last_imported_at: new Date().toISOString()
        }, { onConflict: 'user_id,doc_type' })

        // Refresh metadata
        setLastImports(prev => ({ ...prev, [key]: { fileName: file.name, date: new Date().toISOString() } }))
    } catch (err) {
        console.error("Erreur de sauvegarde cloud:", err)
    }
  }

  // Parse des nombres avec support des virgules et des espaces
  const parseFrNum = (val: any) => {
    if (val === undefined || val === null || val === '') return 0;
    const strVal = val.toString().replace(/\s/g, '').replace(',', '.');
    const parsed = parseFloat(strVal);
    return isNaN(parsed) ? 0 : parsed;
  }

  const runGeminiAnalysis = async (mode: "quick" | "financial" = "quick") => {
    // Si on a des fichiers en mémoire MAIS pas de nouveaux fichiers sélectionnés, 
    // on peut quand même autoriser l'analyse (condition "isReady")
    const isReady = (files.resultat || lastImports.resultat) && 
                    (files.gaz || lastImports.gaz)

    if (!isReady) {
      setError("Les trois documents sont obligatoires (Historique ou Nouveaux).")
      return
    }

    setAnalyzing(true)
    setAnalysisMode(mode)
    setError(null)
    setError(null)
    setErrorDetail(null)
    setProgress(0)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()

      setProgress(15)
      const combinedForm = new FormData()
      combinedForm.append("mode", mode)
      
      // Collecte de tous les fichiers (nouveaux ou cloud)
      const docTypes = ["resultat", "gaz"]
      for (const type of docTypes) {
        const file = files[type]
        if (file) {
            combinedForm.append("files", file)
        } else if (lastImports[type] && user) {
            const { data: importData } = await supabase.from('greenhouse_imports').select('file_url').eq('user_id', user.id).eq('doc_type', type).single()
            if (importData?.file_url) {
                const { data: fileBlob } = await supabase.storage.from('greenhouse-docs').download(importData.file_url)
                if (fileBlob) combinedForm.append("files", fileBlob, lastImports[type]?.fileName)
            }
        }
      }

      if (!combinedForm.has("files")) {
          throw new Error("Aucun fichier à analyser.")
      }

      setProgress(35)
      const res = await fetch("/api/analyze-pdf", { method: "POST", body: combinedForm })
      if (!res.ok) {
          const errorJson = await res.json()
          if (res.status === 429) {
              throw new Error("Quota API dépassé. Veuillez patienter 30 secondes avant de réessayer.")
          }
          throw new Error(errorJson.message || errorJson.error || "Erreur lors de l'analyse.")
      }

      const json = await res.json()
      if (!json) throw new Error("Réponse vide de l'IA.")
      setProgress(85)
      setAnalysisStep(6)
      
      // --- DISPATCH DES DONNÉES ---
      // En mode financial, on s'intéresse aux dépenses et taxes
      if (json.expenses) setExpenses(json.expenses)
      if (json.gasTaxes) setGasTaxes(json.gasTaxes)
      if (json.gasTotalMWhDoc) setGasTotalMWhDoc(json.gasTotalMWhDoc)
      
      // En mode quick, on s'intéresse aux segments et au gaz mensuel
      if (json.gasMonthlyTotal) {
          const parsedGas = json.gasMonthlyTotal.map((val: any) => parseFrNum(val))
          setHistoricalGasTotal(parsedGas)
      }

      if (json.segments && Array.isArray(json.segments)) {
        const segmentsData = json.segments
        console.log("Données segments extraites:", segmentsData)
        const processed = segmentsData.map((seg: any) => {
          const getVal = (possibleKeys: string[]) => {
            const objKeys = Object.keys(seg)
            for (const pk of possibleKeys) {
               const cleanPk = pk.toLowerCase().replace(/[^a-z0-9]/g, '')
               const found = objKeys.find(ok => ok.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanPk)
               if (found && seg[found] !== undefined) return seg[found]
            }
            return null
          }

          const sN1 = parseFrNum(getVal(['surfacen1', 'surface', 'surf', 'surfacen1ha', 'hectares']))
          const sCible = parseFrNum(getVal(['surfacecible', 'targetsurface', 'surfaceprevue', 'objectifsurface']))
          const rend = parseFrNum(getVal(['rendement', 'rend', 'rendementobjectif', 'rendementkgm2']))
          const cult = (getVal(['culture', 'nom', 'segment', 'cultures']) || "Culture Inconnue").toString()

          const existing = segments.find(s => s.culture?.toLowerCase() === cult.toLowerCase())
          const finalSurfaceCible = sCible || (existing?.surfaceCible || sN1)

          return {
            id: existing ? existing.id : Math.random().toString(36).substr(2, 9),
            culture: cult,
            surfaceN1: sN1,
            surfaceCible: finalSurfaceCible,
            rendement: rend,
            volume: Math.round(finalSurfaceCible * rend * 10),
            startGrowth: existing ? existing.startGrowth : 8,
            startHarvest: existing ? existing.startHarvest : 20,
            endHarvest: existing ? existing.endHarvest : 40,
            gasMonthly: existing ? existing.gasMonthly : createEmptyGas(),
            reasoning: seg.reasoning || "Données extraites par IA"
          }
        });
        setSegments(processed)
        setProgress(100)
        setIsDataLoaded(true)
        setShowReasoning(true)
        setCurrentStep(1)
        
        return json // On retourne l'objet complet pour la sauvegarde bloquante
      }
      
      return json
    } catch (err: any) {
        // ... (gestion erreur inchangée)
      console.error(err)
      setError("Erreur de communication avec le serveur")
      setErrorDetail(err.message)
    } finally {
      setAnalyzing(false)
      setAnalysisStep(0)
    }
  }

  const updateSegment = (id: string, field: keyof Segment, value: string | number) => {
    setSegments(prev => prev.map(seg => {
      if (seg.id === id) {
        const updated = { ...seg, [field]: field === 'culture' ? value : parseFloat(value as string) || 0, confidence: "none" as const }
        
        // Recalcul automatique du volume (Tonne)
        // Rendement en kg/m2, Surface en ha (1ha = 10000m2)
        // Volume T = (Surface * 10000 * Rendement) / 1000 => Surface * Rendement * 10
        if (field === 'surfaceCible' || field === 'rendement') {
           const s = Number(field === 'surfaceCible' ? value : seg.surfaceCible) || 0
           const r = Number(field === 'rendement' ? value : seg.rendement) || 0
           updated.volume = Math.round(s * r * 10)
        }
        return updated
      }
      return seg
    }))
  }

  const addSegment = () => {
    const newId = Math.random().toString(36).substr(2, 9)
    setSegments(prev => [
      ...prev, 
      { 
        id: newId, 
        culture: "Nouveau Segment", 
        surfaceN1: 0, 
        surfaceCible: 0, 
        rendement: 0, 
        volume: 0, 
        confidence: "none",
        startGrowth: 8,
        startHarvest: 20,
        endHarvest: 40,
        gasMonthly: createEmptyGas()
      }
    ])
  }

  const updatePoint = (segmentId: string, field: 'startGrowth' | 'startHarvest' | 'endHarvest', value: number) => {
    setSegments(prev => prev.map(seg => {
        if (seg.id === segmentId) {
            let newVal = isNaN(value) ? 0 : Math.max(0, Math.min(51, value))
            return { ...seg, [field]: newVal }
        }
        return seg
    }))
  }

  const isMonthInCycle = (row: Segment, monthIdx: number) => {
    // Convertir les bordures du mois (moyenne : 4.33 semaines par mois)
    const monthStartWeek = Math.floor(monthIdx * 4.33)
    const monthEndWeek = Math.floor((monthIdx + 1) * 4.33)
    
    const { startGrowth, endHarvest } = row
    
    // Une culture est active durant le mois si sa période [startGrowth, endHarvest]
    // intersecte la période [monthStartWeek, monthEndWeek]. Support du passage à l'an N+1.
    const isWeekInCycle = (w: number) => {
        if (startGrowth <= endHarvest) {
            return w >= startGrowth && w <= endHarvest
        } else {
            return w >= startGrowth || w <= endHarvest
        }
    }

    // On considère la culture active si au moins une semaine du mois est occupée
    // Pour simplifier, on vérifie le milieu du mois
    const midMonthWeek = Math.floor(monthIdx * 4.33 + 2.16)
    return isWeekInCycle(midMonthWeek)
  }

  // RECALCUL AUTOMATIQUE DE LA RÉPARTITION DU GAZ
  useEffect(() => {
    if (segments.length === 0) return

    const getWeeksInMonth = (mIdx: number) => 4.33; // Moyenne
    
    const getActiveWeeksInMonth = (seg: Segment, mIdx: number) => {
        const monthStart = mIdx * 4.33
        const monthEnd = (mIdx + 1) * 4.33
        const { startGrowth, endHarvest } = seg
        
        const isWeekActive = (w: number) => {
            if (startGrowth <= endHarvest) return w >= startGrowth && w <= endHarvest
            return w >= startGrowth || w <= endHarvest
        }
        
        let count = 0
        for (let w = monthStart; w < monthEnd; w += 0.1) {
            if (isWeekActive(w)) count += 0.1
        }
        return count
    }

    let changed = false
    const newSegments = segments.map(seg => {
        const newGasMonthly = [...seg.gasMonthly]
        for (let m = 0; m < 12; m++) {
            const totalGazLegumes = historicalGasTotal[m] * (gasLegumesPercents[m] / 100)
            
            // Somme pondérée de toutes les surfaces actives ce mois-là (Surface * Semaines)
            const totalOccupationSurface = segments.reduce((acc, s) => {
                const activeWeeks = getActiveWeeksInMonth(s, m)
                return acc + (s.surfaceCible || s.surfaceN1) * activeWeeks
            }, 0)

            const segActiveWeeks = getActiveWeeksInMonth(seg, m)
            
            // On calcule le kWh/m2 pour le segment ce mois-ci avec précision (2 décimales)
            // Formule : (Total Gaz / Occupation Totale Ha-Semaines) * Semaines d'occupation du segment / 10000 (m2)
            const monthlyKwhM2 = (segActiveWeeks > 0 && totalOccupationSurface > 0)
                ? ((totalGazLegumes / totalOccupationSurface) * segActiveWeeks) / 10000
                : 0

            if (Math.abs(newGasMonthly[m] - monthlyKwhM2) > 0.01) {
                newGasMonthly[m] = monthlyKwhM2
                changed = true
            }
        }
        return { ...seg, gasMonthly: newGasMonthly }
    })

    if (changed) {
        setSegments(newSegments)
    }
  }, [historicalGasTotal, gasLegumesPercents, segments]) // 'segments' is now safe because we check for 'changed'

  const updateGas = (segmentId: string, monthIndex: number, value: number) => {
    setSegments(prev => prev.map(seg => {
        if (seg.id === segmentId) {
            const newGas = [...seg.gasMonthly]
            newGas[monthIndex] = value
            return { ...seg, gasMonthly: newGas }
        }
        return seg
    }))
  }

  const deleteSegment = (id: string) => {
    setSegments(prev => prev.filter(seg => seg.id !== id))
  }

  return (
    <div className="container mx-auto p-6 md:p-20 max-w-[1800px] animate-in fade-in duration-1000">
      {/* MODALE D'ANALYSE IA (OVERLAY GLOBAL) */}
      {analyzing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/40 backdrop-blur-2xl animate-in fade-in duration-500">
              <div className="w-full max-w-4xl p-16 bg-slate-950 rounded-[4rem] border-4 border-primary/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500">
                  <div className="mb-16 space-y-6">
                      <div className="flex justify-between items-end">
                          <div className="space-y-2">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Audit Financier IA</span>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Extraction & <span className="text-primary italic">Audit SIG</span></h3>
                          </div>
                          <span className="text-6xl font-black text-white italic tracking-tighter">{progress}%</span>
                      </div>
                      <div className="h-6 w-full bg-slate-900 rounded-full overflow-hidden border-2 border-slate-800 p-1.5">
                          <div 
                              className="h-full bg-gradient-to-r from-primary via-blue-400 to-emerald-400 rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_30px_rgba(37,99,235,0.6)]"
                              style={{ width: `${progress}%` }}
                          />
                      </div>
                  </div>
                  
                  <div className="space-y-6">
                      {analysisLog.map((log, i) => (
                          <div key={i} className={`font-mono text-xl flex items-center gap-6 transition-all duration-700 ${i <= analysisStep ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                              <div className={`h-4 w-4 rounded-full ${i <= analysisStep ? 'bg-primary shadow-[0_0_20px_rgba(37,99,235,1)] animate-pulse' : 'bg-slate-800'}`} />
                              <span className={`${i <= analysisStep ? 'text-slate-100 font-bold' : 'text-slate-600'}`}>{log}</span>
                          </div>
                      ))}
                  </div>

                  <div className="mt-16 pt-12 border-t border-slate-900 flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                        Traitement {analysisMode === "financial" ? "profond" : "multimodal"} en cours...
                      </div>
                      <span>{analysisMode === "financial" ? "Gemini 2.5 Pro (Deep Audit)" : "Gemini 2.5 Flash"}</span>
                  </div>
              </div>
          </div>
      )}

      {/* HEADER / INDICATEUR D'ÉTAPE */}
      <div className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-white font-black text-[10px] tracking-[0.3em] uppercase py-1 px-3">
              {currentStep === 0 ? "PHASE 1 : IMPORTATION" : "PHASE 2 : PARAMÉTRAGE"}
            </Badge>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <h2 className="text-5xl font-black tracking-tighter text-slate-900 font-outfit uppercase leading-tight">
                {currentStep === 0 ? "Import de " : "Paramétrage "} 
                <span className="text-primary italic">Données</span>
            </h2>
            {currentStep === 1 && (
                <Button variant="outline" onClick={() => setCurrentStep(0)} className="rounded-[2.5rem] border-2 h-14 px-8 gap-4 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm hover:shadow-md bg-white mt-2 md:mt-0">
                    <RotateCcw className="h-4 w-4" /> Nouvel Import
                </Button>
            )}
          </div>
          <p className="text-slate-500 text-2xl font-medium max-w-4xl">
            {currentStep === 0 
                ? "Chargez vos documents comptables pour une extraction intelligente."
                : "Ajustez vos surfaces et rendements pour finaliser votre campagne."}
          </p>
        </div>
        
        <div className="flex items-center gap-6">
            <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl transition-all duration-700 ${currentStep === 0 ? 'bg-primary text-white shadow-2xl shadow-primary/40 rotate-6' : 'bg-slate-100 text-slate-400'}`}>1</div>
            <div className={`h-1.5 w-12 rounded-full transition-all duration-700 ${currentStep === 1 ? 'bg-primary' : 'bg-slate-100'}`} />
            <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl transition-all duration-700 ${currentStep === 1 ? 'bg-primary text-white shadow-2xl shadow-primary/40 rotate-6' : 'bg-slate-100 text-slate-400'}`}>2</div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-12 rounded-[2rem] border-2 animate-in slide-in-from-top-4">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-black">Erreur d'Analyse</AlertTitle>
          <AlertDescription>
            {error}. <br/>
            <strong>Détails:</strong> {errorDetail || "Vérifiez vos documents."}
          </AlertDescription>
        </Alert>
      )}
      
      {/* CONCLUSION D'AUDIT IA (Si disponible) */}
      {isDataLoaded && expenses.audit_meta && (
          <div className="mb-12 animate-in slide-in-from-bottom-4 duration-700">
              <div className="bg-primary/5 border-2 border-primary/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <BrainCircuit className="h-32 w-32 text-primary" />
                  </div>
                  <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-3">
                          <Badge className="bg-primary text-white font-black text-[10px] tracking-widest uppercase py-1 px-3">Audit IA Terminé</Badge>
                          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Rapport de réconciliation SIG x Résultat</span>
                      </div>
                      <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Conclusion de l'Expertise Financière</h4>
                      <p className="text-slate-600 font-medium text-lg italic leading-relaxed max-w-5xl">
                          "{expenses.audit_meta}"
                      </p>
                  </div>
              </div>
          </div>
      )}

      {/* --- ÉTAPE 1 : IMPORT DE DONNÉES --- */}
      {currentStep === 0 && (
        <div className="space-y-20 animate-in slide-in-from-left-10 duration-700">
            {!analyzing && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                          {/* Colonnes de Document */}
                  {[{ id: 'resultat', label: 'Document Comptable (SIG)', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { id: 'gaz', label: 'Énergie / Gaz', icon: Gauge, color: 'text-orange-600', bg: 'bg-orange-50' }
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
                            
                            {/* Affichage des métadonnées sous forme de badge discret */}
                            {(files[doc.id] || lastImports[doc.id]) && (
                                <div className="bg-slate-50 py-3 px-6 rounded-2xl border border-slate-100 inline-block">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                        {files[doc.id] ? 'Nouveau fichier :' : 'Version enregistrée :'}
                                    </p>
                                    <p className="text-xs font-bold text-primary truncate max-w-[200px]">
                                        {files[doc.id]?.name || lastImports[doc.id]?.fileName}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <Label htmlFor={`import-${doc.id}`} className="cursor-pointer block">
                                    <div className={`py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] border-2 transition-all ${files[doc.id] ? 'bg-white text-primary border-primary animate-bounce' : 'bg-slate-900 text-white border-slate-900 hover:bg-black shadow-xl shadow-black/20'}`}>
                                        {files[doc.id] ? 'Fichier Prêt' : lastImports[doc.id] ? 'Modifier' : 'Importer'}
                                    </div>
                                </Label>
                                <Input 
                                    id={`import-${doc.id}`}
                                    type="file" 
                                    className="hidden" 
                                    accept=".pdf"
                                    onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                  ))}
                    </div>

                    <div className="flex flex-col items-center gap-6 pt-10">
                         {isDataLoaded && segments.length > 0 && currentStep === 0 && (
                            <Button 
                                onClick={() => setCurrentStep(1)}
                                variant="outline"
                                className="rounded-full px-12 h-16 border-2 font-black uppercase tracking-widest text-slate-500 hover:text-primary hover:border-primary transition-all"
                            >
                                <RotateCcw className="mr-3 h-5 w-5" /> Reprendre le paramétrage existant
                            </Button>
                         )}
                         <Button 
                            onClick={() => runGeminiAnalysis("quick")} 
                            disabled={analyzing || (!files.resultat && !lastImports.resultat) || (!files.gaz && !lastImports.gaz)}
                            className="bg-primary hover:bg-blue-700 text-white rounded-[3rem] px-24 h-28 text-3xl font-black shadow-2xl shadow-primary/40 transition-all hover:scale-110 active:scale-95 disabled:grayscale"
                        >
                            <Wand2 className="h-10 w-10 mr-6" /> {isDataLoaded ? "RE-ANALYSER" : "ANALYSER LES DOCUMENTS"}
                        </Button>
                    </div>
                </>
            )}
        </div>
      )}

      {/* --- ÉTAPE 2 : PARAMÉTRAGE --- */}
      {currentStep === 1 && (
        <div className="space-y-12 animate-in slide-in-from-right-10 duration-700 pb-40">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-6">
                <div className="flex items-center gap-6">
                     <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Etape 1 : <span className="text-primary italic">Description des surfaces et des rendements</span></h3>
                </div>
                <Button onClick={addSegment} className="bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-full h-16 px-10 font-black uppercase tracking-widest text-xs gap-4 transition-all">
                    <Plus className="h-5 w-5" /> Ajouter un Segment
                </Button>
           </div>

           <Card className="overflow-hidden border-none shadow-xl rounded-[2.5rem] bg-white border border-slate-100">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 border-b border-slate-100 h-16">
                            <TableRow>
                                <TableHead className="font-black text-slate-500 px-8 uppercase tracking-widest text-[9px] w-[35%]">Culture / Segment</TableHead>
                                <TableHead className="font-black text-slate-500 px-4 text-center uppercase tracking-widest text-[9px]">Surf. N-1</TableHead>
                                <TableHead className="font-black text-slate-500 px-4 text-center uppercase tracking-widest text-[9px]">Surf. Cible</TableHead>
                                <TableHead className="font-black text-slate-500 px-4 text-center uppercase tracking-widest text-[9px]">Rendement</TableHead>
                                <TableHead className="font-black text-primary px-8 text-right uppercase tracking-widest text-[9px]">Production</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {segments.map((row) => (
                                <TableRow key={row.id} className="group border-slate-50 border-b last:border-0 hover:bg-blue-50/30 transition-colors">
                                    <TableCell className="py-6 px-8 max-w-[400px]">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Input 
                                                    value={row.culture} 
                                                    onChange={(e) => updateSegment(row.id, 'culture', e.target.value)}
                                                    className="font-bold text-xl border-none focus:ring-0 bg-transparent text-slate-900 h-8 px-0 w-full tracking-tight"
                                                />
                                            </div>
                                            {showReasoning && row.reasoning && (
                                                <div className="flex items-start gap-1.5 text-primary/60">
                                                    <Sparkles className="h-3 w-3 mt-0.5 shrink-0" />
                                                    <span className="text-[10px] font-medium italic leading-relaxed whitespace-normal break-words">{row.reasoning}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-6 px-4">
                                        <span className="font-bold text-slate-400 text-lg">{row.surfaceN1} <span className="text-[10px] font-normal">ha</span></span>
                                    </TableCell>
                                    <TableCell className="py-6 px-4">
                                        <div className="flex justify-center">
                                            <Input 
                                                type="number"
                                                value={row.surfaceCible} 
                                                onChange={(e) => updateSegment(row.id, 'surfaceCible', e.target.value)}
                                                className="text-center font-black text-lg bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-xl h-12 w-24 shadow-none text-slate-900 transition-all"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-4">
                                        <div className="flex justify-center">
                                            <Input 
                                                type="number"
                                                value={row.rendement}
                                                onChange={(e) => updateSegment(row.id, 'rendement', e.target.value)}
                                                className="text-center font-black text-lg bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-xl h-12 w-24 shadow-none text-slate-900 transition-all"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right py-6 px-8">
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl tracking-tighter text-primary font-black">{row.volume}</span>
                                                <span className="text-xs font-bold text-primary opacity-50">T</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
           </Card>

           {/* ÉTAPE 2 : CALENDRIER DE CULTURE (GANTT) */}
           <div className="space-y-6">
                <div className="flex items-center justify-between px-8">
                    <h3 className="text-2xl font-black text-white bg-blue-600 px-6 py-2 rounded-xl uppercase tracking-tighter shadow-lg">Étape 2 : Calendrier de Culture Mensuel</h3>
                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-2"><div className="h-3 w-3 bg-emerald-500 rounded-sm" /> Croissance</div>
                        <div className="flex items-center gap-2"><div className="h-3 w-3 bg-emerald-900 rounded-sm" /> Récolte</div>
                        <div className="flex items-center gap-2"><div className="h-3 w-3 bg-slate-400 rounded-sm" /> Arrachage</div>
                    </div>
                </div>
                <Card className="overflow-hidden border-none shadow-2xl rounded-[4rem] bg-white">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50 border-b border-slate-100 h-20">
                                <TableRow>
                                    <TableHead className="font-black text-slate-400 px-12 uppercase tracking-[0.2em] text-[10px] min-w-[200px]">Culture</TableHead>
                                    {Months.map(m => (
                                        <TableHead key={m} className="font-black text-slate-400 text-center uppercase tracking-[0.2em] text-[10px] w-[6%]">{m}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                                <TableBody>
                                {segments.map((row) => {
                                    const totalUnits = 52
                                    const getPos = (val: number) => (val / totalUnits) * 100
                                    
                                    // Helper précis pour 52 semaines
                                    const getMonthFromWeek = (w: number) => {
                                        const week = w + 1
                                        if (week <= 4) return Months[0]
                                        if (week <= 8) return Months[1]
                                        if (week <= 13) return Months[2] // Mars 5 semaines
                                        if (week <= 17) return Months[3]
                                        if (week <= 21) return Months[4]
                                        if (week <= 26) return Months[5] // Juin 5 semaines
                                        if (week <= 30) return Months[6]
                                        if (week <= 34) return Months[7]
                                        if (week <= 39) return Months[8] // Septembre 5 semaines
                                        if (week <= 43) return Months[9]
                                        if (week <= 47) return Months[10]
                                        return Months[11] // Décembre 5 semaines
                                    }

                                    const handles = [
                                        { id: 'startGrowth', color: 'bg-emerald-500', label: 'DEBUT', val: row.startGrowth },
                                        { id: 'startHarvest', color: 'bg-emerald-900', label: 'RECOLTE', val: row.startHarvest },
                                        { id: 'endHarvest', color: 'bg-slate-400', label: 'FIN', val: row.endHarvest }
                                    ]

                                    return (
                                        <TableRow key={row.id} className="group border-slate-50 border-b last:border-0 hover:bg-slate-50/50 transition-all">
                                    <TableCell className="py-6 px-12 font-black text-slate-900 text-lg uppercase tracking-tight min-w-[250px]">
                                                <div className="flex flex-col gap-4">
                                                    <span>{row.culture}</span>
                                                    

                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center justify-between text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                            <span className="text-slate-400 font-bold">PLANTATION</span>
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-bold">Semaine</span>
                                                                <input 
                                                                    type="number" min="1" max="52" value={(row.startGrowth ?? 0) + 1}
                                                                    onChange={(e) => updatePoint(row.id, 'startGrowth', (parseInt(e.target.value) || 1) - 1)}
                                                                    className="bg-white border w-10 text-center rounded font-black text-primary"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[10px] bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                                                            <span className="text-emerald-600 font-bold text-xs">RÉCOLTE</span>
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-bold">Semaine</span>
                                                                <input 
                                                                    type="number" min="1" max="52" value={(row.startHarvest ?? 0) + 1}
                                                                    onChange={(e) => updatePoint(row.id, 'startHarvest', (parseInt(e.target.value) || 1) - 1)}
                                                                    className="bg-white border w-10 text-center rounded font-black text-emerald-600"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                            <span className="text-slate-400 font-bold">FIN/ARRAC.</span>
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-bold">Semaine</span>
                                                                <input 
                                                                    type="number" min="1" max="52" value={(row.endHarvest ?? 0) + 1}
                                                                    onChange={(e) => updatePoint(row.id, 'endHarvest', (parseInt(e.target.value) || 1) - 1)}
                                                                    className="bg-white border w-10 text-center rounded font-black text-slate-700"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell colSpan={12} className="px-12 py-12">
                                                <div className="relative h-24 w-full bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 flex items-center shadow-inner overflow-hidden">
                                                    
                                                    {/* Graduations Mois Arrière-plan (52 divisions) */}
                                                    <div className="absolute inset-0 flex px-2 opacity-10">
                                                        {Array.from({ length: 52 }).map((_, i) => (
                                                            <div key={i} className="flex-1 border-r border-slate-900 last:border-0 h-full" />
                                                        ))}
                                                    </div>

                                                    {/* Zone Croissance (Supporte le passage à l'année suivante) */}
                                                    {row.startGrowth <= row.startHarvest ? (
                                                        <div 
                                                            className="absolute h-16 bg-emerald-400/20 rounded-2xl border border-emerald-400/40 transition-all"
                                                            style={{ left: `${getPos(row.startGrowth)}%`, width: `${getPos(row.startHarvest - row.startGrowth)}%` }}
                                                        />
                                                    ) : (
                                                        <>
                                                            <div className="absolute h-16 bg-emerald-400/20 rounded-2xl border border-emerald-400/40" style={{ left: `${getPos(row.startGrowth)}%`, right: 0 }} />
                                                            <div className="absolute h-16 bg-emerald-400/20 rounded-2xl border border-emerald-400/40" style={{ left: 0, width: `${getPos(row.startHarvest)}%` }} />
                                                        </>
                                                    )}

                                                    {/* Zone Récolte (Supporte le passage à l'année suivante) */}
                                                    {row.startHarvest <= row.endHarvest ? (
                                                        <div 
                                                            className="absolute h-16 bg-emerald-900/90 shadow-2xl rounded-2xl border-2 border-emerald-950 flex items-center justify-center text-[10px] text-white font-black uppercase tracking-widest overflow-hidden"
                                                            style={{ left: `${getPos(row.startHarvest)}%`, width: `${getPos(row.endHarvest - row.startHarvest)}%` }}
                                                        >
                                                            RÉCOLTE ACTIVE
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="absolute h-16 bg-emerald-900/90 border-2 border-emerald-950" style={{ left: `${getPos(row.startHarvest)}%`, right: 0 }} />
                                                            <div className="absolute h-16 bg-emerald-900/90 border-2 border-emerald-950 flex items-center justify-center text-[10px] text-white font-black" style={{ left: 0, width: `${getPos(row.endHarvest)}%` }}>RÉCOLTE</div>
                                                        </>
                                                    )}

                                                    {/* CURSEURS STATIQUES (ILLUSTRATIFS) */}
                                                    {handles.map((h) => (
                                                        <div 
                                                            key={h.id}
                                                            className="absolute -top-12 h-36 flex flex-col items-center pointer-events-none"
                                                            style={{ left: `${getPos(h.val)}%`, transform: 'translateX(-50%)', zIndex: h.id === 'startHarvest' ? 40 : 30 }}
                                                        >
                                                            {/* Étiquette Flottante Statique */}
                                                            <div className={`${h.color} text-white shadow-xl px-2 py-1.5 rounded-2xl mb-4 flex flex-col items-center min-w-[70px] border-2 border-white/20`}>
                                                                <p className="text-[8px] font-black leading-none mb-1 opacity-70 uppercase truncate w-full text-center">{getMonthFromWeek(h.val)}</p>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-[10px] opacity-70">W</span>
                                                                    <span className="text-sm font-black">{h.val + 1}</span>
                                                                </div>
                                                            </div>

                                                            {/* Barre de repère statique */}
                                                            <div className="relative h-full w-px flex items-center justify-center">
                                                                <div className={`w-0.5 h-full rounded-full ${h.color} shadow-lg`} />
                                                            </div>
                                                        </div>
                                                    ))}

                                                </div>
                                                <div className="flex justify-between mt-8 px-6">
                                                    {Months.map(m => (
                                                        <span key={m} className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{m}</span>
                                                    ))}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
           </div>

           {/* ÉTAPE 3 : MATRICE ÉNERGÉTIQUE (GAZ) */}
           <div className="space-y-6">
                <div className="flex items-center justify-between px-8">
                    <h3 className="text-2xl font-black text-white bg-orange-600 px-6 py-2 rounded-xl uppercase tracking-tighter shadow-lg">Étape 3 : Matrice de Consommation de Gaz (kWh/m²)</h3>
                    <div className="flex gap-2 text-[10px] font-black uppercase text-slate-400">
                         Heatmap de Densité Énergétique
                    </div>
                </div>
                <Card className="overflow-hidden border-none shadow-2xl rounded-[4rem] bg-white">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50 border-b border-slate-100 h-20">
                                <TableRow>
                                    <TableHead className="font-black text-slate-400 px-12 uppercase tracking-[0.2em] text-[10px] min-w-[200px]">Culture</TableHead>
                                    {Months.map(m => (
                                        <TableHead key={m} className="font-black text-slate-400 text-center uppercase tracking-[0.2em] text-[10px] w-[5%]">{m}</TableHead>
                                    ))}
                                    <TableHead className="font-black text-slate-400 text-right uppercase tracking-[0.2em] text-[10px] px-8">Total kWh/m²</TableHead>
                                    <TableHead className="font-black text-orange-600 text-right uppercase tracking-[0.2em] text-[10px] px-12">Total MWh/an</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* LIGNE TOTAL FACTURE (HISTORIQUE APRES ANALYSE) */}
                                <TableRow className="bg-primary/5 hover:bg-primary/10 transition-colors h-20 border-b-2 border-primary/20">
                                    <TableCell className="py-2 px-12">
                                        <div className="flex flex-col gap-1">
                                            <div className="font-black text-[10px] uppercase tracking-widest text-primary">
                                                Consommations de gaz extraites des factures
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 w-fit">
                                                <Sparkles className="h-2 w-2" /> Donnée extraite par IA
                                            </div>
                                        </div>
                                    </TableCell>
                                     {historicalGasTotal.map((val, idx) => (
                                        <TableCell key={idx} className="p-1">
                                            <div className="text-center font-black text-sm bg-primary/20 rounded-lg h-12 flex items-center justify-center border border-primary/30">
                                                {val ? Math.round(val).toLocaleString() : "-"}
                                            </div>
                                        </TableCell>
                                    ))}
                                    <TableCell className="bg-primary/5 border-l border-primary/20" />
                                    <TableCell className="text-right py-8 px-12 font-black bg-primary/10">
                                        <span className="text-2xl text-primary">{Math.round(historicalGasTotal.reduce((a, b) => a + b, 0) / 1000)}</span>
                                        <span className="text-[10px] ml-2 text-primary opacity-50">MWh</span>
                                    </TableCell>
                                </TableRow>

                                {/* LIGNE % PRODUCTION LÉGUMES (MANUELLE) */}
                                <TableRow className="bg-slate-50 hover:bg-slate-100 transition-colors h-16 group">
                                    <TableCell className="py-2 px-12">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="font-black text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-slate-600">
                                                % Production Légumes
                                            </div>
                                            <div className="text-[8px] font-medium text-slate-400 italic leading-tight">
                                                (si cogénération, sur les mois concernés, indiquez votre rendement thermique cogé)
                                            </div>
                                        </div>
                                    </TableCell>
                                    {gasLegumesPercents.map((val, idx) => (
                                        <TableCell key={idx} className="p-1">
                                            <div className="flex items-center gap-1 bg-white rounded-lg px-2 h-10 border border-slate-200 focus-within:border-primary transition-all">
                                                <input 
                                                    type="number" min="0" max="100" value={val || 0}
                                                    onChange={(e) => {
                                                        const newPercents = [...gasLegumesPercents]
                                                        newPercents[idx] = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                                                        setGasLegumesPercents(newPercents)
                                                    }}
                                                    className="w-full text-center text-xs font-black outline-none border-none text-slate-700 h-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                                <span className="text-[10px] font-bold text-slate-400">%</span>
                                            </div>
                                        </TableCell>
                                    ))}
                                    <TableCell className="text-right py-4 px-12 font-black text-slate-400 bg-slate-50/50" colSpan={2}>
                                        {(() => {
                                            const totalGas = historicalGasTotal.reduce((a, b) => a + b, 0)
                                            if (totalGas === 0) return "Moy: 0 %"
                                            const weightedSum = historicalGasTotal.reduce((acc, val, idx) => acc + (val * (gasLegumesPercents[idx] / 100)), 0)
                                            return `Moy. Pondérée: ${Math.round((weightedSum / totalGas) * 100)} %`
                                        })()}
                                    </TableCell>
                                </TableRow>

                                {/* LIGNE TOTAL GAZ LÉGUMES (CALCULÉE : FACTURE x %) */}
                                <TableRow className="bg-emerald-50 hover:bg-emerald-100 transition-colors h-16 border-b-2 border-emerald-200">
                                    <TableCell className="py-2 px-12 font-black text-[10px] uppercase tracking-widest text-emerald-600">
                                        Total Gaz Légumes (Facture x %)
                                    </TableCell>
                                     {historicalGasTotal.map((val, idx) => {
                                        const computedVal = val * (gasLegumesPercents[idx] / 100)
                                        return (
                                            <TableCell key={idx} className="p-1">
                                                <div className="text-center font-black text-xs text-emerald-700 bg-white/60 rounded-lg h-10 flex items-center justify-center border border-emerald-100 italic">
                                                    {computedVal ? Math.round(computedVal).toLocaleString() : "-"}
                                                </div>
                                            </TableCell>
                                        )
                                    })}
                                    <TableCell className="bg-emerald-50 border-l border-emerald-100" />
                                    <TableCell className="text-right py-4 px-12 font-black bg-emerald-100/30">
                                        <span className="text-xl text-emerald-700">
                                            {Math.round(historicalGasTotal.reduce((acc, val, idx) => acc + (val * (gasLegumesPercents[idx] / 100)), 0) / 1000)}
                                        </span>
                                        <span className="text-[10px] ml-2 text-emerald-600 opacity-60">MWh</span>
                                    </TableCell>
                                </TableRow>

                                {segments.map((row) => {
                                    const totalKwhM2 = row.gasMonthly.reduce((a, b) => a + b, 0)
                                    const totalMwh = Math.round((totalKwhM2 * (row.surfaceCible || row.surfaceN1) * 10000) / 1000)
                                    return (
                                        <TableRow key={row.id} className="group border-slate-50 border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="py-8 px-12 font-bold text-slate-700 text-sm uppercase tracking-tight">
                                                <div className="flex flex-col gap-1">
                                                    <span>{row.culture}</span>
                                                    <span className="text-[9px] text-slate-400 font-medium tracking-widest uppercase">{(row.surfaceCible || row.surfaceN1)} ha</span>
                                                </div>
                                            </TableCell>
                                            {row.gasMonthly.map((val, idx) => {
                                                const intensity = Math.min(1, val / 60)
                                                return (
                                                    <TableCell key={idx} className="p-1">
                                                        <div 
                                                            className="text-center font-black text-xs rounded-lg h-12 flex items-center justify-center transition-all border border-transparent"
                                                            style={{ 
                                                                backgroundColor: val > 0 ? `rgba(249, 115, 22, ${intensity * 0.8 + 0.1})` : 'transparent',
                                                                color: intensity > 0.5 ? 'white' : val > 0 ? 'rgb(154 52 18)' : '#cbd5e1'
                                                            }}
                                                        >
                                                            {val > 0 ? Math.round(val) : "-"}
                                                        </div>
                                                    </TableCell>
                                                )
                                            })}
                                            <TableCell className="text-right py-8 px-8 font-black text-lg text-slate-400">
                                                {Math.round(totalKwhM2).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right py-8 px-12 font-black bg-orange-50/30">
                                                <span className="text-2xl text-orange-700">{totalMwh.toLocaleString()}</span>
                                                <span className="text-[10px] ml-2 text-orange-400">MWh</span>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
           </div>

           {/* TOTAL KPIS D'ÉNERGIE SUPPRIMÉS SELON REQUÊTE UTILISATEUR */}

           <div className="flex flex-col md:flex-row justify-end items-center gap-6 pt-12 border-t border-slate-100">
                {saveSuccess && (
                    <div className="flex items-center gap-2 text-emerald-600 font-bold animate-bounce bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100 shadow-sm">
                        <CheckCircle2 className="h-5 w-5" /> Données sauvegardées sur le cloud !
                    </div>
                )}
                <Button 
                    onClick={handleManualSave}
                    disabled={saving}
                    variant="outline"
                    className="border-slate-200 hover:border-slate-900 rounded-[2rem] px-12 h-20 text-lg font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="mr-3 h-5 w-5 animate-spin" /> : <FileUp className="mr-3 h-5 w-5" />} 
                    SAUVEGARDER LES DONNÉES
                </Button>
                <div className="relative group/valider">
                    <Button 
                        onClick={handleFinalValidate}
                        size="lg" 
                        disabled={isDirty || analyzing}
                        className={`bg-slate-900 border-4 border-slate-900 hover:bg-black text-white rounded-[2rem] shadow-xl px-16 h-20 text-xl font-black group transition-all ${isDirty || analyzing ? 'opacity-30 grayscale cursor-not-allowed shadow-none' : 'hover:scale-105 active:scale-95 shadow-primary/20'}`}
                    >
                        VALIDER LA CONFIGURATION <ChevronRight className="h-6 w-6 ml-4 group-hover:translate-x-2 transition-transform" />
                    </Button>
                    {isDirty && (
                        <p className="absolute -top-8 left-0 right-0 text-center text-[10px] font-black text-orange-500 uppercase tracking-widest animate-pulse">
                            ⚠️ Sauvegardez d'abord vos modifications
                        </p>
                    )}
                 </div>
           </div>
        </div>
      )}
    </div>
  )
}
