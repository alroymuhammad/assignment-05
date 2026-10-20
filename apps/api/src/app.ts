import {
  agentToClientStream,
  messagesToUIMessages,
  parseClientStreamRequest,
} from '@anvia/client'
import { createClientStreamResponse } from '@anvia/server'
import { zValidator } from '@hono/zod-validator'
import { runAgent, type AgentUserMessage } from '@repo/agents'
import { agentMemory } from '@repo/db'
import { Hono } from 'hono'
import { z } from 'zod'

export const app = new Hono()

const idSchema = z.string().uuid()
const userIdSchema = z.literal('default-user')

function requestIdentity(c: { req: { header(name: string): string | undefined } }) {
  const sessionId = idSchema.safeParse(c.req.header('x-session-id'))
  const userId = userIdSchema.safeParse(c.req.header('x-user-id'))

  if (!sessionId.success || !userId.success) return null
  return { sessionId: sessionId.data, userId: userId.data }
}

function lastUserMessage(messages: readonly unknown[]): AgentUserMessage | undefined {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (
      typeof message === 'object' &&
      message !== null &&
      'role' in message &&
      message.role === 'user'
    ) {
      return message as AgentUserMessage
    }
  }
  return undefined
}

app.get('/api/health', (c) => c.json({ status: 'ok' }))

app.get('/api/conversations', async (c) => {
  const identity = requestIdentity(c)
  if (!identity) return c.json({ error: 'Missing or invalid client identity' }, 400)

  const conversations = await agentMemory.inspector.listConversations({
    limit: 50,
    userId: identity.userId,
  })
  return c.json({ conversations })
})

app.get('/api/conversations/:ref', async (c) => {
  const identity = requestIdentity(c)
  if (!identity) return c.json({ error: 'Missing or invalid client identity' }, 400)

  const ref = idSchema.safeParse(c.req.param('ref'))
  if (!ref.success) return c.json({ error: 'Invalid conversation reference' }, 400)

  const conversation = await agentMemory.inspector.getConversation({ ref: ref.data })
  if (!conversation || conversation.userId !== identity.userId) {
    return c.json({ error: 'Conversation not found' }, 404)
  }

  return c.json({
    conversation: {
      ...conversation,
      messages: messagesToUIMessages(
        conversation.messages.map((entry) => entry.message),
      ),
    },
  })
})

app.post('/api/chat', async (c) => {
  const identity = requestIdentity(c)
  if (!identity) return c.json({ error: 'Missing or invalid client identity' }, 400)

  let request

  try {
    request = parseClientStreamRequest(await c.req.json())
  } catch {
    return c.json({ error: 'Invalid chat request' }, 400)
  }

  if (request.type !== 'messages') {
    return c.json({ error: 'This endpoint accepts messages only' }, 400)
  }

  const prompt = lastUserMessage(request.messages)
  if (!prompt) return c.json({ error: 'A user message is required' }, 400)

  const title =
    typeof prompt.content === 'string'
      ? prompt.content.replace(/\s+/g, ' ').trim().slice(0, 120)
      : ''
  const stream = runAgent({
    prompt,
    session: {
      sessionId: identity.sessionId,
      userId: identity.userId,
      metadata: title ? { title } : {},
    },
    memoryStore: agentMemory,
    abortSignal: c.req.raw.signal,
  })

  return createClientStreamResponse({
    events: agentToClientStream({ events: stream.events }),
  })
})

app.post(
  '/api/hello',
  zValidator('json', z.object({ name: z.string().trim().min(1) })),
  (c) => {
    const { name } = c.req.valid('json')
    return c.json({ message: `Hello, ${name}!` })
  },
)
