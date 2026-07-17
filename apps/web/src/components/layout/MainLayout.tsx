import { Outlet, Link } from "react-router-dom"
import { Bot } from "lucide-react"

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans theme-landing">
      <header className="h-16 border-b flex items-center px-6 lg:px-12 backdrop-blur-md bg-background/80 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Bot className="w-7 h-7 text-primary" />
          <span>SaaS Boilerplate</span>
        </Link>
        <nav className="ml-auto flex items-center gap-6">
          <Link to="/features" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">Features</Link>
          <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">Pricing</Link>
          <a href="/app" className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-6 rounded-full">
            Go to App
          </a>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="py-12 border-t flex flex-col items-center justify-center text-sm text-muted-foreground bg-muted/20">
        <div className="flex gap-4 mb-4">
          <Link to="/terms" className="hover:underline">Terms</Link>
          <Link to="/privacy" className="hover:underline">Privacy</Link>
        </div>
        <p>© 2026 AI Micro-SaaS. Built with Antigravity.</p>
      </footer>
    </div>
  )
}
