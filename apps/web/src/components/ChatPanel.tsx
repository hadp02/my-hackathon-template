/**
 * ChatPanel — AI Chat UI component.
 *
 * TEMPLATE: Customize styling, layout, and features for your project.
 * This provides a functional chat panel with streaming support.
 *
 * Features:
 * - Real-time NDJSON streaming with typing indicator
 * - Tool call visualization
 * - Auto-scroll to bottom
 * - Agent selection
 * - Markdown-ready content display
 */

import { useRef, useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { useChatStream } from "@/hooks/useChatStream";
import type { ChatMessage, ToolCallEvent } from "@app/shared-types";

interface ChatPanelProps {
  /** CSS class for the outer container */
  className?: string;
  /** Default agent to use */
  defaultAgent?: string;
}

function ToolCallBadge({ event }: { event: ToolCallEvent }) {
  const isTool = event.type === "tool_call";
  const icon = isTool ? "🔧" : "📚";
  
  if (!isTool || !event.args) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
        {icon} {event.content}
      </span>
    );
  }

  return (
    <details className="w-full mb-1 border rounded-md bg-muted/30 overflow-hidden text-xs">
      <summary className="cursor-pointer px-3 py-2 bg-primary/5 text-primary hover:bg-primary/10 transition-colors font-medium flex items-center outline-none">
        <span className="mr-2">{icon}</span>
        {event.content}
      </summary>
      <div className="p-3 border-t bg-background overflow-x-auto">
        <pre className="text-[10px] font-mono text-muted-foreground whitespace-pre-wrap">
          {JSON.stringify(event.args, null, 2)}
        </pre>
      </div>
    </details>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        }`}
      >
        {/* Tool calls */}
        {message.tool_calls && message.tool_calls.length > 0 && (
          <div className="flex flex-col gap-1 mb-2 w-full min-w-[250px]">
            {message.tool_calls.map((tc, i) => (
              <ToolCallBadge key={i} event={tc} />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {message.content || (
            <span className="inline-flex gap-1">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>●</span>
              <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>●</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPanel({ className = "", defaultAgent = "assistant" }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [agentId, setAgentId] = useState(defaultAgent);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, isStreaming, error, clearMessages, clearError } =
    useChatStream({ agentId });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const msg = input;
    setInput("");
    await sendMessage(msg);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">AI Chat</span>
          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="text-xs bg-muted rounded-md px-2 py-1 border-0 outline-none cursor-pointer"
          >
            <option value="assistant">Assistant</option>
            <option value="rag">RAG</option>
          </select>
        </div>
        <button
          onClick={clearMessages}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
        >
          Clear
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={clearError} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
            <span className="text-4xl">💬</span>
            <p>Start a conversation with the AI assistant.</p>
            <p className="text-xs">
              Using agent: <strong>{agentId}</strong>
            </p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Shift+Enter for new line)"
            rows={1}
            className="flex-1 resize-none rounded-xl border bg-muted/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {isStreaming ? "..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
