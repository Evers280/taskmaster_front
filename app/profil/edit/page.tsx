"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/neo-input";
import { Button } from "@/components/ui/neo-button";
import { apiService, type Master } from "@/lib/api";
import {
  ArrowLeft,
  Save,
  X,
  User,
  Mail,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    email: "",
  });
  const [originalData, setOriginalData] = useState<Master | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check authentication first
    const checkAuth = () => {
      try {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("taskmaster_access_token");
          if (!token) {
            router.push("/login");
            return false;
          }
        }
        return true;
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
        return false;
      }
    };

    if (checkAuth()) {
      loadUserData();
    }
  }, [router]);

  const loadUserData = async () => {
    try {
      setError("");
      const userData = await apiService.getCurrentUser();
      setOriginalData(userData);
      setFormData({

        email: userData.email || "",
  
      });
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
      setError("Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Préparer les données à envoyer (seulement les champs modifiés)
      const updatedData: Partial<Master> = {};


      if (formData.email !== originalData?.email) {
        updatedData.email = formData.email;
      }


      // Si aucune modification, ne pas faire d'appel API
      if (Object.keys(updatedData).length === 0) {
        setSuccess("Aucune modification détectée");
        setTimeout(() => {
          router.push("/profil");
        }, 1500);
        return;
      }

      await apiService.updateUser(updatedData);
      setSuccess("Profil mis à jour avec succès !");

      setTimeout(() => {
        router.push("/profil");
      }, 1500);
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour:", err);
      setError(err.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      if (
        confirm(
          "Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?"
        )
      ) {
        router.push("/profil");
      }
    } else {
      router.push("/profil");
    }
  };

  const hasChanges = () => {
    return (
 
      formData.email !== (originalData?.email || "")
 
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  if (error && !originalData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={loadUserData} variant="neo">
            Réessayer
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profil">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <ArrowLeft size={16} />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
              Modifier le profil
            </h1>
            <p className="text-gray-400">
              Mettez à jour vos informations personnelles
            </p>
          </div>
        </div>

        <GlassCard variant="neo" className="p-8">
          {/* Profile Avatar */}
          <div className="flex items-center gap-6 mb-8 pb-6 border-b border-white/10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">
                Photo de profil
              </h2>
              <p className="text-sm text-gray-400">
                L'avatar est généré automatiquement
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
                <CheckCircle size={16} />
                {success}
              </div>
            )}



            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Adresse email
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  variant="neo"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="pl-10"
                />
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
              </div>
            </div>

            {/* Change indicator */}
            {hasChanges() && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
                <p>Vous avez des modifications non sauvegardées</p>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                variant="neo"
                className="flex-1 flex items-center justify-center gap-2"
                disabled={saving || !hasChanges()}
              >
                <Save size={16} />
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
              <Button
                type="button"
                variant="glass"
                onClick={handleCancel}
                className="flex items-center gap-2 px-6"
                disabled={saving}
              >
                <X size={16} />
                Annuler
              </Button>
            </div>
          </form>
        </GlassCard>

        {/* Tips */}
        <GlassCard className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">💡 Conseils</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              • Utilisez une adresse email valide pour recevoir les
              notifications
            </li>
            <li>• Vos informations personnelles sont sécurisées et privées</li>
            <li>• Vous pouvez modifier ces informations à tout moment</li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
