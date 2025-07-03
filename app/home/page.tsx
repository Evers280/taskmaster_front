"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/neo-button";
import { apiService, type Task } from "@/lib/api";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  LogOut,
  BarChart3,
  Plus,
  Target,
  Calendar,
} from "lucide-react";

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
      loadData();
    }
  }, [router]);

  const loadData = async () => {
    try {
      setError("");
      const [tasksResponse, userResponse] = await Promise.all([
        apiService.getTasks().catch(() => []),
        apiService.getCurrentUser().catch(() => null),
      ]);

      setTasks(tasksResponse || []);
      setUser(userResponse);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout().catch(() => {});
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("taskmaster_access_token");
        localStorage.removeItem("taskmaster_refresh_token");
      }
      router.push("/");
    }
  };

  const getTaskStats = () => {
    if (!Array.isArray(tasks))
      return { todo: 0, inProgress: 0, completed: 0, total: 0 };

    const todo = tasks.filter((task) => task.status === "à faire").length;
    const inProgress = tasks.filter(
      (task) => task.status === "en cours"
    ).length;
    const completed = tasks.filter((task) => task.status === "terminé").length;

    return { todo, inProgress, completed, total: tasks.length };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={loadData} variant="neo">
            Réessayer
          </Button>
        </GlassCard>
      </div>
    );
  }

  const stats = getTaskStats();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent mb-2">
              Bienvenue !
            </h1>
            <p className="text-xl text-gray-300">
              Bonjour{" "}
              {user?.first_name || user?.email?.split("@")[0] || "Master"}, prêt
              à être productif ?
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/profil">
              <Button
                variant="glass"
                size="sm"
                className="flex items-center gap-2"
              >
                <User size={16} />
                Profil
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <LogOut size={16} />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <GlassCard className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Target className="text-blue-400" size={24} />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {stats.total}
            </div>
            <p className="text-gray-400">Tâches totales</p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
              <Clock className="text-yellow-400" size={24} />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {stats.todo + stats.inProgress}
            </div>
            <p className="text-gray-400">En cours</p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-400" size={24} />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {stats.completed}
            </div>
            <p className="text-gray-400">Terminées</p>
          </GlassCard>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Dashboard Access */}
          <Link href="/dashboard">
            <GlassCard
              variant="neo"
              className="p-12 hover:scale-105 transition-all cursor-pointer group"
            >
              <div className="text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-6 group-hover:shadow-2xl group-hover:shadow-blue-500/50 transition-all">
                  <BarChart3 size={40} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Accéder au Dashboard
                </h2>
                <p className="text-gray-300 mb-6 text-lg">
                  Consultez vos statistiques détaillées, gérez vos tâches et
                  suivez votre progression
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-400 group-hover:text-blue-300 transition-colors">
                  <span className="font-medium">Ouvrir le dashboard</span>
                  <ArrowRight size={20} />
                </div>
              </div>
            </GlassCard>
          </Link>

          {/* Quick Task Creation */}
          <Link href="/add-task">
            <GlassCard
              variant="neo"
              className="p-12 hover:scale-105 transition-all cursor-pointer group"
            >
              <div className="text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-6 group-hover:shadow-2xl group-hover:shadow-orange-500/50 transition-all">
                  <Plus size={40} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Créer une Tâche
                </h2>
                <p className="text-gray-300 mb-6 text-lg">
                  Ajoutez rapidement une nouvelle tâche à votre liste de choses
                  à faire
                </p>
                <div className="flex items-center justify-center gap-2 text-orange-400 group-hover:text-orange-300 transition-colors">
                  <span className="font-medium">Nouvelle tâche</span>
                  <ArrowRight size={20} />
                </div>
              </div>
            </GlassCard>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard">
            <GlassCard className="p-6 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    Toutes les tâches
                  </h3>
                  <p className="text-sm text-gray-400">Gérer et organiser</p>
                </div>
                <ArrowRight
                  className="text-gray-400 group-hover:text-white transition-colors"
                  size={16}
                />
              </div>
            </GlassCard>
          </Link>

          <Link href="/tasks/completed">
            <GlassCard className="p-6 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                  <Target size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    Accomplissements
                  </h3>
                  <p className="text-sm text-gray-400">Tâches terminées</p>
                </div>
                <ArrowRight
                  className="text-gray-400 group-hover:text-white transition-colors"
                  size={16}
                />
              </div>
            </GlassCard>
          </Link>

          <Link href="/profil">
            <GlassCard className="p-6 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Mon profil</h3>
                  <p className="text-sm text-gray-400">Paramètres compte</p>
                </div>
                <ArrowRight
                  className="text-gray-400 group-hover:text-white transition-colors"
                  size={16}
                />
              </div>
            </GlassCard>
          </Link>
        </div>

        {/* Welcome Message */}
        {stats.total === 0 && (
          <div className="mt-12">
            <GlassCard className="p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 flex items-center justify-center mb-6">
                <Calendar className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Commencez votre parcours de productivité !
              </h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Bienvenue dans TaskMaster ! Vous n'avez pas encore de tâches.
                Commencez par créer votre première tâche ou explorez le
                dashboard pour découvrir toutes les fonctionnalités.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/add-task">
                  <Button
                    variant="neo"
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Créer ma première tâche
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    variant="glass"
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <BarChart3 size={20} />
                    Explorer le dashboard
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
