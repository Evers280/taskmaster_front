"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/neo-input"
import { Button } from "@/components/ui/neo-button"
import { apiService } from "@/lib/api"
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"

export default function ConfirmResetPasswordPage() {
  const [formData, setFormData] = useState({
    new_password1: "",
    new_password2: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [validToken, setValidToken] = useState(true)

  const router = useRouter()
  const searchParams = useSearchParams()
  const uid = searchParams.get("uid")
  const token = searchParams.get("token")

  useEffect(() => {
    if (!uid || !token) {
      setValidToken(false)
    }
  }, [uid, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.new_password1 !== formData.new_password2) {
      setError("Les mots de passe ne correspondent pas")
      setLoading(false)
      return
    }

    if (!uid || !token) {
      setError("Lien de réinitialisation invalide")
      setLoading(false)
      return
    }

    try {
      const response = await apiService.confirmPasswordReset({
        uid,
        token,
        new_password1: formData.new_password1,
        new_password2: formData.new_password2,
      })

      // dj_rest_auth retourne généralement un message de succès différent
      if (response.detail || !response.new_password1) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        // Gestion des erreurs de validation de dj_rest_auth
        if (response.new_password1) {
          setError(response.new_password1[0])
        } else if (response.new_password2) {
          setError(response.new_password2[0])
        } else if (response.non_field_errors) {
          setError(response.non_field_errors[0])
        } else {
          setError("Une erreur s'est produite. Veuillez réessayer.")
        }
      }
    } catch (err) {
      setError("Erreur de connexion. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent mb-2">
              TaskMaster
            </h1>
            <p className="text-gray-400">Lien invalide</p>
          </div>

          <GlassCard variant="neo" className="p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
              <AlertCircle size={32} className="text-red-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Lien invalide ou expiré</h2>

            <p className="text-gray-400 mb-6">
              Ce lien de réinitialisation de mot de passe n'est pas valide ou a expiré.
            </p>

            <div className="space-y-3">
              <Link href="/reset-password">
                <Button variant="neo" className="w-full">
                  Demander un nouveau lien
                </Button>
              </Link>

              <Link href="/login">
                <Button variant="ghost" className="w-full text-gray-400 hover:text-white">
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent mb-2">
              TaskMaster
            </h1>
            <p className="text-gray-400">Mot de passe réinitialisé</p>
          </div>

          <GlassCard variant="neo" className="p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center mb-6">
              <CheckCircle size={32} className="text-white" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Mot de passe réinitialisé !</h2>

            <p className="text-gray-400 mb-6">
              Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
            </p>

            <div className="space-y-3">
              <Link href="/login">
                <Button variant="neo" className="w-full">
                  Se connecter maintenant
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent mb-2">
            TaskMaster
          </h1>
          <p className="text-gray-400">Nouveau mot de passe</p>
        </div>

        <GlassCard variant="neo" className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Créer un nouveau mot de passe</h2>
            <p className="text-gray-400 text-sm">Choisissez un mot de passe sécurisé pour votre compte.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">{error}</div>
            )}

            <div>
              <label htmlFor="new_password1" className="block text-sm font-medium text-gray-300 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Input
                  id="new_password1"
                  type={showPassword ? "text" : "password"}
                  variant="neo"
                  placeholder="••••••••"
                  value={formData.new_password1}
                  onChange={(e) => setFormData({ ...formData, new_password1: e.target.value })}
                  required
                  className="w-full pr-10"
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
              <label htmlFor="new_password2" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <Input
                id="new_password2"
                type="password"
                variant="neo"
                placeholder="••••••••"
                value={formData.new_password2}
                onChange={(e) => setFormData({ ...formData, new_password2: e.target.value })}
                required
                className="w-full"
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-400 mb-2">Conseils pour un mot de passe sécurisé :</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Au moins 8 caractères</li>
                <li>• Mélange de lettres majuscules et minuscules</li>
                <li>• Au moins un chiffre</li>
                <li>• Au moins un caractère spécial</li>
              </ul>
            </div>

            <Button type="submit" variant="neo" className="w-full" disabled={loading}>
              {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-gray-400 hover:text-gray-300 transition-colors">
              Retour à la connexion
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
