import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { joinRoom, getRoom } from '@/lib/multiplayer'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to join a multiplayer game' },
        { status: 401 }
      )
    }

    const { roomId } = await request.json()

    if (!roomId || typeof roomId !== 'string') {
      return NextResponse.json(
        { error: 'Room code is required' },
        { status: 400 }
      )
    }

    const room = joinRoom(
      roomId,
      session.user.id || session.user.email || 'anonymous',
      session.user.name || 'Player',
      session.user.image || undefined
    )

    if (!room) {
      // Check if room exists
      const existingRoom = getRoom(roomId)
      if (!existingRoom) {
        return NextResponse.json(
          { error: 'Room not found. Check the code and try again.' },
          { status: 404 }
        )
      }
      if (existingRoom.status !== 'waiting') {
        return NextResponse.json(
          { error: 'Game has already started' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Room is full' },
        { status: 400 }
      )
    }

    return NextResponse.json({ room })
  } catch (error) {
    console.error('Join room error:', error)
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    )
  }
}
