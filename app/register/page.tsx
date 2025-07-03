"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/neo-input"
import { Button } from "@/components/ui/neo-button"
import { apiService } from "@/lib/api"
import { AuthService } from "@/lib/auth"
import { Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setLoading(false)
      return
    }

    try {
      const { confirmPassword, ...registerData } = formData
      // Étape 1: Créer le compte utilisateur
      const newUser = await apiService.register(registerData)

      // Étape 2: Si la création réussit (l'API renvoie l'objet utilisateur avec un ID),
      // on connecte l'utilisateur automatiquement.
      if (newUser && newUser.id) {
        const loginResponse = await apiService.login({
          email: registerData.email,
          password: registerData.password,
        })

        if (loginResponse.access) {
          AuthService.setTokens({
            access_token: loginResponse.access,
            refresh_token: loginResponse.refresh,
          })
          setSuccess("Compte créé et connecté ! Redirection vers l'accueil...")
          // Étape 3: Rediriger vers la page d'accueil
          router.push("/home")
        } else {
          // Cas où l'inscription a fonctionné mais la connexion a échoué
          setError("Compte créé, mais la connexion a échoué. Veuillez vous connecter manuellement.")
          setTimeout(() => router.push("/login"), 3000)
        }
      } else {
        // Gérer les erreurs de validation de l'API (ex: email déjà utilisé)
        const errorMessages = Object.values(newUser).flat() as string[]
        setError(errorMessages[0] || "Erreur lors de la création du compte.")
      }
    } catch (err) {
      setError("Erreur de connexion au serveur. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent mb-2">
            TaskMaster
          </h1>
          <p className="text-gray-400">Créez votre compte</p>
        </div>

        <GlassCard variant="neo" className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">{error}</div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                variant="neo"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  variant="neo"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmer le mot de passe
              </label>
              <Input
                id="confirmPassword"
                type="password"
                variant="neo"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <Button type="submit" variant="neo" className="w-full" disabled={loading}>
              {loading ? "Création..." : "Créer le compte"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
