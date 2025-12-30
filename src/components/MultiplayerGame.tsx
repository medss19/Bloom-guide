'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { GameRoom } from '@/lib/multiplayer'

interface MultiplayerGameProps {
  room: GameRoom
  onComplete: () => void
}

export default function MultiplayerGame({ room: initialRoom, onComplete }: MultiplayerGameProps) {
  const { data: session } = useSession()
  const [room, setRoom] = useState<GameRoom>(initialRoom)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const userId = session?.user?.id || session?.user?.email || 'anonymous'
  const currentPlayer = room.players.find(p => p.id === userId)
  const question = room.questions[currentQuestion]

  // Poll for room updates
  const pollRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/multiplayer/room?roomId=${room.id}`)
      if (res.ok) {
        const data = await res.json()
        setRoom(data.room)
      }
    } catch (err) {
      console.error('Polling error:', err)
    }
  }, [room.id])

  useEffect(() => {
    const interval = setInterval(pollRoom, 1500)
    return () => clearInterval(interval)
  }, [pollRoom])

  const handleSelectAnswer = async (answerIndex: number) => {
    if (selectedAnswer !== null || isSubmitting) return

    setSelectedAnswer(answerIndex)
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/multiplayer/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          questionIndex: currentQuestion,
          answerIndex
        })
      })

      const data = await res.json()

      if (res.ok) {
        setIsCorrect(data.correct)
        setRoom(data.room)
        setShowResult(true)
      }
    } catch (err) {
      console.error('Submit error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < room.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  // Get sorted players by score
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score)

  // Check if game is finished
  const isGameFinished = room.status === 'finished' ||
    (currentPlayer && currentPlayer.answers.filter(a => a !== undefined).length === room.questions.length)

  if (isGameFinished) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Game Complete!</h2>
            <p className="text-white/80 mt-1">{room.topic}</p>
          </div>

          {/* Leaderboard */}
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
              Final Standings
            </h3>
            <div className="space-y-3">
              {sortedPlayers.map((player, idx) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    idx === 0 ? 'bg-yellow-50 border-2 border-yellow-200' :
                    idx === 1 ? 'bg-gray-100' :
                    idx === 2 ? 'bg-orange-50' : 'bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    idx === 0 ? 'bg-yellow-500 text-white' :
                    idx === 1 ? 'bg-gray-400 text-white' :
                    idx === 2 ? 'bg-orange-400 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {player.name}
                      {player.id === userId && (
                        <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full ml-2">
                          You
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{player.score}</p>
                    <p className="text-xs text-gray-500">/{room.questions.length}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onComplete}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Question {currentQuestion + 1} of {room.questions.length}</p>
              <h2 className="text-lg font-bold">{room.topic}</h2>
            </div>
            <div className="flex items-center gap-4">
              {/* Mini leaderboard */}
              <div className="flex -space-x-2">
                {sortedPlayers.slice(0, 3).map((player, idx) => (
                  <div
                    key={player.id}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white ${
                      idx === 0 ? 'bg-yellow-500 z-30' :
                      idx === 1 ? 'bg-gray-400 z-20' :
                      'bg-orange-400 z-10'
                    }`}
                    title={`${player.name}: ${player.score}`}
                  >
                    {player.score}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / room.questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="text-lg font-semibold text-gray-900 mb-6">
            {question?.question}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question?.options.map((option, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx]
              let optionStyle = 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'

              if (showResult) {
                if (idx === question.correctIndex) {
                  optionStyle = 'border-green-500 bg-green-50'
                } else if (idx === selectedAnswer) {
                  optionStyle = 'border-red-500 bg-red-50'
                }
              } else if (selectedAnswer === idx) {
                optionStyle = 'border-indigo-500 bg-indigo-50'
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  disabled={showResult || isSubmitting}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${optionStyle}`}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                    showResult && idx === question.correctIndex
                      ? 'bg-green-500 text-white'
                      : showResult && idx === selectedAnswer
                        ? 'bg-red-500 text-white'
                        : selectedAnswer === idx
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                  }`}>
                    {letter}
                  </span>
                  <span className="flex-1 text-gray-700">{option}</span>
                </button>
              )
            })}
          </div>

          {/* Result feedback */}
          {showResult && (
            <div className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? '✓ Correct!' : '✗ Wrong answer'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Your score: {currentPlayer?.score || 0}/{currentQuestion + (showResult ? 1 : 0)}
          </div>
          {showResult && currentQuestion < room.questions.length - 1 && (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 font-medium"
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
