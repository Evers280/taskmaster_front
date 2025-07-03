"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/neo-button";
import { Input } from "@/components/ui/neo-input";
import { apiService, type Task } from "@/lib/api";
import { AuthService } from "@/lib/auth";
import {
  ArrowLeft,
  Search,
  CheckCircle,
  Calendar,
  Flag,
  Trophy,
  Target,
  TrendingUp,
  RotateCcw,
  Trash2,
} from "lucide-react";

export default function CompletedTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "priority">("date");
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push("/login");
      return;
    }

    loadCompletedTasks();
  }, [router]);

  useEffect(() => {
    filterAndSortTasks();
  }, [tasks, searchTerm, sortBy]);

  const loadCompletedTasks = async () => {
    try {
      const response = await apiService.getTasks();
      const completedTasks = response.filter(
        (task) => task.status === "terminé"
      );
      setTasks(completedTasks);
    } catch (error) {
      console.error("Erreur lors du chargement des tâches:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTasks = () => {
    let filtered = tasks;

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tri
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.date_echeance || "").getTime() -
          new Date(a.date_echeance || "").getTime()
        );
      } else {
        const priorityOrder = { haute: 3, moyenne: 2, faible: 1 };
        return priorityOrder[b.priorite] - priorityOrder[a.priorite];
      }
    });

    setFilteredTasks(filtered);
  };

  const reopenTask = async (taskId: number) => {
    setUpdatingTaskId(taskId);
    try {
      await apiService.updateTask(taskId, { status: "à faire" });
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Erreur lors de la réouverture:", error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const deleteTask = async (taskId: number) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer définitivement cette tâche ?"
      )
    )
      return;

    try {
      await apiService.deleteTask(taskId);
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const getPriorityColor = (priority: Task["priorite"]) => {
    switch (priority) {
      case "haute":
        return "bg-red-500";
      case "moyenne":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  const getPriorityLabel = (priority: Task["priorite"]) => {
    switch (priority) {
      case "haute":
        return "Élevée";
      case "moyenne":
        return "Moyenne";
      default:
        return "Faible";
    }
  };

  const getStats = () => {
    const total = tasks.length;
    const highPriority = tasks.filter(
      (task) => task.priorite === "haute"
    ).length;
    const thisWeekCompleted = tasks.filter((task) => {
      const taskDate = new Date(task.date_echeance || "");
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return taskDate >= weekAgo;
    }).length;

    return { total, highPriority, thisWeekCompleted };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Chargement des tâches terminées...</div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/tasks">
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Tâches terminées
              </h1>
              <p className="text-gray-400">
                {filteredTasks.length} tâche
                {filteredTasks.length > 1 ? "s" : ""} accomplie
                {filteredTasks.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                {stats.total}
              </div>
              <div className="text-xs text-gray-400">Total terminé</div>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
              <Trophy className="text-white" size={24} />
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total accompli</p>
                <p className="text-2xl font-bold text-green-400">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500/20">
                <Target className="text-green-400" size={24} />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Priorité élevée</p>
                <p className="text-2xl font-bold text-red-400">
                  {stats.highPriority}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-500/20">
                <Flag className="text-red-400" size={24} />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Cette semaine</p>
                <p className="text-2xl font-bold text-blue-400">
                  {stats.thisWeekCompleted}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/20">
                <TrendingUp className="text-blue-400" size={24} />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Filtres et Recherche */}
        <GlassCard className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input
                placeholder="Rechercher dans les tâches terminées..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/30"
              />
            </div>

            {/* Tri */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-12 rounded-lg border border-white/20 bg-black/30 text-white px-3 py-2 focus:outline-none focus:border-green-400"
            >
              <option value="date">Trier par date</option>
              <option value="priority">Trier par priorité</option>
            </select>

            {/* Actions rapides */}
            <div className="flex gap-2">
              <Link href="/tasks">
                <Button
                  variant="glass"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={14} />
                  Toutes les tâches
                </Button>
              </Link>
            </div>
          </div>
        </GlassCard>

        {/* Liste des tâches terminées */}
        {filteredTasks.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle className="text-green-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? "Aucune tâche trouvée" : "Aucune tâche terminée"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm
                ? "Aucune tâche terminée ne correspond à votre recherche."
                : "Continuez à travailler sur vos tâches pour voir vos accomplissements ici !"}
            </p>
            <Link href="/tasks">
              <Button variant="neo">Voir toutes les tâches</Button>
            </Link>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <GlassCard
                key={task.id}
                className="p-6 hover:bg-white/5 transition-colors border-l-4 border-green-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="text-green-400" size={20} />
                      <h3 className="text-xl font-semibold text-white">
                        {task.titre}
                      </h3>
                      <div
                        className={`w-3 h-3 rounded-full ${getPriorityColor(
                          task.priorite
                        )}`}
                      />
                      <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                        terminée
                      </span>
                    </div>

                    <p className="text-gray-300 mb-4">{task.description}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Flag size={14} />
                        Priorité {getPriorityLabel(task.priorite)}
                      </div>
                      {task.date_echeance && (
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          terminée le{" "}
                          {new Date(task.date_echeance).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => reopenTask(task.id!)}
                      disabled={updatingTaskId === task.id}
                      className="text-gray-400 hover:text-yellow-400 flex items-center gap-1"
                    >
                      <RotateCcw size={14} />
                      Rouvrir
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(task.id!)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
