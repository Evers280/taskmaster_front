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
import { Eye, EyeOff, Github, Mail } from "lucide-react"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await apiService.login(formData)

      // Le backend (probablement Django/SimpleJWT) renvoie les clés 'access' et 'refresh'
      if (response.access) {
        AuthService.setTokens({
          access_token: response.access,
          refresh_token: response.refresh,
        })
        router.push("/home")
      } else {
        // DRF renvoie souvent les erreurs dans un champ 'detail'
        setError(response.detail || response.error || "Identifiants invalides")
      }
    } catch (err) {
      setError("Erreur de connexion. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // Redirection vers l'authentification Google via Allauth
    window.location.href = `http://127.0.0.1:8000/accounts/google/login/`
  }

  const handleGithubLogin = () => {
    // Redirection vers l'authentification GitHub via Allauth
    window.location.href = `http://127.0.0.1:8000/accounts/github/login/`
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent mb-2">
            TaskMaster
          </h1>
          <p className="text-gray-400">Connectez-vous à votre compte</p>
        </div>

        <GlassCard variant="neo" className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">{error}</div>
            )}

            <div className="space-y-4">
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
                  className="w-full"
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
            </div>

            <Button type="submit" variant="neo" className="w-full" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-400">Ou continuez avec</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="glass"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2"
              >
                <Mail size={20} />
                Google
              </Button>
              <Button
                type="button"
                variant="glass"
                onClick={handleGithubLogin}
                className="flex items-center justify-center gap-2"
              >
                <Github size={20} />
                GitHub
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Pas encore de compte ?{" "}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                S'inscrire
              </Link>
            </p>
            <Link
              href="/reset-password"
              className="text-sm text-gray-500 hover:text-gray-400 mt-2 block transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
