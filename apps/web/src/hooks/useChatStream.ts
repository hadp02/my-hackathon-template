/**
 * useChatStream hook — manages AI chat state and streaming.
 *
 * Connects to the API proxy at /api/v1/ai/chat/stream.
 * Handles NDJSON streaming, message history, and loading state.
 *
 * @example
 * ```tsx
 * const { messages, sendMessage, isStreaming } = useChatStream();
 * ```
 */

import { useState, useCallback, useRef } from "react";
import type { ChatMessage, StreamChunk } from "@app/shared-types";

const API_BASE = import.meta.env.VITE_API_URL || "";

interface UseChatStreamOptions {
  /** Agent ID to use (default: "assistant") */
  agentId?: string;
  /** Session ID for conversation continuity */
  sessionId?: string;
}

interface UseChatStreamReturn {
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  isStreaming: boolean;
  error: string | null;
  clearMessages: () => void;
  clearError: () => void;
}

let messageCounter = 0;
function generateId(): string {
  return `msg_${Date.now()}_${++messageCounter}`;
}

export function useChatStream(
  options: UseChatStreamOptions = {}
): UseChatStreamReturn {
  const { agentId = "assistant", sessionId } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      setError(null);

      // Add user message
      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content,
        created_at: new Date().toISOString(),
      };

      // Add placeholder assistant message
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "",
        tool_calls: [],
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      // Abort previous request if any
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const token = localStorage.getItem("auth_token");
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}/api/v1/ai/chat/stream`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            message: content,
            session_id: sessionId,
            agent_id: agentId,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.detail || `Chat request failed (${response.status})`
          );
        }

        if (!response.body) {
          throw new Error("No response body for streaming");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n").filter((l) => l.trim());

          for (const line of lines) {
            try {
              const chunk: StreamChunk = JSON.parse(line);

              if ((chunk as any).error) {
                throw new Error((chunk as any).error);
              }

              if (chunk.content) {
                // Append content to the assistant message
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + chunk.content,
                    };
                  }
                  return updated;
                });
              }

              if (chunk.type === "tool_call" || chunk.type === "rag_retrieval") {
                // Add tool call event to assistant message
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      tool_calls: [
                        ...(last.tool_calls || []),
                        { 
                          type: chunk.type!, 
                          content: chunk.content || "", 
                          name: chunk.name, 
                          args: chunk.args 
                        },
                      ],
                    };
                  }
                  return updated;
                });
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return; // User cancelled
        }
        const errorMsg =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMsg);
        // Update assistant message with error
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant" && !last.content) {
            updated[updated.length - 1] = {
              ...last,
              content: `⚠️ ${errorMsg}`,
            };
          }
          return updated;
        });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [agentId, sessionId, isStreaming]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { messages, sendMessage, isStreaming, error, clearMessages, clearError };
}
