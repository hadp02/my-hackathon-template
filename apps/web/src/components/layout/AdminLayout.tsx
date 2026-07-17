import { Outlet, Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, Settings, LogOut, Search, Bell, ActivitySquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-16 items-center border-b px-6 font-bold text-lg">
          AI Admin Panel
        </div>
        <nav className="flex flex-col gap-2 p-4 flex-1">
          <Link to="/" className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${currentPath === '/' ? 'bg-primary text-primary-foreground font-medium hover:bg-primary/90' : 'text-muted-foreground hover:text-primary hover:bg-muted'}`}>
            <LayoutDashboard className="h-4 w-4" /> Business Dashboard
          </Link>
          <Link to="/tracing" className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${currentPath === '/tracing' ? 'bg-primary text-primary-foreground font-medium hover:bg-primary/90' : 'text-muted-foreground hover:text-primary hover:bg-muted'}`}>
            <ActivitySquare className="h-4 w-4" /> AI Tracing
          </Link>
          <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted">
            <Users className="h-4 w-4" /> Users
          </Link>
          <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted">
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </nav>
        <div className="p-4 mt-auto">
          <Link to="/" className="flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
            <LogOut className="h-4 w-4" /> Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content wrapper */}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64 flex-1">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            />
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full bg-muted outline-none ring-ring hover:bg-muted/80 focus-visible:ring-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
