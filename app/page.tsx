"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, on le redirige vers son espace personnel
    if (AuthService.isAuthenticated()) {
      router.push("/home")
    }
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent mb-4">
        Bienvenue sur TaskMaster
      </h1>
      <p className="text-xl text-gray-300 mb-8 max-w-2xl">
        L'outil ultime pour organiser vos tâches, booster votre productivité et ne plus jamais rien oublier.
      </p>
      <div className="flex gap-4">
        <Link href="/login">
          <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors">
            Se connecter
          </button>
        </Link>
        <Link href="/register">
          <button className="px-8 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-600 transition-colors">
            S'inscrire
          </button>
        </Link>
      </div>
    </div>
  )
}
