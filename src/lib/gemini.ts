import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSystemPrompt, LearningMode } from './prompts'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function generateResponse(userInput: string, mode: LearningMode): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const systemPrompt = getSystemPrompt(mode)

  const prompt = `${systemPrompt}

Student's input:
${userInput}

Your response:`

  // Retry logic for rate limits
  let lastError: Error | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        // Wait before retry (exponential backoff)
        await delay(1000 * Math.pow(2, attempt))
      }

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      return text
    } catch (error: unknown) {
      lastError = error as Error
      const err = error as { status?: number }
      // Only retry on rate limit errors
      if (err.status !== 429) {
        throw error
      }
    }
  }

  throw lastError || new Error('Failed after retries')
}
