'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { UserStats, QuizResult, FlashcardSet, WeakTopic, MultiplayerResult } from '@/lib/types'
import { getStats, getQuizResults, getFlashcardSets, getWeakTopics, getMultiplayerResults, setCurrentUser } from '@/lib/storage'
import { resetAllData } from '@/lib/resetData'
import FormattedText from '@/components/FormattedText'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([])
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([])
  const [multiplayerResults, setMultiplayerResults] = useState<MultiplayerResult[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<QuizResult | null>(null)
  const [selectedFlashcardSet, setSelectedFlashcardSet] = useState<FlashcardSet | null>(null)
  const [selectedMultiplayer, setSelectedMultiplayer] = useState<MultiplayerResult | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleResetData = () => {
    resetAllData()
    setStats(null)
    setQuizResults([])
    setFlashcardSets([])
    setWeakTopics([])
    setMultiplayerResults([])
    setShowResetConfirm(false)
  }

  useEffect(() => {
    // Wait for session to load before reading data
    if (status === 'loading') return

    // Set user context for storage keys
    if (session?.user) {
      const userId = session.user.id || session.user.email || null
      setCurrentUser(userId)
    } else {
      setCurrentUser(null)
    }

    const loadData = () => {
      setStats(getStats())
      setQuizResults(getQuizResults())
      setFlashcardSets(getFlashcardSets())
      setWeakTopics(getWeakTopics())
      setMultiplayerResults(getMultiplayerResults())
    }

    loadData()

    const handleFocus = () => loadData()
    window.addEventListener('focus', handleFocus)

    return () => window.removeEventListener('focus', handleFocus)
  }, [session, status])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Progress</h1>
                <p className="text-sm text-gray-500">Track your learning journey</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                title="Reset all data"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <Link
                href="/"
                className="px-4 py-2 bg-bloom-500 text-white rounded-xl hover:bg-bloom-600 transition-colors text-sm font-medium shadow-sm"
              >
                Learn Something New
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Streak Banner */}
        {stats && stats.streak > 0 && (
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-5 mb-6 text-white flex items-center gap-4">
            <div className="text-4xl">🔥</div>
            <div>
              <p className="text-2xl font-bold">{stats.streak} Day Streak!</p>
              <p className="text-white/80 text-sm">Keep learning every day to grow your streak</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalExplains || 0}</p>
            <p className="text-sm text-gray-500">Explanations</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalQuizzes || 0}</p>
            <p className="text-sm text-gray-500">Quizzes Taken</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.quizzesPassed || 0}</p>
            <p className="text-sm text-gray-500">Quizzes Passed</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.flashcardsLearned || 0}</p>
            <p className="text-sm text-gray-500">Cards Learned</p>
          </div>
        </div>

        {/* Multiplayer Stats */}
        {stats && (stats.totalMultiplayerGames || 0) > 0 && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 mb-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">Multiplayer Games</h3>
                <p className="text-white/80 text-sm">Compete with friends</p>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{stats.totalMultiplayerGames || 0}</p>
                  <p className="text-xs text-white/80">Games</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{stats.multiplayerWins || 0}</p>
                  <p className="text-xs text-white/80">Wins</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Average Quiz Score */}
        {stats && stats.totalQuizzes > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiz Performance</h2>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke={stats.avgQuizScore >= 60 ? '#22c55e' : '#f59e0b'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(stats.avgQuizScore / 100) * 251} 251`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{stats.avgQuizScore}%</span>
                </div>
              </div>
              <div>
                <p className="text-gray-600">Average Score</p>
                <p className="text-sm text-gray-400 mt-1">
                  {stats.quizzesPassed} of {stats.totalQuizzes} quizzes passed
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Quizzes */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">📝</span>
              Recent Quizzes
            </h2>
            {quizResults.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No quizzes taken yet</p>
            ) : (
              <div className="space-y-3">
                {quizResults.slice(0, 5).map((result) => (
                  <button
                    key={result.id}
                    onClick={() => setSelectedQuiz(result)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        result.passed ? 'bg-green-100' : 'bg-amber-100'
                      }`}>
                        {result.passed ? (
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{result.topic}</p>
                        <p className="text-xs text-gray-400">{formatDate(result.completedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className={`font-bold ${result.passed ? 'text-green-600' : 'text-amber-600'}`}>
                          {result.score}/{result.total}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recent Flashcards */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-amber-500">🎴</span>
              Recent Flashcard Sets
            </h2>
            {flashcardSets.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No flashcards studied yet</p>
            ) : (
              <div className="space-y-3">
                {flashcardSets.slice(0, 5).map((set) => (
                  <button
                    key={set.id}
                    onClick={() => setSelectedFlashcardSet(set)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{set.topic}</p>
                        <p className="text-xs text-gray-400">{formatDate(set.completedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-bold text-amber-600">
                          {set.cardsLearned}/{set.totalCards}
                        </p>
                        <p className="text-xs text-gray-400">learned</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Multiplayer Games */}
        {multiplayerResults.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-indigo-500">🎮</span>
              Recent Multiplayer Games
            </h2>
            <div className="space-y-3">
              {multiplayerResults.slice(0, 5).map((result) => (
                <button
                  key={result.id}
                  onClick={() => setSelectedMultiplayer(result)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      result.won ? 'bg-yellow-100' : 'bg-indigo-100'
                    }`}>
                      {result.won ? (
                        <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ) : (
                        <span className="text-sm font-bold text-indigo-600">#{result.rank}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{result.topic}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(result.completedAt)} • {result.totalPlayers} players
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className={`font-bold ${result.won ? 'text-yellow-600' : 'text-indigo-600'}`}>
                        {result.score}/{result.total}
                      </p>
                      <p className="text-xs text-gray-400">
                        {result.won ? 'Winner!' : `Rank #${result.rank}`}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Weak Topics - Need to Review */}
        {weakTopics.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span>🎯</span>
                Topics to Review
              </h2>
              <Link
                href="/?review=true"
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Practice Now →
              </Link>
            </div>
            <div className="space-y-3">
              {weakTopics.slice(0, 3).map((wt) => (
                <div
                  key={wt.topic}
                  className="bg-white rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{wt.topic}</p>
                      <p className="text-xs text-gray-500">
                        {wt.missedCount} question{wt.missedCount !== 1 ? 's' : ''} missed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                      Needs practice
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {weakTopics.length > 3 && (
              <p className="text-sm text-gray-500 text-center mt-3">
                +{weakTopics.length - 3} more topic{weakTopics.length - 3 !== 1 ? 's' : ''} to review
              </p>
            )}
          </div>
        )}

        {/* Recent Topics */}
        {stats && stats.recentTopics.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Topics</h2>
            <div className="flex flex-wrap gap-2">
              {stats.recentTopics.map((topic, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!stats || (stats.totalExplains === 0 && stats.totalQuizzes === 0 && stats.totalFlashcards === 0)) && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Learning Journey!</h3>
            <p className="text-gray-500 mb-6">Choose a topic and start learning to see your progress here.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-bloom-500 text-white rounded-xl hover:bg-bloom-600 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Start Learning
            </Link>
          </div>
        )}
      </main>

      {/* Quiz Detail Modal */}
      {selectedQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className={`px-6 py-5 border-b border-gray-100 ${
              selectedQuiz.passed
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-amber-500 to-orange-500'
            }`}>
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h2 className="text-xl font-bold">{selectedQuiz.topic}</h2>
                  <p className="text-sm opacity-90">
                    {formatDate(selectedQuiz.completedAt)} • {selectedQuiz.passed ? 'Passed' : 'Not Passed'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="p-2 text-white/80 hover:text-white rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Score Summary */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className={`text-3xl font-bold ${selectedQuiz.passed ? 'text-green-600' : 'text-amber-600'}`}>
                    {selectedQuiz.score}/{selectedQuiz.total}
                  </p>
                  <p className="text-sm text-gray-500">Score</p>
                </div>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${selectedQuiz.passed ? 'text-green-600' : 'text-amber-600'}`}>
                    {Math.round((selectedQuiz.score / selectedQuiz.total) * 100)}%
                  </p>
                  <p className="text-sm text-gray-500">Percentage</p>
                </div>
              </div>
            </div>

            {/* Missed Questions */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedQuiz.missedQuestions && selectedQuiz.missedQuestions.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Questions You Missed ({selectedQuiz.missedQuestions.length})
                  </h3>
                  {selectedQuiz.missedQuestions.map((q, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4">
                      <div className="font-medium text-gray-900 mb-3">
                        <FormattedText text={q.question} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                          <p className="text-xs text-red-400 uppercase tracking-wide mb-1">Your Answer</p>
                          <div className="text-red-700 text-sm">
                            <FormattedText text={q.userAnswer} />
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                          <p className="text-xs text-green-400 uppercase tracking-wide mb-1">Correct</p>
                          <div className="text-green-700 text-sm">
                            <FormattedText text={q.correctAnswer} />
                          </div>
                        </div>
                      </div>
                      {q.explanation && (
                        <div className="mt-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
                          <p className="text-xs text-blue-400 uppercase tracking-wide mb-1">Why?</p>
                          <div className="text-blue-800 text-sm">
                            <FormattedText text={q.explanation} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Perfect Score!</h3>
                  <p className="text-gray-500 text-sm">You answered all questions correctly.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white">
              <button
                onClick={() => setSelectedQuiz(null)}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flashcard Set Detail Modal */}
      {selectedFlashcardSet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-amber-500 to-orange-500">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h2 className="text-xl font-bold">{selectedFlashcardSet.topic}</h2>
                  <p className="text-sm opacity-90">
                    {formatDate(selectedFlashcardSet.completedAt)} • {selectedFlashcardSet.cardsLearned}/{selectedFlashcardSet.totalCards} learned
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFlashcardSet(null)}
                  className="p-2 text-white/80 hover:text-white rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{selectedFlashcardSet.cardsLearned}</p>
                  <p className="text-sm text-gray-500">Learned</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-600">
                    {selectedFlashcardSet.totalCards - selectedFlashcardSet.cardsLearned}
                  </p>
                  <p className="text-sm text-gray-500">Need Review</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-600">
                    {Math.round((selectedFlashcardSet.cardsLearned / selectedFlashcardSet.totalCards) * 100)}%
                  </p>
                  <p className="text-sm text-gray-500">Mastery</p>
                </div>
              </div>
            </div>

            {/* Cards List */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedFlashcardSet.cards && selectedFlashcardSet.cards.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 mb-3">All Cards ({selectedFlashcardSet.cards.length})</h3>
                  {selectedFlashcardSet.cards.map((card, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl p-4 border ${
                        card.learned
                          ? 'bg-green-50 border-green-100'
                          : 'bg-amber-50 border-amber-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          card.learned ? 'bg-green-500' : 'bg-amber-500'
                        }`}>
                          {card.learned ? (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">
                            <FormattedText text={card.front} />
                          </div>
                          <div className={`text-sm mt-1 ${card.learned ? 'text-green-700' : 'text-amber-700'}`}>
                            <FormattedText text={card.back} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Card Details Not Available</h3>
                  <p className="text-gray-500 text-sm">This flashcard set was studied before detailed tracking was added.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white">
              <button
                onClick={() => setSelectedFlashcardSet(null)}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multiplayer Detail Modal */}
      {selectedMultiplayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className={`px-6 py-5 border-b border-gray-100 ${
              selectedMultiplayer.won
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
            }`}>
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h2 className="text-xl font-bold">{selectedMultiplayer.topic}</h2>
                  <p className="text-sm opacity-90">
                    {formatDate(selectedMultiplayer.completedAt)} • {selectedMultiplayer.totalPlayers} players
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMultiplayer(null)}
                  className="p-2 text-white/80 hover:text-white rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Result Summary */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className={`text-3xl font-bold ${selectedMultiplayer.won ? 'text-yellow-600' : 'text-indigo-600'}`}>
                    #{selectedMultiplayer.rank}
                  </p>
                  <p className="text-sm text-gray-500">Rank</p>
                </div>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${selectedMultiplayer.won ? 'text-yellow-600' : 'text-indigo-600'}`}>
                    {selectedMultiplayer.score}/{selectedMultiplayer.total}
                  </p>
                  <p className="text-sm text-gray-500">Score</p>
                </div>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${selectedMultiplayer.won ? 'text-yellow-600' : 'text-indigo-600'}`}>
                    {Math.round((selectedMultiplayer.score / selectedMultiplayer.total) * 100)}%
                  </p>
                  <p className="text-sm text-gray-500">Accuracy</p>
                </div>
              </div>
            </div>

            {/* Leaderboard & Missed Questions */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Final Standings */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Final Standings
                </h3>
                <div className="space-y-2">
                  {selectedMultiplayer.players
                    .sort((a, b) => b.score - a.score)
                    .map((player, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-xl ${
                          idx === 0 ? 'bg-yellow-50 border border-yellow-200' :
                          player.isYou ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          idx === 0 ? 'bg-yellow-500 text-white' :
                          idx === 1 ? 'bg-gray-400 text-white' :
                          idx === 2 ? 'bg-orange-400 text-white' : 'bg-gray-300 text-gray-600'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {player.name}
                            {player.isYou && (
                              <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full ml-2">
                                You
                              </span>
                            )}
                          </p>
                        </div>
                        <p className="font-bold text-gray-900">{player.score}/{selectedMultiplayer.total}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Missed Questions */}
              {selectedMultiplayer.missedQuestions && selectedMultiplayer.missedQuestions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Questions You Missed ({selectedMultiplayer.missedQuestions.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedMultiplayer.missedQuestions.map((q, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4">
                        <div className="font-medium text-gray-900 mb-3">
                          <FormattedText text={q.question} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                            <p className="text-xs text-red-400 uppercase tracking-wide mb-1">Your Answer</p>
                            <div className="text-red-700 text-sm">
                              <FormattedText text={q.userAnswer} />
                            </div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                            <p className="text-xs text-green-400 uppercase tracking-wide mb-1">Correct</p>
                            <div className="text-green-700 text-sm">
                              <FormattedText text={q.correctAnswer} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white">
              <button
                onClick={() => setSelectedMultiplayer(null)}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reset All Data?</h3>
            <p className="text-gray-500 text-sm mb-6">
              This will permanently delete all your progress, quiz history, flashcard sets, and statistics. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
