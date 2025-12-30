import { NextRequest, NextResponse } from 'next/server'
import { getApiKeyFromRequest, createGeminiClient } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json()

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    const apiKey = getApiKeyFromRequest(request)
    const genAI = createGeminiClient(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `Generate exactly 6 flashcards for studying: "${topic}"

Return ONLY valid JSON in this exact format, no other text:
{
  "cards": [
    {
      "front": "Question or term",
      "back": "Answer or definition"
    }
  ]
}

Rules:
- Exactly 6 flashcards
- Front: A question, term, or concept to test knowledge
- Back: The answer, definition, or explanation (1-2 sentences max)
- Cover key concepts of the topic
- Progress from basic to advanced
- For programming topics: Include actual code using \`inline code\` or code blocks in both front and back where relevant
- For math topics: Include formulas using $math$ notation
- Make cards specific and educational, not vague`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse flashcard response')
    }

    const flashcardData = JSON.parse(jsonMatch[0])

    // Validate structure
    if (!flashcardData.cards || !Array.isArray(flashcardData.cards)) {
      throw new Error('Invalid flashcard format')
    }

    return NextResponse.json(flashcardData)
  } catch (error) {
    console.error('Flashcard API Error:', error)

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
      { error: 'Failed to generate flashcards. Please try again.' },
      { status: 500 }
    )
  }
}
