/**
 * Auth gate component.
 *
 * Wraps protected routes. If the user is not authenticated,
 * shows a login prompt instead of the protected content.
 *
 * TEMPLATE: Customize the login UI for your project.
 * This provides a minimal placeholder.
 */

import { useEffect, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

interface AuthGateProps {
  children: ReactNode;
  /** If true, show content to unauthenticated users too (for mixed pages). */
  optional?: boolean;
}

export default function AuthGate({ children, optional = false }: AuthGateProps) {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated && !optional) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
