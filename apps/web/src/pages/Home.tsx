import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Zap, Shield, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32 flex flex-col items-center text-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background -z-10" />
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold mb-8 backdrop-blur-sm bg-background/50 text-muted-foreground">
          <Sparkles className="w-4 h-4 mr-2 text-primary" />
          Antigravity v2.0 is now live
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 mb-6">
          Build Your Micro-SaaS at Lightning Speed
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
          The ultimate boilerplate with Vite, React, Tailwind v4, and shadcn/ui. 
          Stop configuring. Start building features that matter.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="h-12 px-8 text-lg rounded-full">
            Get Started Free
          </Button>
          <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full">
            View Documentation
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need</h2>
            <p className="mt-4 text-lg text-muted-foreground">Pre-configured and ready to deploy on Day 1.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="bg-background border-muted/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>Powered by Vite and Tailwind v4 for instant HMR and optimized builds.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-background border-muted/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>AI-Ready Architecture</CardTitle>
                <CardDescription>Designed specifically to be easily understood and extended by AI coding agents.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-background border-muted/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Enterprise Grade</CardTitle>
                <CardDescription>Built on solid foundations with TypeScript, React Router, and Zustand.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-24 px-4 flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-primary/5 to-background -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center rounded-full border border-primary/20 px-3 py-1 text-sm font-semibold mb-6 backdrop-blur-sm bg-primary/5 text-primary">
            <Sparkles className="w-4 h-4 mr-2" />
            Limited time offer
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/80">
            Ready to Accelerate Your Development?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
            Join hundreds of developers building their SaaS applications on the modern, production-ready stack.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-12 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all duration-300">
              Get Started Instantly
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

