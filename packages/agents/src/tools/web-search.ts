import { createTool } from '@anvia/core'
import { tavily } from '@tavily/core'
import { z } from 'zod'

export const webSearchTool = createTool({
  name: 'search-web',
  description: 'Search the public web for current information and return results with source URLs.',
  inputSchema: z.object({
    query: z.string().trim().min(1, 'Search query cannot be empty'),
  }),
  execute: async ({ query }) => {
    const apiKey = process.env.TAVILY_API_KEY?.trim()
    if (!apiKey) {
      throw new Error('Set TAVILY_API_KEY before using web search.')
    }

    const response = await tavily({ apiKey }).search(query, {
      searchDepth: 'basic',
      maxResults: 5,
    })

    return response.results.map(({ title, url, content }) => ({ title, url, content }))
  },
})
