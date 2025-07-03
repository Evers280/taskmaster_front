"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/neo-button";
import { Input } from "@/components/ui/neo-input";
import { apiService, type Task } from "@/lib/api";
import { AuthService } from "@/lib/auth";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Flag,
} from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "à faire" | "en cours" | "terminé"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "faible" | "moyenne" | "haute"
  >("all");
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Récupérer les filtres depuis l'URL
    const filterParam = searchParams.get("filter");
    if (filterParam === "terminé") {
      setStatusFilter("terminé");
    }

    loadTasks();
  }, [router, searchParams]);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const loadTasks = async () => {
    try {
      const response = await apiService.getTasks();
      setTasks(response);
    } catch (error) {
      console.error("Erreur lors du chargement des tâches:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Filtre par priorité
    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priorite === priorityFilter);
    }

    setFilteredTasks(filtered);
  };

  const updateTaskStatus = async (
    taskId: number,
    newStatus: Task["status"]
  ) => {
    setUpdatingTaskId(taskId);
    try {
      await apiService.updateTask(taskId, { status: newStatus });
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) return;

    try {
      await apiService.deleteTask(taskId);
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "terminé":
        return <CheckCircle className="text-green-400" size={16} />;
      case "en cours":
        return <Clock className="text-yellow-400" size={16} />;
      default:
        return <AlertCircle className="text-blue-400" size={16} />;
    }
  };

  const getStatusLabel = (status: Task["status"]) => {
    switch (status) {
      case "terminé":
        return "Terminée";
      case "en cours":
        return "En cours";
      default:
        return "À faire";
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Chargement des tâches...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
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
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                Mes Tâches
              </h1>
              <p className="text-gray-400">
                {filteredTasks.length} tâche
                {filteredTasks.length > 1 ? "s" : ""}{" "}
                {statusFilter !== "all" &&
                  `(${getStatusLabel(statusFilter as Task["status"])})`}
              </p>
            </div>
          </div>

          <Link href="/add-task">
            <Button variant="neo" className="flex items-center gap-2">
              <Plus size={16} />
              Nouvelle tâche
            </Button>
          </Link>
        </div>

        {/* Filtres et Recherche */}
        <GlassCard className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input
                placeholder="Rechercher une tâche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/30"
              />
            </div>

            {/* Filtre par statut */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-12 rounded-lg border border-white/20 bg-black/30 text-white px-3 py-2 focus:outline-none focus:border-blue-400"
            >
              <option value="all">Tous les statuts</option>
              <option value="à faire">À faire</option>
              <option value="en cours">En cours</option>
              <option value="terminé">Terminées</option>
            </select>

            {/* Filtre par priorité */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="h-12 rounded-lg border border-white/20 bg-black/30 text-white px-3 py-2 focus:outline-none focus:border-blue-400"
            >
              <option value="all">Toutes les priorités</option>
              <option value="haute">Priorité élevée</option>
              <option value="moyenne">Priorité moyenne</option>
              <option value="faible">Priorité faible</option>
            </select>

            {/* Raccourcis */}
            <div className="flex gap-2">
              <Link href="/tasks/completed">
                <Button
                  variant="glass"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <CheckCircle size={14} />
                  Terminées
                </Button>
              </Link>
            </div>
          </div>
        </GlassCard>

        {/* Liste des tâches */}
        {filteredTasks.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-500/20 flex items-center justify-center mb-4">
              <AlertCircle className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucune tâche trouvée
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                ? "Aucune tâche ne correspond à vos critères de recherche."
                : "Vous n'avez pas encore créé de tâches."}
            </p>
            {!searchTerm &&
              statusFilter === "all" &&
              priorityFilter === "all" && (
                <Link href="/add-task">
                  <Button variant="neo">Créer votre première tâche</Button>
                </Link>
              )}
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <GlassCard
                key={task.id}
                className="p-6 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-3 h-3 rounded-full ${getPriorityColor(
                          task.priorite
                        )}`}
                      />
                      <h3 className="text-xl font-semibold text-white">
                        {task.titre}
                      </h3>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(task.status)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            task.status === "terminé"
                              ? "bg-green-500/20 text-green-400"
                              : task.status === "en cours"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {getStatusLabel(task.status)}
                        </span>
                      </div>
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
                          {new Date(task.date_echeance).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {/* Changement de statut */}
                    <div className="flex bg-black/30 rounded-lg p-1">
                      <button
                        onClick={() => updateTaskStatus(task.id!, "à faire")}
                        disabled={updatingTaskId === task.id}
                        className={`px-3 py-1 rounded text-xs transition-colors ${
                          task.status === "à faire"
                            ? "bg-blue-500 text-white"
                            : "text-gray-400 hover:text-white hover:bg-blue-500/20"
                        }`}
                      >
                        À faire
                      </button>
                      <button
                        onClick={() => updateTaskStatus(task.id!, "en cours")}
                        disabled={updatingTaskId === task.id}
                        className={`px-3 py-1 rounded text-xs transition-colors ${
                          task.status === "en cours"
                            ? "bg-yellow-500 text-white"
                            : "text-gray-400 hover:text-white hover:bg-yellow-500/20"
                        }`}
                      >
                        En cours
                      </button>
                      <button
                        onClick={() => updateTaskStatus(task.id!, "terminé")}
                        disabled={updatingTaskId === task.id}
                        className={`px-3 py-1 rounded text-xs transition-colors ${
                          task.status === "terminé"
                            ? "bg-green-500 text-white"
                            : "text-gray-400 hover:text-white hover:bg-green-500/20"
                        }`}
                      >
                        Terminé
                      </button>
                    </div>

                    {/* Actions */}
                    <Link href={`/edit-task/${task.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-blue-400"
                      >
                        <Edit size={16} />
                      </Button>
                    </Link>
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
