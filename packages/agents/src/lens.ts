import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'
import { LensClient } from '@anvia/lens'

if (existsSync('.env')) loadEnvFile()

export const lens = new LensClient({
  serviceName: process.env.ANVIA_LENS_SERVICE_NAME?.trim() || 'customer-service-agent',
  optional: true,
})

export const lensTracing = lens.observer({ captureMode: 'full' })
export const lensEvalReporter = lens.evalReporter({ includePayloads: true })
