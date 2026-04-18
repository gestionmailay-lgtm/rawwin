"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

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
  const modules = formData.getAll("modules") as string[]

  // Validation
  if (password !== passwordConfirm) {
    return { error: "Les mots de passe ne correspondent pas." }
  }

  // 1. Inscription Auth Supabase avec les métadonnées
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        company_name,
        siret,
        address,
        postal_code,
        city,
        country,
        modules,
      }
    }
  })

  if (authError || !data.user) {
    return { error: authError?.message || "Erreur lors de l'inscription." }
  }

  // La création du profil dans la table 'users' est maintenant gérée par un trigger SQL
  // après l'insertion dans 'auth.users'. Cela évite les erreurs de Row-Level Security (RLS).

  // 3. Redirection
  redirect("/dashboard")
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard", "page")
  redirect("/dashboard")
}
