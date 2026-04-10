import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* En-tête (Header) avec logo, texte au centre, et bouton */}
      <header className="w-full py-4 px-4 md:px-10 flex items-center justify-between bg-card shadow-sm border-b">
        
        {/* Logo à gauche avec coins arrondis */}
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <Image 
            src="/logo.png" 
            alt="Rawwin Logo" 
            width={180}
            height={60}
            className="h-12 w-auto object-contain rounded-xl overflow-hidden"
            priority
          />
        </Link>
        
        {/* Titre au centre (disparait sur très petits écrans pour éviter les bugs) */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bienvenue sur Rawwin
          </h1>
        </div>

        {/* Bouton de connexion à droite */}
        <div className="flex items-center">
          <Button asChild className="rounded-xl px-4 md:px-6 font-medium">
            <Link href="/login">
              Accéder à mon espace
            </Link>
          </Button>
        </div>
      </header>

      {/* Contenu principal de la page */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="max-w-[600px] text-muted-foreground md:text-lg">
          Votre plateforme d'accompagnement financier agricole.
        </p>
      </main>
    </div>
  );
}
