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

    const prompt = `Generate exactly 5 multiple choice questions about: "${topic}"

Return ONLY valid JSON in this exact format, no other text:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation why this is correct"
    }
  ]
}

CRITICAL Rules:
- Exactly 5 questions with varying difficulty (easy to hard)
- Exactly 4 options each
- correctIndex is 0-3 (index of correct answer)
- IMPORTANT: If a question references code, a formula, or an example, you MUST include it DIRECTLY in the question text itself using markdown code blocks (\`\`\`code\`\`\`) or inline code (\`code\`). NEVER say "the following code" without showing the actual code in the question.
- For programming topics: Include actual code snippets in the question
- For math topics: Include the actual equation/formula using $math$ notation
- Make questions specific and testable, not vague
- Randomize which option (A/B/C/D) is correct - don't always make A or B correct
- Explanations should clearly explain WHY the answer is correct (1-2 sentences)`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse quiz response')
    }

    const quizData = JSON.parse(jsonMatch[0])

    // Validate structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz format')
    }

    return NextResponse.json(quizData)
  } catch (error) {
    console.error('Quiz API Error:', error)

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
      { error: 'Failed to generate quiz. Please try again.' },
      { status: 500 }
    )
  }
}
