import { NextRequest, NextResponse } from 'next/server'
import { generateResponse } from '@/lib/gemini'
import { LearningMode, Message } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { input, mode, history } = await request.json()

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

    const conversationHistory: Message[] = Array.isArray(history) ? history : []
    const response = await generateResponse(input, mode as LearningMode, conversationHistory)

    return NextResponse.json({ response })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    )
  }
}
