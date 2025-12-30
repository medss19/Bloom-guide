import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function POST(request: NextRequest) {
  try {
    const { topic, followUp, history } = await request.json()

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    let prompt: string

    if (followUp) {
      // Build conversation context for follow-up
      let conversationContext = ''
      if (Array.isArray(history) && history.length > 0) {
        conversationContext = history
          .slice(-6)
          .map((msg: { role: string; content: string }) =>
            `${msg.role === 'user' ? 'Student' : 'Teacher'}: ${msg.content}`
          )
          .join('\n\n')
      }

      prompt = `You are a friendly, patient teacher helping a student understand "${topic}".

Previous conversation:
${conversationContext}

Student's follow-up question: ${followUp}

Guidelines:
- Keep your response SHORT (max 100 words)
- Answer their specific question
- Use simple language a kid can understand
- Be encouraging and friendly
- If they seem confused, try a different analogy

Your response:`
    } else {
      // Initial explanation
      prompt = `You are a friendly, patient teacher. A student wants to learn about: "${topic}"

Guidelines:
- Keep it SHORT and FUN (max 150 words total)
- Start with a simple one-sentence definition
- Use ONE fun analogy or real-world example kids would understand
- Break complex ideas into 2-3 bullet points
- End with an encouraging note or fun fact
- Use emojis sparingly to make it engaging (1-2 max)
- Avoid jargon - explain like they're 10 years old

Format your response like this:
[One-sentence intro]

Key Points:
• [Point 1]
• [Point 2]
• [Point 3 if needed]

Example: [Fun analogy or example]

[Encouraging closing or fun fact]`
    }

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

        return NextResponse.json({ explanation: text })
      } catch (error: unknown) {
        lastError = error as Error
        const err = error as { status?: number }
        if (err.status !== 429) {
          throw error
        }
      }
    }

    throw lastError || new Error('Failed after retries')
  } catch (error) {
    console.error('Explain API Error:', error)

    // Check for rate limit error
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Too Many Requests')) {
      return NextResponse.json(
        {
          error: 'API rate limit reached. The free tier allows limited requests. Please wait a moment and try again.',
          isRateLimit: true
        },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate explanation. Please try again.' },
      { status: 500 }
    )
  }
}
