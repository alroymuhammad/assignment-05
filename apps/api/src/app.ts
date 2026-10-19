import {
  agentToClientStream,
  parseClientStreamRequest,
} from '@anvia/client'
import { createClientStreamResponse } from '@anvia/server'
import { zValidator } from '@hono/zod-validator'
import { runAgent } from '@repo/agents'
import { Hono } from 'hono'
import { z } from 'zod'

export const app = new Hono()

app.get('/api/health', (c) => c.json({ status: 'ok' }))

app.post('/api/chat', async (c) => {
  let request

  try {
    request = parseClientStreamRequest(await c.req.json())
  } catch {
    return c.json({ error: 'Invalid chat request' }, 400)
  }

  if (request.type !== 'messages') {
    return c.json({ error: 'This endpoint accepts messages only' }, 400)
  }

  const stream = runAgent({
    messages: request.messages,
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
