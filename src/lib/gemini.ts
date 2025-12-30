import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildPromptWithHistory } from './prompts'
import { LearningMode, Message } from './types'

// Helper to get API key from request headers (user's key takes priority)
export function getApiKeyFromRequest(request: Request): string {
  const userApiKey = request.headers.get('x-gemini-api-key')
  return userApiKey || process.env.GEMINI_API_KEY || ''
}

// Helper to create Gemini client with optional user API key
export function createGeminiClient(apiKey: string): GoogleGenerativeAI {
  return new GoogleGenerativeAI(apiKey)
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function generateResponse(
  userInput: string,
  mode: LearningMode,
  conversationHistory: Message[] = []
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = buildPromptWithHistory(mode, conversationHistory, userInput)

  // Retry logic for rate limits
  let lastError: Error | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        await delay(1000 * Math.pow(2, attempt))
      }

      const result = await model.generateContent(prompt)
      const response = result.response
      const text = response.text()
      return text
    } catch (error: unknown) {
      lastError = error as Error
      const err = error as { status?: number }
      if (err.status !== 429) {
        throw error
      }
    }
  }

  throw lastError || new Error('Failed after retries')
}
