import {
  createMemoryScopeKey,
  type JsonObject,
  type MemoryAppendOptions,
  type MemoryClearOptions,
  type MemoryConversation,
  type MemoryConversationGetOptions,
  type MemoryConversationListOptions,
  type MemoryConversationSummary,
  type MemoryErrorOptions,
  type MemoryLoadOptions,
  type MemoryScope,
  type MemoryStore,
  type Message,
} from '@anvia/core'
import { pool, withTransaction, type DatabaseClient } from './client.js'

type SessionRow = {
  id: string
  session_id: string
  user_id: string | null
  metadata: JsonObject
  created_at: Date
  updated_at: Date
  message_count: number
}

type MessageRow = {
  position: number
  run_id: string
  turn: number
  created_at: Date
  message: Message
}

function scopeKey(scope: MemoryScope): string {
  return createMemoryScopeKey({ scope, includeUserId: true })
}

function toSummary(row: SessionRow): MemoryConversationSummary {
  return {
    ref: row.id,
    sessionId: row.session_id,
    ...(row.user_id ? { userId: row.user_id } : {}),
    metadata: row.metadata,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    messageCount: Number(row.message_count),
  }
}

async function ensureSession(
  client: DatabaseClient,
  scope: MemoryScope,
): Promise<string> {
  const result = await client.query<{ id: string }>(
    `INSERT INTO agent_memory_session (scope_key, session_id, user_id, metadata)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (scope_key) DO UPDATE SET
       metadata = EXCLUDED.metadata || agent_memory_session.metadata,
       updated_at = now()
     RETURNING id`,
    [
      scopeKey(scope),
      scope.sessionId,
      scope.userId ?? null,
      JSON.stringify(scope.metadata ?? {}),
    ],
  )

  const id = result.rows[0]?.id
  if (!id) throw new Error('Failed to create memory session')
  return id
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack ?? null }
  }

  return { name: null, message: String(error), stack: null }
}

export class PostgresMemoryStore implements MemoryStore {
  readonly inspector = {
    listConversations: (options: MemoryConversationListOptions) =>
      this.listConversations(options),
    getConversation: (options: MemoryConversationGetOptions) =>
      this.getConversation(options),
  }

  async load({ scope }: MemoryLoadOptions): Promise<Message[]> {
    const result = await pool.query<{ message: Message }>(
      `SELECT message.message
       FROM agent_memory_message AS message
       JOIN agent_memory_session AS session ON session.id = message.session_id
       WHERE session.scope_key = $1
       ORDER BY message.position`,
      [scopeKey(scope)],
    )

    return result.rows.map((row) => row.message)
  }

  async append({ scope, runId, turn, messages }: MemoryAppendOptions): Promise<void> {
    if (messages.length === 0) return

    await withTransaction(async (client) => {
      const sessionId = await ensureSession(client, scope)
      await client.query('SELECT id FROM agent_memory_session WHERE id = $1 FOR UPDATE', [
        sessionId,
      ])
      const positionResult = await client.query<{ next_position: number }>(
        `SELECT COALESCE(MAX(position), 0) + 1 AS next_position
         FROM agent_memory_message
         WHERE session_id = $1`,
        [sessionId],
      )
      let position = Number(positionResult.rows[0]?.next_position ?? 1)

      for (const message of messages) {
        await client.query(
          `INSERT INTO agent_memory_message
             (session_id, position, run_id, turn, message)
           VALUES ($1, $2, $3, $4, $5)`,
          [sessionId, position, runId, turn, JSON.stringify(message)],
        )
        position += 1
      }

      await client.query(
        'UPDATE agent_memory_session SET updated_at = now() WHERE id = $1',
        [sessionId],
      )
    })
  }

  async clear({ scope }: MemoryClearOptions): Promise<void> {
    await pool.query('DELETE FROM agent_memory_session WHERE scope_key = $1', [
      scopeKey(scope),
    ])
  }

  async recordError({ scope, runId, error, messages }: MemoryErrorOptions): Promise<void> {
    const serialized = serializeError(error)

    await withTransaction(async (client) => {
      const sessionId = await ensureSession(client, scope)
      await client.query(
        `INSERT INTO agent_memory_error
           (session_id, run_id, error_name, error_message, error_stack, messages)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          sessionId,
          runId,
          serialized.name,
          serialized.message,
          serialized.stack,
          JSON.stringify(messages),
        ],
      )
    })
  }

  private async listConversations({
    limit,
    userId,
  }: MemoryConversationListOptions): Promise<MemoryConversationSummary[]> {
    const result = await pool.query<SessionRow>(
      `SELECT session.id, session.session_id, session.user_id, session.metadata,
              session.created_at, session.updated_at,
              COUNT(message.id)::int AS message_count
       FROM agent_memory_session AS session
       LEFT JOIN agent_memory_message AS message ON message.session_id = session.id
       WHERE ($1::text IS NULL OR session.user_id = $1)
       GROUP BY session.id
       ORDER BY session.updated_at DESC
       LIMIT $2`,
      [userId ?? null, limit],
    )

    return result.rows.map(toSummary)
  }

  private async getConversation({
    ref,
  }: MemoryConversationGetOptions): Promise<MemoryConversation | undefined> {
    const sessionResult = await pool.query<SessionRow>(
      `SELECT session.id, session.session_id, session.user_id, session.metadata,
              session.created_at, session.updated_at,
              COUNT(message.id)::int AS message_count
       FROM agent_memory_session AS session
       LEFT JOIN agent_memory_message AS message ON message.session_id = session.id
       WHERE session.id = $1
       GROUP BY session.id`,
      [ref],
    )
    const session = sessionResult.rows[0]
    if (!session) return undefined

    const messagesResult = await pool.query<MessageRow>(
      `SELECT position, run_id, turn, created_at, message
       FROM agent_memory_message
       WHERE session_id = $1
       ORDER BY position`,
      [session.id],
    )

    return {
      ...toSummary(session),
      messages: messagesResult.rows.map((row) => ({
        position: Number(row.position),
        runId: row.run_id,
        turn: row.turn,
        createdAt: row.created_at.toISOString(),
        message: row.message,
      })),
    }
  }
}

export const agentMemory = new PostgresMemoryStore()
