/**
 * Workspace App — Main application entry.
 *
 * TEMPLATE: Add your routes here.
 * - AuthGate protects routes that require authentication
 * - ChatPanel provides AI chat functionality
 * - WorkspaceLayout provides the shell (sidebar, header)
 */

import { BrowserRouter, Routes, Route } from "react-router-dom"
import AuthGate from "@/components/AuthGate"
import WorkspaceLayout from "@/components/layout/WorkspaceLayout"
import MainLayout from "@/components/layout/MainLayout"
import AdminLayout from "@/components/layout/AdminLayout"
import Workspace from "@/pages/Workspace"
import ChatPage from "@/pages/ChatPage"
import LoginPage from "@/pages/LoginPage"
import ErrorBoundary from "@/components/ErrorBoundary"
import Home from "@/pages/Home"
import Dashboard from "@/pages/admin/Dashboard"

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/* Protected App Routes */}
          <Route path="/app" element={<AuthGate><WorkspaceLayout /></AuthGate>}>
            <Route index element={<Workspace />} />
            <Route path="chat" element={<ChatPage />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AuthGate><AdminLayout /></AuthGate>}>
            <Route index element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
