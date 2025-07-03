"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/neo-button"
import { apiService, type Master } from "@/lib/api"
import { AuthService } from "@/lib/auth"
import { ArrowLeft, User, Mail, Edit, LogOut, Calendar, Shield, Settings, CheckCircle, AlertCircle } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<Master | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check authentication first
    const checkAuth = () => {
      try {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("taskmaster_access_token")
          if (!token) {
            router.push("/login")
            return false
          }
        }
        return true
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
        return false
      }
    }

    if (checkAuth()) {
      loadUserData()
    }
  }, [router])

  const loadUserData = async () => {
    try {
      setError("")
      const userData = await apiService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error)
      setError("Erreur lors du chargement du profil")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (!confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) return

    try {
      await apiService.logout().catch(() => {})
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    } finally {
      AuthService.clearTokens()
      router.push("/")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Chargement du profil...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Erreur de chargement</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={loadUserData} variant="neo">
            Réessayer
          </Button>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/home">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-400 hover:text-white">
                <ArrowLeft size={16} />
                Accueil
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                Mon Profil
              </h1>
              <p className="text-gray-400">Gérez vos informations personnelles</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/profil/edit">
              <Button variant="neo" className="flex items-center gap-2">
                <Edit size={16} />
                Modifier
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-red-400"
            >
              <LogOut size={16} />
              Déconnexion
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <GlassCard className="p-8">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 flex items-center justify-center">
                  <User size={40} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {user?.email || "Master"}
                  </h2>
                  <p className="text-gray-400 mb-4">{user?.email}</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-400" size={16} />
                    <span className="text-sm text-green-400">Compte vérifié</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Informations personnelles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                          <Mail size={16} className="text-gray-400" />
                          <span className="text-white">{user?.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <Link href="/profil/edit">
                  <Button variant="glass" className="w-full justify-start flex items-center gap-3">
                    <Edit size={16} />
                    Modifier le profil
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="glass" className="w-full justify-start flex items-center gap-3">
                    <Settings size={16} />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/tasks">
                  <Button variant="glass" className="w-full justify-start flex items-center gap-3">
                    <CheckCircle size={16} />
                    Mes tâches
                  </Button>
                </Link>
              </div>
            </GlassCard>

            {/* Account Info */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Informations du compte</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Shield size={16} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Compte sécurisé</p>
                    <p className="text-xs text-gray-400">Authentification active</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Calendar size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Membre depuis</p>
                    <p className="text-xs text-gray-400">
                      {user?.id ? new Date().toLocaleDateString("fr-FR") : "Date inconnue"}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Danger Zone */}
            <GlassCard className="p-6 border-red-500/20">
              <h3 className="text-lg font-semibold text-red-400 mb-4">Zone de danger</h3>
              <p className="text-sm text-gray-400 mb-4">
                Cette action est irréversible et supprimera toutes vos données.
              </p>
              <Button
                variant="ghost"
                className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={handleLogout}
              >
                Se déconnecter
              </Button>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
