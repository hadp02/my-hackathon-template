/**
 * Zustand auth store.
 *
 * Manages authentication state for the workspace application.
 * Uses @app/utils AuthManager under the hood.
 */

import { create } from "zustand";
import type { User } from "@app/shared-types";
import { authManager } from "@app/utils";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  /** Initialize auth state from stored token. Call once on app mount. */
  initialize: () => void;
  /** Login with a JWT token (received from Backend API). */
  login: (token: string) => void;
  /** Clear auth state. */
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: () => {
    const user = authManager.getCurrentUser();
    const token = authManager.getToken();
    set({
      user,
      token,
      isAuthenticated: !!user,
      isLoading: false,
    });
  },

  login: (token: string) => {
    authManager.setToken(token);
    const user = authManager.getCurrentUser();
    set({
      user,
      token,
      isAuthenticated: !!user,
    });
  },

  logout: () => {
    authManager.clearToken();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));
