import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Sparkles, Send, User, Bot } from "lucide-react"

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Workspace() {
  const [prompt, setPrompt] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!prompt.trim() || isLoading) return

    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: prompt }
    setMessages(prev => [...prev, userMsg])
    setPrompt("")
    setIsLoading(true)

    const astMsgId = (Date.now() + 1).toString()
    // Khởi tạo message rỗng với mảng tool_calls trống (chỉ UI dùng, ko push về DB thực)
    setMessages(prev => [...prev, { id: astMsgId, role: 'assistant', content: '', tool_calls: [] } as any])

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8002';
      const token = localStorage.getItem("auth_token");
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/v1/ai/chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: userMsg.content })
      })

      if (!res.body) throw new Error("No response body")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        
        const chunkStr = decoder.decode(value, { stream: true })
        const lines = chunkStr.split('\n').filter(line => line.trim() !== '')
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            
            // Xử lý các dạng event từ Backend Stream (Mock)
            if (data.type === 'tool_call' || data.type === 'rag_retrieval' || data.type === 'sub_agent') {
              setMessages(prev => prev.map(msg => 
                msg.id === astMsgId 
                  ? { ...msg, tool_calls: [...(msg as any).tool_calls || [], { type: data.type, content: data.content }] } 
                  : msg
              ))
            } else if (data.content) { // Standard text chunk
              setMessages(prev => prev.map(msg => 
                msg.id === astMsgId ? { ...msg, content: msg.content + data.content } : msg
              ))
            }
          } catch (e) {
            console.error("Error parsing chunk", e)
          }
        }
      }
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Lỗi kết nối tới Backend (8000).' }])
    } finally {
      setIsLoading(false)
    }
  }

  // Helper render icon cho tool calls
  const getToolIcon = (type: string) => {
    if (type === 'tool_call') return "🪛";
    if (type === 'sub_agent') return "🌐";
    if (type === 'rag_retrieval') return "🔍";
    return "⚡";
  }

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-4rem)] flex flex-col relative bg-muted/10 rounded-xl my-4 border shadow-sm overflow-hidden">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-primary/10">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold mb-3 tracking-tight text-foreground">How can I help you today?</h1>
          <p className="text-muted-foreground max-w-md text-[15px] leading-relaxed">
            Gõ tin nhắn để bắt đầu. Hệ thống đang được cấu hình <b>Mock LLM Mode</b> để test UI.
            Thử gõ: <i className="text-foreground">"Thời tiết"</i>, <i className="text-foreground">"RAG"</i>, hoặc <i className="text-foreground">"Phân tích"</i>.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <Card onClick={() => setPrompt("Thời tiết hôm nay thế nào?")} className="px-5 py-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 text-sm text-left border-border/50 bg-background/50 backdrop-blur-sm">
              <span className="font-semibold block mb-1.5 text-foreground">Thời tiết</span>
              <span className="text-muted-foreground text-[13px]">Test Tool Call UI</span>
            </Card>
            <Card onClick={() => setPrompt("Tìm trong tài liệu RAG giúp tôi")} className="px-5 py-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 text-sm text-left border-border/50 bg-background/50 backdrop-blur-sm">
              <span className="font-semibold block mb-1.5 text-foreground">Tra tài liệu RAG</span>
              <span className="text-muted-foreground text-[13px]">Test RAG Pipeline UI</span>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-8 space-y-8 pb-40 scroll-smooth">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border ${msg.role === 'user' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-card-foreground border-border/50'}`}>
                {msg.role === 'user' ? <User size={15} /> : <Bot size={15} />}
              </div>
              <div className={`px-5 py-3.5 rounded-3xl max-w-[85%] sm:max-w-[75%] shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border border-border/40 text-card-foreground rounded-tl-sm flex flex-col gap-3'}`}>
                {/* Render Tool Calls if any */}
                {(msg as any).tool_calls && (msg as any).tool_calls.length > 0 && (
                  <div className="flex flex-col gap-2 mb-1 w-full">
                    {(msg as any).tool_calls.map((tool: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2.5 bg-muted/30 border border-border/40 rounded-xl px-3.5 py-2.5 text-[13px] text-muted-foreground w-fit max-w-full animate-in fade-in zoom-in-95">
                        {msg.content.length === 0 && isLoading ? (
                          <span className="relative flex h-3 w-3 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary/70"></span>
                          </span>
                        ) : (
                          <span className="text-emerald-500 text-[14px]">✅</span>
                        )}
                        <span className="font-medium mr-1 text-foreground/80">{getToolIcon(tool.type)}</span>
                        <span className="truncate tracking-tight">{tool.content}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Render Main Content */}
                {msg.content && (
                  <div className="whitespace-pre-wrap text-[15px] leading-relaxed tracking-normal">{msg.content}</div>
                )}
                
                {/* Loading Indicator */}
                {msg.role === 'assistant' && msg.content === '' && (!(msg as any).tool_calls || (msg as any).tool_calls.length === 0) && (
                  <div className="flex gap-1.5 mt-1 items-center h-5">
                    <div className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Floating Input Area */}
      <div className="absolute bottom-6 left-0 right-0 px-4 md:px-8">
        <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-6 duration-700 ease-out fill-mode-both">
          <form onSubmit={handleSubmit} className="relative bg-background/70 backdrop-blur-xl border border-border/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 rounded-3xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/30 group">
            <Input 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything..." 
              className="border-0 shadow-none focus-visible:ring-0 rounded-3xl py-7 px-6 pr-14 text-[15px] bg-transparent transition-colors group-focus-within:bg-background/90"
            />
            <Button 
              type="submit"
              size="icon" 
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full h-[34px] w-[34px] shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:active:scale-100 group-focus-within:bg-primary group-focus-within:text-primary-foreground bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground"
              disabled={!prompt.trim() || isLoading}
            >
              <Send className="w-[15px] h-[15px] ml-[2px]" />
            </Button>
          </form>
          <p className="text-center text-[11px] text-muted-foreground mt-3 font-medium tracking-wide opacity-60">
            AI can make mistakes. Consider verifying important information.
          </p>
        </div>
      </div>
    </div>
  )
}
