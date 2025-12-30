import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createRoom } from '@/lib/multiplayer'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to create a multiplayer game' },
        { status: 401 }
      )
    }

    const { topic } = await request.json()

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    const room = createRoom(
      session.user.id || session.user.email || 'anonymous',
      session.user.name || 'Player',
      topic
    )

    return NextResponse.json({
      roomId: room.id,
      room
    })
  } catch (error) {
    console.error('Create room error:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}
