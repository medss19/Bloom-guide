'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { GameRoom } from '@/lib/multiplayer'

interface MultiplayerLobbyProps {
  room: GameRoom
  onGameStart: (room: GameRoom) => void
  onClose: () => void
}

export default function MultiplayerLobby({ room: initialRoom, onGameStart, onClose }: MultiplayerLobbyProps) {
  const { data: session } = useSession()
  const [room, setRoom] = useState<GameRoom>(initialRoom)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const userId = session?.user?.id || session?.user?.email || 'anonymous'
  const isHost = room.hostId === userId

  // Poll for room updates
  const pollRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/multiplayer/room?roomId=${room.id}`)
      if (res.ok) {
        const data = await res.json()
        setRoom(data.room)

        // Check if game started
        if (data.room.status === 'playing') {
          onGameStart(data.room)
        }
      }
    } catch (err) {
      console.error('Polling error:', err)
    }
  }, [room.id, onGameStart])

  useEffect(() => {
    const interval = setInterval(pollRoom, 2000)
    return () => clearInterval(interval)
  }, [pollRoom])

  const handleStartGame = async () => {
    if (!isHost) return
    if (room.players.length < 2) {
      setError('Need at least 2 players to start')
      return
    }

    setIsStarting(true)
    setError(null)

    try {
      const res = await fetch('/api/multiplayer/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start game')
      }

      onGameStart(data.room)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game')
      setIsStarting(false)
    }
  }

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(room.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Multiplayer Quiz</p>
              <h2 className="text-xl font-bold">{room.topic}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Room Code */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Share this code with friends:</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-center">
                <span className="text-2xl font-mono font-bold tracking-widest text-gray-900">
                  {room.id}
                </span>
              </div>
              <button
                onClick={copyRoomCode}
                className="p-3 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition-colors"
              >
                {copied ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Players */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">
              Players ({room.players.length}/8)
            </p>
            <div className="space-y-2">
              {room.players.map((player, idx) => {
                const initials = player.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                return (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    {player.image ? (
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                        player.id === room.hostId ? 'bg-yellow-500' : 'bg-indigo-500'
                      }`}>
                        {initials || player.name[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{player.name}</p>
                      {player.id === room.hostId && (
                        <p className="text-xs text-yellow-600">Host</p>
                      )}
                    </div>
                    {player.id === userId && (
                      <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Waiting Message */}
          {room.players.length < 2 && (
            <div className="mb-4 p-3 bg-amber-50 text-amber-700 rounded-xl text-sm flex items-center gap-2">
              <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Waiting for more players to join...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Leave
            </button>
            {isHost ? (
              <button
                onClick={handleStartGame}
                disabled={isStarting || room.players.length < 2}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isStarting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Starting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start Game
                  </>
                )}
              </button>
            ) : (
              <div className="flex-1 px-4 py-3 bg-gray-100 text-gray-500 rounded-xl text-center font-medium">
                Waiting for host...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
