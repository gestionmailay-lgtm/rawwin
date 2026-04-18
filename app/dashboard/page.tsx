import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Wheat, Leaf, Activity, LogOut, LayoutDashboard, Settings, User } from "lucide-react"

export const metadata: Metadata = {
  title: "Tableau de bord - Rawwin",
  description: "Tableau de bord de votre entreprise",
}

const moduleConfigs = {
  cereales: {
    title: "Céréales",
    icon: Wheat,
    description: "Gestion des cultures et marchés financiers",
    href: "/dashboard/cereales",
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  serres: {
    title: "Serres",
    icon: Leaf,
    description: "Pilotage des serres et intrants",
    href: "/dashboard/serres",
    color: "text-green-600",
    bg: "bg-green-100",
  },
  porc: {
    title: "Porc",
    icon: Activity,
    description: "Suivi de l'élevage et performances",
    href: "/dashboard/porc",
    color: "text-pink-600",
    bg: "bg-pink-100",
  },
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Récupérer les infos du profil et les modules
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  const userModules = (profile?.modules as string[]) || []

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      {/* Header du Dashboard */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-primary">Rawwin</h1>
          </Link>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-medium">Tableau de bord</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-sm font-semibold">{profile?.company_name || user.email}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="ghost" size="icon" title="Se déconnecter">
              <LogOut className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Bienvenue, {profile?.company_name || "votre espace"}
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Voici l'accès à vos modules de gestion. Sélectionnez un module pour commencer à piloter votre activité.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userModules.length > 0 ? (
              userModules.map((moduleId) => {
                const config = moduleConfigs[moduleId as keyof typeof moduleConfigs]
                if (!config) return null
                const Icon = config.icon

                return (
                  <Card key={moduleId} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <div className={`${config.bg} ${config.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col">
                        <CardTitle className="text-xl">{config.title}</CardTitle>
                        <CardDescription className="line-clamp-1">{config.description}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <Link href={config.href}>
                        <Button className="w-full group-hover:bg-primary transition-colors" variant="secondary">
                          Accéder au module
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card className="col-span-full border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-muted p-4 rounded-full mb-4">
                    <Settings className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">Aucun module activé</h3>
                  <p className="text-muted-foreground mb-6">
                    Contactez le support pour activer vos modules de gestion.
                  </p>
                  <Button variant="outline">Contacter le support</Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Widgets de résumé */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-white to-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                  <User className="h-4 w-4" /> Profil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">100%</div>
                <p className="text-xs text-green-600 mt-1 font-medium">
                  Vérifié et complet
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-white to-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Aucun message en attente
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-white to-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" /> Activité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Récente</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Connecté aujourd'hui
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
