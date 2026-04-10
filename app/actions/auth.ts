"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // Récupération des données du formulaire
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const passwordConfirm = formData.get("password_confirm") as string

  const company_name = formData.get("company_name") as string
  const siret = formData.get("siret") as string
  const address = formData.get("address") as string
  const postal_code = formData.get("postal_code") as string
  const city = formData.get("city") as string
  const country = formData.get("country") as string

  // Validation
  if (password !== passwordConfirm) {
    return { error: "Les mots de passe ne correspondent pas." }
  }

  // 1. Inscription Auth Supabase
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError || !data.user) {
    return { error: authError?.message || "Erreur lors de l'inscription." }
  }

  // 2. Création du profil public
  const { error: dbError } = await supabase
    .from("users")
    .insert({
      id: data.user.id,
      company_name,
      siret,
      address,
      postal_code,
      city,
      country,
    })

  if (dbError) {
    return { error: "Compte créé mais erreur lors de l'enregistrement du profil: " + dbError.message }
  }

  // 3. Redirection
  redirect("/dashboard")
}
