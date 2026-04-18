import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("files") as File[];
        const mode = formData.get("mode") || "financial"; // "quick" ou "financial"
        const apiKey = process.env.GOOGLE_AI_API_KEY;

        if (files.length === 0 || !apiKey) {
            return NextResponse.json({ error: "Fichiers ou clé API manquante." }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // On utilise Pro pour l'audit financier lourd (meilleure extraction SIG/Résultat)
        // et Flash pour le paramétrage rapide.
        const modelName = mode === "quick" ? "gemini-2.5-flash" : "gemini-2.5-pro";
        
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json"
            }
        });

        let prompt = "";

        if (mode === "quick") {
            // Mode léger : Utilisé à l'import initial pour préparer l'interface
            prompt = `Analyse ces documents techniques et factures pour préparer le paramétrage initial.
                
                TÂCHES :
                1. STRUCTURE : Identifie les segments (cultures) et extrais : "culture", "surfaceN1" (en ha), "surfaceCible" (en ha), "rendement" (en kg/m²).
                2. ÉNERGIE : Extrais uniquement l'historique de consommation mensuelle de gaz (kWh).
                3. CHARGES (Comptabilité Classe 6) :
                   - "c60_achats": Achats + Fournitures
                   - "c61_62_externes": Autres charges externes
                   - "c63_impots": Taxes
                   - "c64_personnel": Salaires + Charges
                   - "c68_amort": Dotations
                
                RÉPONDS UNIQUEMENT AVEC CE JSON :
                {
                  "segments": [ { "culture": "Tomate", "surfaceN1": 0, "surfaceCible": 0, "rendement": 0 } ],
                  "gasMonthlyTotal": [0,0,0,0,0,0,0,0,0,0,0,0],
                  "expenses": { "c60_achats": 0, "c61_62_externes": 0, "c63_impots": 0, "c64_personnel": 0, "c68_amort": 0 }
                }`;
        } else {
            // Master Audit Financier & Opérationnel
            prompt = `Effectue un MASTER AUDIT CRITIQUE réconciliant la Liasse Fiscale (SIG/Résultat) et la réalité opérationnelle (Segments).
                
                TON RÔLE : Tu es un Expert-Comptable spécialisé en audit de liasse fiscale Cerfa.
                
                L'objectif est d'extraire les données de la DERNIÈRE ANNÉE COMPTABLE (Exercice N) présente dans le Compte de Résultat.

                PHASE 1 : NAVIGATION (CHIRURGICALE) :
                1. Cherche le feuillet "COMPTE DE RÉSULTAT DE L'EXERCICE (En liste)" ou "Cerfa 2052".
                2. Repère la colonne "EXERCICE N (NET)" ou la colonne de gauche si non spécifiée.
                3. Identifie le bloc intitulé "CHARGES D'EXPLOITATION".

                PHASE 2 : AUDIT LIGNE À LIGNE (ZÉRO ERREUR) :
                Dans "audit_meta", tu DOIS lister chaque ligne trouvée sous la forme "LIBELLÉ : MONTANT".
                
                Mapping des rubriques :
                - SOMME des lignes d'achats (60) HORS ÉNERGIE (Gaz/Elec) -> c60_achats
                - ISOLE la ligne "Électricité" (souvent en 6061) -> c60_elec
                - SOMME des lignes de services extérieurs et charges externes (61/62) -> c61_62_externes
                - SOMME des impôts et taxes (63) -> c63_impots
                - SOMME des salaires et charges sociales (64) -> c64_personnel
                - SOMME des dotations aux amortissements (68) -> c68_amort

                RÈGLES CRITIQUES :
                - EXCLUSION : Soustrais impérativement le GAZ de chauffage s'il est inclus dans les achats (60) pour éviter les doublons.
                - ISOLATION : Si l'électricité est noyée dans les achats (60), essaie de l'isoler via le détail ou les annexes.

                RÈGLES CRITIQUES :
                - Si les chiffres sont en milliers d'euros (k€), multiplie par 1000 pour renvoyer le montant réel.
                - Si une ligne est vide, compte 0.
                - Ne confonds pas la colonne N avec la colonne N-1.

                STRUCTURE DU JSON :
                {
                  "segments": [ { "culture": "", "surfaceN1": 0, "surfaceCible": 0, "rendement": 0, "reasoning": "" } ],
                  "expenses": { 
                    "c60_achats": 0, 
                    "c60_elec": 0,
                    "c61_62_externes": 0, 
                    "c63_impots": 0,
                    "c64_personnel": 0,
                    "c65_autres": 0,
                    "c66_67_fin_exc": 0,
                    "c68_amort": 0
                  },
                  "gasTaxes": {
                    "transport": 0,
                    "ticgn": 0,
                    "abonnement": 0,
                    "cta": 0
                  },
                  "gasTotalMWhDoc": 0,
                  "audit_meta": { "steps": [], "found_lines": [] }
                }
    
    INSTRUCTIONS D'AUDIT GAZ :
    1. Localise la facture de gaz.
    2. Isole le volume de gaz TOTAL facturé sur le document (en MWh). Sois attentif à l'unité (kWh vs MWh).
    3. Identifie TOUTES les charges qui ne sont pas le prix du gaz lui-même (la molécule) :
       - Transport, Distribution, Accès au réseau, Stockage -> Somme dans "transport"
       - TICGN -> "ticgn"
       - Abonnement -> "abonnement"
       - CTA et autres taxes locales -> "cta"
    4. Soustrais systématiquement la TVA.`;
        }

        const fileParts = await Promise.all(
            files.map(async (file) => {
                const arrayBuffer = await file.arrayBuffer();
                return {
                    inlineData: {
                        mimeType: "application/pdf",
                        data: Buffer.from(arrayBuffer).toString("base64")
                    }
                };
            })
        );

        const result = await model.generateContent([prompt, ...fileParts]);
        const response = await result.response;
        const text = response.text();

        try {
            const parsed = JSON.parse(text);
            return NextResponse.json(parsed);
        } catch (pError) {
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start !== -1 && end !== -1 && end > start) {
                const cleanJson = text.substring(start, end + 1);
                return NextResponse.json(JSON.parse(cleanJson));
            }
            throw pError;
        }

    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({
            error: "Erreur d'analyse.",
            message: error.message
        }, { status: 500 });
    }
}
