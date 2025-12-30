'use client'

import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { GameRoom } from '@/lib/multiplayer'
import MultiplayerLobby from './MultiplayerLobby'
import MultiplayerGame from './MultiplayerGame'

interface MultiplayerModeProps {
  onClose: () => void
}

type Screen = 'menu' | 'create' | 'join' | 'lobby' | 'game'

export default function MultiplayerMode({ onClose }: MultiplayerModeProps) {
  const { data: session, status } = useSession()
  const [screen, setScreen] = useState<Screen>('menu')
  const [topic, setTopic] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [room, setRoom] = useState<GameRoom | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Not signed in
  if (status === 'loading') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-8 text-white text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Multiplayer Quiz</h2>
            <p className="text-white/80 mt-2">Compete with friends in real-time!</p>
          </div>

          <div className="p-6">
            <p className="text-gray-600 text-center mb-6">
              Sign in with Google to create or join multiplayer quiz games.
            </p>

            <button
              onClick={() => signIn('google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            <button
              onClick={onClose}
              className="w-full mt-3 px-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Lobby screen
  if (screen === 'lobby' && room) {
    return (
      <MultiplayerLobby
        room={room}
        onGameStart={(updatedRoom) => {
          setRoom(updatedRoom)
          setScreen('game')
        }}
        onClose={onClose}
      />
    )
  }

  // Game screen
  if (screen === 'game' && room) {
    return (
      <MultiplayerGame
        room={room}
        onComplete={onClose}
      />
    )
  }

  const handleCreateRoom = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/multiplayer/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create room')
      }

      setRoom(data.room)
      setScreen('lobby')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError('Please enter a room code')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/multiplayer/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomCode.trim().toUpperCase() })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to join room')
      }

      setRoom(data.room)
      setScreen('lobby')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room')
    } finally {
      setIsLoading(false)
    }
  }

  // Create room screen
  if (screen === 'create') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setScreen('menu')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-bold">Create a Room</h2>
            </div>
          </div>

          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., World Capitals, Math, Science..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
            />

            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}

            <button
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Room'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Join room screen
  if (screen === 'join') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setScreen('menu')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-bold">Join a Room</h2>
            </div>
          </div>

          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors text-center text-2xl font-mono tracking-widest uppercase"
              maxLength={6}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
            />

            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}

            <button
              onClick={handleJoinRoom}
              disabled={isLoading || roomCode.length !== 6}
              className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Joining...
                </>
              ) : (
                'Join Room'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main menu
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-8 text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Multiplayer Quiz</h2>
          <p className="text-white/80 mt-2">Compete with friends in real-time!</p>
        </div>

        <div className="p-6 space-y-3">
          <button
            onClick={() => setScreen('create')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50 hover:border-indigo-400 transition-all text-left"
          >
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-indigo-900">Create Room</p>
              <p className="text-sm text-gray-500">Start a new quiz game</p>
            </div>
          </button>

          <button
            onClick={() => setScreen('join')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-purple-200 bg-purple-50 hover:border-purple-400 transition-all text-left"
          >
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-purple-900">Join Room</p>
              <p className="text-sm text-gray-500">Enter a room code</p>
            </div>
          </button>

          <button
            onClick={onClose}
            className="w-full px-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
