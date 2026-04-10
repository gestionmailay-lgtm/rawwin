import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Tableau de bord - Rawwin",
  description: "Tableau de bord de votre entreprise",
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      {/* Header du Dashboard */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-primary">Rawwin</h1>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-medium">Tableau de bord</span>
        </div>
        <div>
          <Button variant="outline" size="sm">Se déconnecter</Button>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Bienvenue sur votre espace</h2>
            <p className="text-muted-foreground">
              Voici un aperçu de vos données et de la situation de votre entreprise.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Financements en cours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0 €</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Aucun dossier actif
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Demandes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Nouvelles requêtes
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">À compléter</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Vérifiez vos informations
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
