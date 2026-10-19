import { createTool } from '@anvia/core'
import { tavily } from '@tavily/core'
import { z } from 'zod'

export const readWebpageTool = createTool({
  name: 'read-webpage',
  description: 'Read a public webpage by URL and return its content as Markdown.',
  inputSchema: z.object({
    url: z.url({ protocol: /^https?$/ }),
  }),
  execute: async ({ url }) => {
    const apiKey = process.env.TAVILY_API_KEY?.trim()
    if (!apiKey) {
      throw new Error('Set TAVILY_API_KEY before reading webpages.')
    }

    const response = await tavily({ apiKey }).extract([url], { format: 'markdown' })
    const result = response.results[0]
    if (!result) {
      throw new Error(response.failedResults[0]?.error ?? 'No webpage content returned.')
    }

    return { title: result.title, url: result.url, content: result.rawContent }
  },
})
