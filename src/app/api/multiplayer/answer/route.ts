import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { submitAnswer } from '@/lib/multiplayer'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in' },
        { status: 401 }
      )
    }

    const { roomId, questionIndex, answerIndex } = await request.json()

    if (!roomId || questionIndex === undefined || answerIndex === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const userId = session.user.id || session.user.email || 'anonymous'
    const result = submitAnswer(roomId, userId, questionIndex, answerIndex)

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to submit answer' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      correct: result.correct,
      room: result.room
    })
  } catch (error) {
    console.error('Submit answer error:', error)
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    )
  }
}
