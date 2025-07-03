"use client"

const API_BASE_URL = "http://127.0.0.1:8000"

export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export class AuthService {
  private static readonly ACCESS_TOKEN_KEY = "taskmaster_access_token"
  private static readonly REFRESH_TOKEN_KEY = "taskmaster_refresh_token"

  static setTokens(tokens: AuthTokens): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access_token)
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token)
    }
  }

  static getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY)
    }
    return null
  }

  static getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY)
    }
    return null
  }

  static clearTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY)
      localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }

  static async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) return false

    try {
      const response = await fetch(`${API_BASE_URL}/tasksMasters/refresh_token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        this.setTokens({
          access_token: data.access,
          refresh_token: refreshToken,
        })
        return true
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
    }

    this.clearTokens()
    return false
  }
}
