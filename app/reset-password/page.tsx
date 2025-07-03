"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/neo-input";
import { Button } from "@/components/ui/neo-button";
import { apiService } from "@/lib/api";
import { ArrowLeft, Mail } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiService.resetPassword(email);

      // dj_rest_auth retourne généralement { "detail": "Password reset e-mail has been sent." }
      if (response.detail && response.detail.includes("sent")) {
        setSuccess(true);
      } else if (response.email) {
        // Gestion des erreurs de validation d'email
        setError(response.email[0]);
      } else {
        setError(
          response.error || "Une erreur s'est produite. Veuillez réessayer."
        );
      }
    } catch (err) {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent mb-2">
              TaskMaster
            </h1>
            <p className="text-gray-400">Email envoyé</p>
          </div>

          <GlassCard variant="neo" className="p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center mb-6">
              <Mail size={32} className="text-white" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">
              Vérifiez votre email
            </h2>

            <p className="text-gray-400 mb-6">
              Nous avons envoyé un lien de réinitialisation de mot de passe à{" "}
              <span className="text-blue-400 font-medium">{email}</span>
            </p>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Si vous ne recevez pas l'email dans quelques minutes, vérifiez
                votre dossier spam.
              </p>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  variant="glass"
                  className="w-full"
                >
                  Renvoyer l'email
                </Button>

                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="w-full text-gray-400 hover:text-white"
                  >
                    Retour à la connexion
                  </Button>
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <ArrowLeft size={16} />
              Retour
            </Button>
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent mb-2">
            TaskMaster
          </h1>
          <p className="text-gray-400">Réinitialiser votre mot de passe</p>
        </div>

        <GlassCard variant="neo" className="p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 flex items-center justify-center mb-4">
              <Mail size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Mot de passe oublié ?
            </h2>
            <p className="text-gray-400 text-sm">
              Entrez votre adresse email et nous vous enverrons un lien pour
              réinitialiser votre mot de passe.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Adresse email
              </label>
              <Input
                id="email"
                type="email"
                variant="neo"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              variant="neo"
              className="w-full"
              disabled={loading}
            >
              {loading
                ? "Envoi en cours..."
                : "Envoyer le lien de réinitialisation"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Vous vous souvenez de votre mot de passe ?{" "}
              <Link
                href="/login"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
