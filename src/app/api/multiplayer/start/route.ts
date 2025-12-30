import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getRoom, startGame, QuizQuestion } from '@/lib/multiplayer'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in' },
        { status: 401 }
      )
    }

    const { roomId } = await request.json()

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }

    const room = getRoom(roomId)
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    const userId = session.user.id || session.user.email || 'anonymous'
    if (room.hostId !== userId) {
      return NextResponse.json(
        { error: 'Only the host can start the game' },
        { status: 403 }
      )
    }

    if (room.players.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 players to start' },
        { status: 400 }
      )
    }

    // Generate quiz questions
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `Generate exactly 5 multiple choice questions about: "${room.topic}"

Return ONLY valid JSON in this exact format, no other text:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0
    }
  ]
}

Rules:
- Exactly 5 questions
- Exactly 4 options each (A, B, C, D)
- correctIndex is 0-3 (index of correct answer)
- Make questions quick to answer (15-30 seconds each)
- Mix difficulty levels`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse quiz response')
    }

    const quizData = JSON.parse(jsonMatch[0])

    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz format')
    }

    const questions: QuizQuestion[] = quizData.questions.map((q: { question: string; options: string[]; correctIndex: number }) => ({
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex
    }))

    const updatedRoom = startGame(roomId, questions)

    if (!updatedRoom) {
      return NextResponse.json(
        { error: 'Failed to start game' },
        { status: 500 }
      )
    }

    return NextResponse.json({ room: updatedRoom })
  } catch (error) {
    console.error('Start game error:', error)
    return NextResponse.json(
      { error: 'Failed to start game' },
      { status: 500 }
    )
  }
}
