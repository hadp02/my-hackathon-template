/**
 * Chat Page — Full-screen AI chat interface.
 *
 * TEMPLATE: Customize this page for your product's AI chat experience.
 */

import ChatPanel from "@/components/ChatPanel"

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <ChatPanel className="h-full" />
    </div>
  )
}
