import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { Pool, type PoolClient } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required')
}

const migrationsDirectory = fileURLToPath(
  new URL('../migrations/', import.meta.url),
)
const pool = new Pool({ connectionString })

async function migrate(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migration (
      name TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  const migrationNames = (await readdir(migrationsDirectory))
    .filter((name) => name.endsWith('.sql'))
    .sort()

  for (const name of migrationNames) {
    const sql = await readFile(`${migrationsDirectory}/${name}`, 'utf8')
    const checksum = createHash('sha256').update(sql).digest('hex')
    const existing = await client.query<{ checksum: string }>(
      'SELECT checksum FROM schema_migration WHERE name = $1',
      [name],
    )

    if (existing.rowCount) {
      if (existing.rows[0]?.checksum !== checksum) {
        throw new Error(`Migration ${name} changed after it was applied`)
      }

      console.log(`skip ${name}`)
      continue
    }

    await client.query(sql)
    await client.query(
      'INSERT INTO schema_migration (name, checksum) VALUES ($1, $2)',
      [name, checksum],
    )
    console.log(`applied ${name}`)
  }
}

const client = await pool.connect()

try {
  await client.query('BEGIN')
  await client.query("SELECT pg_advisory_xact_lock(hashtext('@repo/db:migrate'))")
  await migrate(client)
  await client.query('COMMIT')
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  client.release()
  await pool.end()
}
