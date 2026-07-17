import { Outlet } from "react-router-dom"
import { Bot, MessageSquare, Plus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WorkspaceLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/20 flex flex-col hidden md:flex">
        <div className="h-14 flex items-center px-4 border-b">
          <Bot className="w-5 h-5 mr-2 text-primary" />
          <span className="font-semibold text-sm">AI Workspace</span>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <Button variant="outline" className="w-full justify-start mb-6">
            <Plus className="w-4 h-4 mr-2" /> New Chat
          </Button>
          <div className="text-xs font-semibold text-muted-foreground mb-3 px-2">Recent</div>
          <div className="flex flex-col gap-1">
            <Button variant="ghost" className="justify-start h-8 px-2 text-sm font-normal">
              <MessageSquare className="w-4 h-4 mr-2 text-muted-foreground" /> Report Analysis
            </Button>
            <Button variant="ghost" className="justify-start h-8 px-2 text-sm font-normal">
              <MessageSquare className="w-4 h-4 mr-2 text-muted-foreground" /> Email Draft
            </Button>
          </div>
        </div>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="w-4 h-4 mr-2" /> Settings
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center px-6 lg:px-8">
          <h2 className="text-sm font-semibold">New Generation</h2>
        </header>
        <div className="flex-1 overflow-y-auto relative">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
