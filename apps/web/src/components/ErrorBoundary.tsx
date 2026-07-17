import { Component } from "react"
import type { ErrorInfo, ReactNode } from "react"
import { AlertTriangle, Shield, RotateCcw, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  private handleTryAgain = () => {
    // Clear error state and force a re-render
    this.setState({ hasError: false, error: null })
  }

  private handleReload = () => {
    // Force complete reload of session
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background text-foreground">
          <div className="absolute inset-0 bg-gradient-to-tr from-destructive/5 via-background to-background -z-10" />
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-20 h-20 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-destructive/10 rounded-full animate-pulse" />
              <Shield className="w-12 h-12 text-destructive relative z-10" />
              <AlertTriangle className="w-5 h-5 text-destructive-foreground absolute bottom-1 right-1 bg-destructive rounded-full p-0.5 border-2 border-background z-20" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight">Application Error</h1>
              <p className="text-muted-foreground text-sm">
                A critical rendering error occurred in the application workspace.
              </p>
            </div>

            {this.state.error && (
              <div className="p-4 rounded-lg bg-muted/55 border border-muted text-left font-mono text-xs overflow-auto max-h-40">
                <p className="font-semibold text-destructive">{this.state.error.name}: {this.state.error.message}</p>
                {this.state.error.stack && (
                  <pre className="mt-2 text-muted-foreground whitespace-pre-wrap font-mono">{this.state.error.stack}</pre>
                )}
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button onClick={this.handleTryAgain} variant="default" className="inline-flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Try Again
              </Button>
              <Button onClick={this.handleReload} variant="outline" className="inline-flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
