import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Droplets, Fuel } from "lucide-react"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Module Serres - Rawwin",
  description: "Découvrez notre accompagnement pour les exploitations sous serres.",
}

export default function SerresModulePage() {
  return (
    <main className="flex-1 container mx-auto p-6 md:p-12 lg:p-16 max-w-5xl">

      <div className="space-y-8">
        <section>
          <h2 className="text-3xl font-semibold mb-4 text-foreground">Une expertise dédiée à la culture sous serres</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            La rentabilité de vos serres dépend de multiples facteurs. Notre <strong>Module Serres</strong> vous accompagne dans toutes vos prises de décisions qui impactent vos charges opérationnelles majeures, la raison d'être de votre entreprise.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="rounded-xl px-8 bg-green-600 hover:bg-green-700">
              <Link href="/dashboard/serres/parametrage">
                Démarrer le paramétrage
              </Link>
            </Button>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-4 text-foreground">Votre parcours d'accompagnement</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="p-6 bg-card border rounded-2xl">
              <span className="text-3xl mb-4 block">1️⃣</span>
              <h4 className="font-bold mb-2">Paramétrage</h4>
              <p className="text-sm text-muted-foreground">Saisie des données techniques et financières de votre exploitation.</p>
            </div>
            <div className="p-6 bg-card border rounded-2xl">
              <span className="text-3xl mb-4 block">2️⃣</span>
              <h4 className="font-bold mb-2">Analyse des coûts</h4>
              <p className="text-sm text-muted-foreground">Calcul automatisé de vos coûts de production et marges.</p>
            </div>
            <div className="p-6 bg-card border rounded-2xl">
              <span className="text-3xl mb-4 block">3️⃣</span>
              <h4 className="font-bold mb-2">Conseil Stratégique</h4>
              <p className="text-sm text-muted-foreground">Exposition aux marchés et recommandations personnalisées Raw'win.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
