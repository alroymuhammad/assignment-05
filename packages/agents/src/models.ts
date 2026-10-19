import { OpenAIClient, type OpenAICompletionModel } from '@anvia/openai'

export const DEFAULT_MODEL_ID = 'deepseek-v4.1-flash'

export function getModel(modelId = DEFAULT_MODEL_ID): OpenAICompletionModel {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('Set OPENAI_API_KEY before running the agent.')
  }

  const client = new OpenAIClient({
    apiKey,
    baseUrl: process.env.OPENAI_BASE_URL || 'https://gateway.devscale.id/v1',
  })

  return client.completionModel({ modelId, api: 'chat' })
}
