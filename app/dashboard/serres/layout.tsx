import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Settings, BarChart3, Lightbulb } from "lucide-react"

export default function SerresLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header Héro avec image de fond et boutons de navigation */}
      <div className="relative h-[50vh] w-full shrink-0">
        {/* Lien retour en haut à gauche */}
        <div className="absolute top-4 left-4 z-20 md:top-6 md:left-6">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-sm font-medium text-white transition-all shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Retour au tableau de bord
          </Link>
        </div>

        <Image
          src="/serres.jpg"
          alt="Serres agricoles"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        {/* Texte Central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 drop-shadow-md">
            Module Serres
          </h1>
          <p className="max-w-[800px] text-lg text-white/90 drop-shadow-sm">
            Optimisation et pilotage financier de vos cultures sous serres.
          </p>
        </div>

        {/* Boutons de navigation intégrés au bandeau (en bas) */}
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-5xl">
            <Link 
              href="/dashboard/serres/parametrage"
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl group"
            >
              <Settings className="h-5 w-5 text-green-400 group-hover:rotate-45 transition-transform" />
              Paramétrage des données
            </Link>
            <Link 
              href="/dashboard/serres/cout-production"
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl group"
            >
              <BarChart3 className="h-5 w-5 text-blue-400 group-hover:translate-y-[-2px] transition-transform" />
              Coût de production
            </Link>
            <Link 
              href="/dashboard/serres/conseil"
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl group"
            >
              <Lightbulb className="h-5 w-5 text-yellow-400 group-hover:animate-pulse" />
              Conseil Raw'win
            </Link>
          </div>
        </div>
      </div>

      {/* Contenu de la page */}
      <main className="flex-1 bg-background">
        {children}
      </main>
    </div>
  )
}
