"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/neo-input";
import { Button } from "@/components/ui/neo-button";
import { apiService } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export default function AddTaskPage() {
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    priorite: "moyenne" as "faible" | "moyenne" | "haute",
    date_echeance: "",
    status: "à faire" as "à faire" | "en cours" | "terminé",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // --- 1. VÉRIFICATION DES DONNÉES AVANT ENVOI ---
    // Affiche l'objet complet qui sera envoyé à l'API.
    // Vérifiez ici que les valeurs (ex: status: "à faire") sont correctes.
    console.log("1. Données du formulaire prêtes à être envoyées :", formData);

    try {
      await apiService.createTask(formData);
      router.push("/tasks");
    } catch (err) {
      setError("Erreur lors de la création de la tâche");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <ArrowLeft size={16} />
              Retour
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
            Nouvelle tâche
          </h1>
        </div>

        <GlassCard variant="neo" className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Titre de la tâche
              </label>
              <Input
                id="title"
                type="text"
                variant="neo"
                placeholder="Ex: Terminer le rapport mensuel"
                value={formData.titre}
                onChange={(e) =>
                  setFormData({ ...formData, titre: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                placeholder="Décrivez votre tâche en détail..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full h-32 rounded-lg border border-blue-500/30 bg-black/50 text-white px-3 py-2 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)] focus:shadow-[inset_0_0_15px_rgba(59,130,246,0.4),0_0_15px_rgba(59,130,246,0.3)] focus:border-blue-400 focus:outline-none resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Priorité
                </label>
                <select
                  id="priority"
                  value={formData.priorite}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priorite: e.target.value as any,
                    })
                  }
                  className="w-full h-12 rounded-lg border border-blue-500/30 bg-black/50 text-white px-3 py-2 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)] focus:shadow-[inset_0_0_15px_rgba(59,130,246,0.4),0_0_15px_rgba(59,130,246,0.3)] focus:border-blue-400 focus:outline-none"
                  required
                >
                  <option value="faible">Faible</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="haute">Élevée</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="due_date"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Date d'échéance
                </label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  variant="neo"
                  value={formData.date_echeance}
                  onChange={(e) =>
                    setFormData({ ...formData, date_echeance: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Statut
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
                className="w-full h-12 rounded-lg border border-blue-500/30 bg-black/50 text-white px-3 py-2 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)] focus:shadow-[inset_0_0_15px_rgba(59,130,246,0.4),0_0_15px_rgba(59,130,246,0.3)] focus:border-blue-400 focus:outline-none"
                required
              >
                <option value="à faire">À faire</option>
                <option value="en cours">En cours</option>
                <option value="terminé">Terminée</option>
              </select>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                variant="neo"
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Création..." : "Créer la tâche"}
              </Button>
              <Link href="/home">
                <Button type="button" variant="glass" className="px-8">
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
