/**
 * Core API Client
 * Uses native fetch API. Can be replaced with Axios if needed.
 */

const API_BASE_URL = "/api/v1"

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("auth_token")
  
  const headers = new Headers(options.headers)
  headers.set("Content-Type", "application/json")
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || errorData.message || "An error occurred")
  }

  return response.json()
}
