import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ModulesIndexPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background p-4 md:p-6 lg:p-10">
      <div className="mb-8">
        <Link
          href="/"
          className="group inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Retour à l'accueil
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Découvrez nos modules d'accompagnement
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Sélectionnez le module agricole qui correspond à vos besoins pour en savoir plus sur son contenu et nos offres de financement.
        </p>
      </div>

      <div className="w-full flex-1 flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8 min-h-[60vh]">
        {/* Module 1: Céréales */}
        <Link href="/modules/cereales" className="relative block flex-1 rounded-3xl overflow-hidden shadow-lg group cursor-pointer">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{
              backgroundColor: "#eab308",
              backgroundImage: "url('/cereales.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500" />

          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <h2 className="text-3xl font-bold text-white mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              Module Céréales
            </h2>
            <div className="w-12 h-1 bg-yellow-400 rounded-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100" />
          </div>
        </Link>

        {/* Module 2: Serres */}
        <Link href="/modules/serres" className="relative block flex-1 rounded-3xl overflow-hidden shadow-lg group cursor-pointer">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{
              backgroundColor: "#22c55e",
              backgroundImage: "url('/serres.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500" />

          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <h2 className="text-3xl font-bold text-white mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              Module Serres
            </h2>
            <div className="w-12 h-1 bg-green-500 rounded-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100" />
          </div>
        </Link>

        {/* Module 3: Porc (Bientôt disponible) */}
        <div className="relative block flex-1 rounded-3xl overflow-hidden shadow-lg opacity-60 grayscale cursor-not-allowed">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundColor: "#d97706",
              backgroundImage: "url('/porc.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-black/60" />

          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <h2 className="text-3xl font-bold text-white mb-1">
              Module Porc
            </h2>
            <p className="text-sm font-semibold text-white/90 uppercase tracking-widest mb-4">Bientôt disponible</p>
          </div>
        </div>
      </div>
    </div>
  )
}
