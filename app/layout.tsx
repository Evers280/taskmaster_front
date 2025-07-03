import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TaskMaster - Gestion de Tâches",
  description: "Application de gestion de tâches avec authentification",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gradient-to-br from-black via-gray-900 to-black min-h-screen`}>
        <div className="relative min-h-screen">
          {/* Background Effects */}
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-orange-900/20 pointer-events-none" />
          <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />

          {children}
        </div>
      </body>
    </html>
  )
}
