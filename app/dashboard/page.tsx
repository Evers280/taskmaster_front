"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/neo-button";
import { apiService, type Task } from "@/lib/api";
import {
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  LogOut,
  Calendar,
  TrendingUp,
  Target,
  Activity,
  Bell,
} from "lucide-react";

export default function DashboardPage() {
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
      return { todo: 0, inProgress: 0, completed: 0, overdue: 0, total: 0 };

    const todo = tasks.filter((task) => task.status === "todo").length;
    const inProgress = tasks.filter(
      (task) => task.status === "in_progress"
    ).length;
    const completed = tasks.filter(
      (task) => task.status === "completed"
    ).length;
    const overdue = tasks.filter((task) => {
      if (!task.due_date) return false;
      return (
        new Date(task.due_date) < new Date() && task.status !== "completed"
      );
    }).length;

    return { todo, inProgress, completed, overdue, total: tasks.length };
  };

  const getRecentTasks = () => {
    if (!Array.isArray(tasks)) return [];

    return tasks
      .filter((task) => task.status !== "completed")
      .sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      })
      .slice(0, 5);
  };

  const getUpcomingDeadlines = () => {
    if (!Array.isArray(tasks)) return [];

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return tasks
      .filter((task) => {
        if (!task.due_date || task.status === "completed") return false;
        const dueDate = new Date(task.due_date);
        return dueDate >= today && dueDate <= nextWeek;
      })
      .sort(
        (a, b) =>
          new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
      )
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Chargement du dashboard...</div>
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
  const recentTasks = getRecentTasks();
  const upcomingDeadlines = getUpcomingDeadlines();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Bonjour{" "}
              {user?.first_name || user?.email?.split("@")[0] || "Master"} !
              Voici un aperçu de vos tâches.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell size={16} />
              {upcomingDeadlines.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  {upcomingDeadlines.length}
                </span>
              )}
            </Button>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total des tâches</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/20">
                <Target className="text-blue-400" size={24} />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">À faire</p>
                <p className="text-2xl font-bold text-white">{stats.todo}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-500/20">
                <Clock className="text-orange-400" size={24} />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">En cours</p>
                <p className="text-2xl font-bold text-white">
                  {stats.inProgress}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/20">
                <Activity className="text-yellow-400" size={24} />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Terminées</p>
                <p className="text-2xl font-bold text-white">
                  {stats.completed}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500/20">
                <CheckCircle className="text-green-400" size={24} />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/add-task">
            <GlassCard
              variant="neo"
              className="p-8 hover:scale-105 transition-transform cursor-pointer group"
            >
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                  <Plus size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Créer une tâche
                </h3>
                <p className="text-gray-400">
                  Ajoutez une nouvelle tâche à votre liste
                </p>
              </div>
            </GlassCard>
          </Link>

          <Link href="/tasks">
            <GlassCard
              variant="neo"
              className="p-8 hover:scale-105 transition-transform cursor-pointer group"
            >
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
                  <CheckCircle size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Gérer les tâches
                </h3>
                <p className="text-gray-400">
                  Consultez et organisez vos tâches
                </p>
              </div>
            </GlassCard>
          </Link>

          <Link href="/tasks/completed">
            <GlassCard
              variant="neo"
              className="p-8 hover:scale-105 transition-transform cursor-pointer group"
            >
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-green-500/50 transition-shadow">
                  <TrendingUp size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Accomplissements
                </h3>
                <p className="text-gray-400">Consultez vos tâches terminées</p>
              </div>
            </GlassCard>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Tasks */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Tâches prioritaires
              </h2>
              <Link href="/tasks">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Voir tout
                </Button>
              </Link>
            </div>

            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-400 mb-4">Aucune tâche en attente</p>
                <Link href="/add-task">
                  <Button variant="neo" size="sm">
                    Créer une tâche
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          task.priority === "high"
                            ? "bg-red-500"
                            : task.priority === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      />
                      <div>
                        <h3 className="font-medium text-white">{task.title}</h3>
                        <p className="text-sm text-gray-400 truncate max-w-xs">
                          {task.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.due_date && (
                        <span className="text-xs text-gray-400">
                          {new Date(task.due_date).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          task.status === "in_progress"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {task.status === "in_progress" ? "En cours" : "À faire"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Upcoming Deadlines */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Échéances proches
              </h2>
              <Calendar className="text-orange-400" size={24} />
            </div>

            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-400">Aucune échéance cette semaine</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingDeadlines.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-orange-500/10 border border-orange-500/20"
                  >
                    <div>
                      <h3 className="font-medium text-white">{task.title}</h3>
                      <p className="text-sm text-gray-400">
                        Échéance:{" "}
                        {new Date(task.due_date!).toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="text-orange-400" size={16} />
                      <span className="text-xs text-orange-400">
                        {Math.ceil(
                          (new Date(task.due_date!).getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        jour(s)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
