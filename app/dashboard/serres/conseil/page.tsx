import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp, ShieldCheck, AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Conseil Raw'win Serres",
}

export default function ConseilSerresPage() {
  return (
    <div className="container mx-auto p-6 md:p-12 max-w-5xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Exposition aux Marchés & Conseils</h2>
        <p className="text-muted-foreground mt-2">Stratégies recommandées par nos experts en fonction de vos données et du marché actuel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 bg-green-100 rounded-full">
              <ShieldCheck className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Opportunité : Énergie</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Les cours du gaz sont actuellement bas. Nous vous recommandons de sécuriser 40% de vos besoins pour l'hiver prochain via un contrat à prix fixe.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 bg-amber-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle>Vigilance : Intrants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Tension sur les engrais potassiques. Anticipez vos stocks de 2 mois pour éviter les ruptures de livraison prévues en juin.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-primary/5 border-dashed border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Vision Stratégique Raw'win
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">
              Basé sur votre coût de production de <strong>42,50€/m²</strong>, votre point mort est atteint. Chaque centime gagné sur l'énergie par une couverture stratégique augmentera directement votre capacité d'autofinancement pour vos futurs projets d'extension.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
