import { createHttpClientTransport, type UIMessage } from '@anvia/client'

const SESSION_KEY = 'maju-telco:session-id'
const PENDING_MESSAGE_PREFIX = 'maju-telco:pending-message:'
const USER_ID = 'default-user'

export function currentSessionId(): string {
  const existing = window.localStorage.getItem(SESSION_KEY)
  if (existing) return existing
  return startNewSession()
}

export function startNewSession(): string {
  const id = window.crypto.randomUUID()
  window.localStorage.setItem(SESSION_KEY, id)
  return id
}

export function selectSession(sessionId: string): void {
  window.localStorage.setItem(SESSION_KEY, sessionId)
}

export function queuePendingMessage(sessionId: string, message: string): void {
  window.sessionStorage.setItem(`${PENDING_MESSAGE_PREFIX}${sessionId}`, message)
}

export function pendingMessage(sessionId: string): string | null {
  return window.sessionStorage.getItem(`${PENDING_MESSAGE_PREFIX}${sessionId}`)
}

export function clearPendingMessage(sessionId: string): void {
  window.sessionStorage.removeItem(`${PENDING_MESSAGE_PREFIX}${sessionId}`)
}

function identityHeaders(): Record<string, string> {
  return {
    'x-session-id': currentSessionId(),
    'x-user-id': USER_ID,
  }
}

export const chatTransport = createHttpClientTransport({
  endpoint: '/api/chat',
  headers: identityHeaders,
})

export type ConversationSummary = {
  ref: string
  sessionId: string
  metadata?: { title?: unknown }
  createdAt: string
  updatedAt: string
  messageCount: number
}

export type Conversation = ConversationSummary & {
  messages: UIMessage[]
}

export function conversationTitle(conversation: ConversationSummary): string {
  const title = conversation.metadata?.title
  return typeof title === 'string' && title.trim() ? title : 'Conversation'
}

export async function listConversations(): Promise<ConversationSummary[]> {
  const response = await fetch('/api/conversations', { headers: identityHeaders() })
  if (!response.ok) throw new Error('Could not load conversations')
  const body = (await response.json()) as { conversations: ConversationSummary[] }
  return body.conversations
}

export async function getConversation(ref: string): Promise<Conversation> {
  const response = await fetch(`/api/conversations/${encodeURIComponent(ref)}`, {
    headers: identityHeaders(),
  })
  if (!response.ok) throw new Error('Could not load conversation')
  const body = (await response.json()) as { conversation: Conversation }
  return body.conversation
}
