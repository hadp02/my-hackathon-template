import { Outlet, Link, useLocation } from "react-router-dom"
import { Home, Settings, Code, Sparkles, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAuthStore } from "@/stores/authStore"

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const logout = useAuthStore(state => state.logout)

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Workspace", path: "/workspace", icon: Code },
    { name: "Chat AI", path: "/chat", icon: Sparkles },
    { name: "Settings", path: "/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } border-r border-border/40 bg-card/50 backdrop-blur-xl transition-all duration-300 ease-in-out flex flex-col`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/40">
          {sidebarOpen && <span className="font-bold text-lg tracking-tight">Hackathon App</span>}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="shrink-0 text-muted-foreground">
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </Button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant={isActive ? "secondary" : "ghost"} 
                  className={`w-full justify-start ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"} ${!sidebarOpen && "px-0 justify-center"}`}
                  title={item.name}
                >
                  <Icon size={18} className={sidebarOpen ? "mr-3" : ""} />
                  {sidebarOpen && item.name}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border/40">
          <Button variant="ghost" className={`w-full justify-start text-muted-foreground hover:text-destructive ${!sidebarOpen && "px-0 justify-center"}`} onClick={logout}>
            <LogOut size={18} className={sidebarOpen ? "mr-3" : ""} />
            {sidebarOpen && "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-muted/10">
        <header className="h-16 border-b border-border/40 bg-background/50 backdrop-blur-xl flex items-center justify-between px-8 shrink-0">
          <h2 className="text-sm font-medium text-muted-foreground capitalize">
            {location.pathname === "/" ? "Home" : location.pathname.slice(1).replace("-", " ")}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
              U
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto">
          {/* This is where nested routes will render */}
          <Outlet />
        </div>
      </main>
    </div>
  )
}
