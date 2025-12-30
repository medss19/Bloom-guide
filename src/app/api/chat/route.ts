import { NextRequest, NextResponse } from 'next/server'
import { generateResponse } from '@/lib/gemini'
import { LearningMode } from '@/lib/prompts'

export async function POST(request: NextRequest) {
  try {
    const { input, mode } = await request.json()

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      )
    }

    if (!mode || !['explain', 'hint', 'challenge'].includes(mode)) {
      return NextResponse.json(
        { error: 'Valid mode is required (explain, hint, or challenge)' },
        { status: 400 }
      )
    }

    const response = await generateResponse(input, mode as LearningMode)

    return NextResponse.json({ response })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    )
  }
}
