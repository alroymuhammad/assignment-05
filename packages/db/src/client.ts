import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required')
}

export const pool = new Pool({ connectionString })

export type DatabaseClient = Pick<PoolClient, 'query'>

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: readonly unknown[] = [],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, [...values])
}

export async function withTransaction<T>(
  operation: (client: DatabaseClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const result = await operation(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export function closeDatabase(): Promise<void> {
  return pool.end()
}
