import { createHttpClientTransport } from '@anvia/client'
import { useChat } from '@anvia/react'
import {
  ChatProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from '@anvia/react-ui'
import { createFileRoute } from '@tanstack/react-router'

const transport = createHttpClientTransport({ endpoint: '/api/chat' })

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const chat = useChat({ transport })

  return (
    <main className="chat-page">
      <ChatProvider controller={chat}>
        <ThreadPrimitive.Root className="chat-shell">
          <header className="chat-header">
            <div>
              <h1>Anvia Support</h1>
              <p>Ask about products, billing, or troubleshooting.</p>
            </div>
            <span className="status-dot" aria-label="Assistant online" />
          </header>

          <ThreadPrimitive.Viewport className="chat-viewport">
            <ThreadPrimitive.Empty className="empty-state">
              <h2>How can I help?</h2>
              <p>Send a message to start a conversation.</p>
            </ThreadPrimitive.Empty>

            <ThreadPrimitive.Messages className="message-list">
              {(message) => (
                <MessagePrimitive.Root
                  className={`message ${message.role === 'user' ? 'message-user' : 'message-assistant'}`}
                >
                  <span className="message-author">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </span>
                  <MessagePrimitive.Content className="message-content">
                    <MessagePrimitive.Parts />
                  </MessagePrimitive.Content>
                </MessagePrimitive.Root>
              )}
            </ThreadPrimitive.Messages>

            <ThreadPrimitive.Loading className="chat-loading">
              Thinking…
            </ThreadPrimitive.Loading>
            <ThreadPrimitive.Error className="chat-error">
              Something went wrong. Please try again.
            </ThreadPrimitive.Error>
          </ThreadPrimitive.Viewport>

          <ComposerPrimitive.Root className="composer">
            <ComposerPrimitive.Input
              className="composer-input"
              placeholder="Type your message…"
              aria-label="Message"
            />
            <ComposerPrimitive.Stop className="composer-button secondary-button">
              Stop
            </ComposerPrimitive.Stop>
            <ComposerPrimitive.Submit className="composer-button">
              Send
            </ComposerPrimitive.Submit>
          </ComposerPrimitive.Root>
        </ThreadPrimitive.Root>
      </ChatProvider>
    </main>
  )
}
