"use client"

import { AuthService } from "./auth"

const API_BASE_URL = "http://127.0.0.1:8000"

export interface Master {
  id?: number
  email: string
  password?: string
}

export interface Task {
  id?: number
  titre: string
  description: string
  priorite: "faible" | "moyenne" | "haute"
  date_echeance: string
  created_date?: string
  status: "à faire" | "en cours" | "terminé"
  masters?: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
}

class ApiService {
  private async makeRequest(endpoint: string, options: RequestInit = {}, requireAuth = false): Promise<Response> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = new Headers(options.headers)
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
    }

    if (requireAuth) {
      const token = AuthService.getAccessToken()
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }
    }

    let response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle token refresh
    if (response.status === 401 && requireAuth) {
      const refreshed = await AuthService.refreshAccessToken()
      if (refreshed) {
        const newToken = AuthService.getAccessToken()
        if (newToken) {
          headers.set("Authorization", `Bearer ${newToken}`)
          response = await fetch(url, {
            ...options,
            headers,
          })
        }
      } else {
        // Redirect to login
        window.location.href = "/login"
        throw new Error("Authentication failed")
      }
    }

    return response
  }

  // Auth endpoints
  async login(credentials: LoginCredentials) {
    const response = await this.makeRequest("/tasksMasters/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
    return await response.json()
  }

  async register(data: RegisterData) {
    const response = await this.makeRequest("/taskMasters/masters/", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return await response.json()
  }

  async logout() {
    const response = await this.makeRequest(
      "/tasksMasters/logout/",
      {
        method: "POST",
      },
      true,
    )
    return await response.json()
  }

  async resetPassword(email: string) {
    const response = await this.makeRequest("/tasksMasters/auth/password/reset/", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
    return await response.json()
  }

  async confirmPasswordReset(data: { uid: string; token: string; new_password1: string; new_password2: string }) {
    const response = await this.makeRequest("/tasksMasters/auth/password/reset/confirm/", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return await response.json()
  }

  // Masters endpoints
  async getCurrentUser() {
    const response = await this.makeRequest(
      "/tasksMasters/auth/user/",
      {
        method: "GET",
      },
      true,
    )
    return await response.json()
  }

  async updateUser(data: Partial<Master>) {
    const response = await this.makeRequest(
      "/tasksMasters/auth/user/",
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      true,
    )
    return await response.json()
  }

  // Tasks endpoints
  async getTasks(): Promise<Task[]> {
    const response = await this.makeRequest(
      "/tasksMaster/tasks/",
      {
        method: "GET",
      },
      true,
    )
    return await response.json()
  }

  async getTask(id: number): Promise<Task> {
    const response = await this.makeRequest(
      `/tasksMaster/tasks/${id}/`,
      {
        method: "GET",
      },
      true,
    )
    return await response.json()
  }

  async createTask(task: Omit<Task, "id" | "created_date">) {
    // --- 2. VÉRIFICATION JUSTE AVANT LA REQUÊTE HTTP ---
    // Affiche les données telles qu'elles sont envoyées dans le corps de la requête.
    // C'est la dernière étape avant que les données ne quittent le navigateur.
    console.log("2. Envoi des données au backend via createTask :", task);
    const response = await this.makeRequest(
      "/tasksMaster/tasks/",
      {
        method: "POST",
        body: JSON.stringify(task),
      },
      true,
    );

    const responseData = await response.json();
    // --- 3. VÉRIFICATION DE LA RÉPONSE DU BACKEND ---
    // Affiche la réponse du backend. Utile pour voir les succès ou les erreurs.
    console.log("3. Réponse reçue du backend :", responseData);

    return responseData;
  }

  async updateTask(id: number, task: Partial<Task>) {
    const response = await this.makeRequest(
      `/tasksMaster/tasks/${id}/`,
      {
        method: "PATCH",
        body: JSON.stringify(task),
      },
      true,
    )
    return await response.json()
  }

  async deleteTask(id: number) {
    const response = await this.makeRequest(
      `/tasksMaster/tasks/${id}/`,
      {
        method: "DELETE",
      },
      true,
    )
    return await response.json()
  }
}

export const apiService = new ApiService()
