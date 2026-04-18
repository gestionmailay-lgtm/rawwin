"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMSG, setErrorMSG] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setErrorMSG(null)
    // Nous appelons notre action serveur dynamiquement
    const { signup } = await import("@/app/actions/auth")
    const result = await signup(formData)
    
    if (result?.error) {
      setErrorMSG(result.error)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-muted/40">
      <div className="w-full max-w-lg">
        <div className="flex flex-col gap-6">
          <div className="w-full">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={800} 
              height={400} 
              className="w-full h-auto rounded-xl shadow-md object-cover"
              priority
            />
          </div>
          <Card>
            <CardContent className="pt-6">
              <form action={handleSubmit}>
                <div className="flex flex-col gap-6">
                  
                  {errorMSG && (
                    <div className="p-3 text-sm font-medium text-destructive-foreground bg-destructive/20 rounded-md">
                      {errorMSG}
                    </div>
                  )}

                  {/* Email */}
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="nom@exemple.com" required />
                  </div>

                  {/* Password */}
                  <div className="grid gap-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        name="password"
                        type={showPassword ? "text" : "password"} 
                        required 
                      />
                      <button 
                        type="button" 
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="grid gap-2">
                    <Label htmlFor="password_confirm">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Input 
                        id="password_confirm" 
                        name="password_confirm"
                        type={showConfirmPassword ? "text" : "password"} 
                        required 
                      />
                      <button 
                        type="button" 
                        tabIndex={-1}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Informations de l'entreprise
                      </span>
                    </div>
                  </div>

                  {/* Company Name */}
                  <div className="grid gap-2">
                    <Label htmlFor="company_name">Nom de l'entreprise</Label>
                    <Input id="company_name" name="company_name" type="text" placeholder="Votre entreprise" required />
                  </div>

                  {/* SIRET */}
                  <div className="grid gap-2">
                    <Label htmlFor="siret">Numéro SIRET</Label>
                    <Input id="siret" name="siret" type="text" placeholder="123 456 789 00012" required />
                  </div>

                  {/* Address */}
                  <div className="grid gap-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input id="address" name="address" type="text" placeholder="123 rue de l'Exemple" required />
                  </div>

                  {/* Code Postal et Ville */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="postal_code">Code Postal (CP)</Label>
                      <Input id="postal_code" name="postal_code" type="text" placeholder="75000" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="city">Ville</Label>
                      <Input id="city" name="city" type="text" placeholder="Paris" required />
                    </div>
                  </div>

                  {/* Country */}
                  <div className="grid gap-2">
                    <Label htmlFor="country">Pays</Label>
                    <Input id="country" name="country" type="text" placeholder="France" defaultValue="France" required />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Modules souhaités
                      </span>
                    </div>
                  </div>

                  {/* Modules Selection */}
                  <div className="grid gap-4">
                    <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-accent transition-colors cursor-pointer">
                      <input type="checkbox" id="mod-cereales" name="modules" value="cereales" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                      <Label htmlFor="mod-cereales" className="flex-1 cursor-pointer font-medium">Céréales</Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-accent transition-colors cursor-pointer">
                      <input type="checkbox" id="mod-serres" name="modules" value="serres" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                      <Label htmlFor="mod-serres" className="flex-1 cursor-pointer font-medium">Serres</Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-accent transition-colors cursor-pointer">
                      <input type="checkbox" id="mod-porc" name="modules" value="porc" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                      <Label htmlFor="mod-porc" className="flex-1 cursor-pointer font-medium">Porc</Label>
                    </div>
                  </div>

                  {/* Submit button */}
                  <Button type="submit" className="w-full">
                    S'inscrire
                  </Button>

                </div>
                <div className="mt-6 text-center text-sm">
                  Vous avez déjà un compte ?{" "}
                  <Link href="/login" className="underline underline-offset-4 font-semibold">
                    Se connecter
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <div className="flex justify-center">
            <Link 
              href="/" 
              className="group flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
