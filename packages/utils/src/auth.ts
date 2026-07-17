/**
 * Auth token management utilities.
 *
 * Manages JWT tokens in localStorage and provides an event-based
 * auth state change notification system.
 *
 * @example
 * ```ts
 * import { AuthManager } from "@app/utils";
 *
 * const auth = new AuthManager();
 * auth.onAuthStateChange((user) => {
 *   if (user) console.log("Logged in:", user.email);
 *   else console.log("Logged out");
 * });
 *
 * auth.setToken(jwtToken);
 * ```
 */

import type { User } from "@app/shared-types";

const TOKEN_KEY = "auth_token";

interface TokenPayload {
  sub: string;
  email?: string;
  role?: string;
  exp?: number;
  user_metadata?: {
    display_name?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

type AuthCallback = (user: User | null) => void;

/**
 * Decode a JWT payload without verification.
 * Used client-side to extract user info and check expiry.
 */
function decodePayload(token: string): TokenPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export class AuthManager {
  private listeners: AuthCallback[] = [];

  /** Get the stored JWT token. */
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  /** Store a JWT token and notify listeners. */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.notifyListeners();
  }

  /** Clear the stored token and notify listeners (logout). */
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.notifyListeners();
  }

  /** Check if a valid (non-expired) token exists. */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const payload = decodePayload(token);
    if (!payload?.exp) return true; // No exp = assume valid
    return payload.exp * 1000 > Date.now();
  }

  /**
   * Get the current user from the stored token.
   * Returns null if not authenticated or token is invalid.
   */
  getCurrentUser(): User | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = decodePayload(token);
    if (!payload) return null;

    // Check expiry
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      this.clearToken();
      return null;
    }

    const meta = payload.user_metadata || {};
    return {
      id: payload.sub,
      email: payload.email || "",
      display_name: meta.display_name || meta.full_name || null,
      avatar_url: meta.avatar_url || null,
      role: (payload.role as "user" | "admin") || "user",
      is_active: true,
      created_at: "",
    };
  }

  /** Subscribe to auth state changes. Returns an unsubscribe function. */
  onAuthStateChange(callback: AuthCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(): void {
    const user = this.getCurrentUser();
    for (const cb of this.listeners) {
      cb(user);
    }
  }
}

/** Singleton auth manager instance. */
export const authManager = new AuthManager();
