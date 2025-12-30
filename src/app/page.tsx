'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { LearningMode, MissedQuestion, WeakTopic, StudiedCard } from '@/lib/types'
import { recordExplain, recordQuizResult, recordFlashcardSet, getWeakTopics } from '@/lib/storage'
import ExplainMode from '@/components/ExplainMode'
import QuizMode from '@/components/QuizMode'
import FlashcardMode from '@/components/FlashcardMode'
import ReviewMode from '@/components/ReviewMode'
import NotesMode from '@/components/NotesMode'
import VoiceInput from '@/components/VoiceInput'
import AuthButton from '@/components/AuthButton'
import MultiplayerMode from '@/components/MultiplayerMode'

function HomeContent() {
  const searchParams = useSearchParams()
  const [currentMode, setCurrentMode] = useState<LearningMode | null>(null)
  const [topic, setTopic] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [showReview, setShowReview] = useState(false)
  const [showMultiplayer, setShowMultiplayer] = useState(false)
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([])

  // Check for review URL parameter on mount
  useEffect(() => {
    const topics = getWeakTopics()
    setWeakTopics(topics)

    // Auto-open review mode if ?review=true is in URL and there are weak topics
    if (searchParams.get('review') === 'true' && topics.length > 0) {
      setShowReview(true)
      // Clean up URL without reload
      window.history.replaceState({}, '', '/')
    }
  }, [searchParams])

  useEffect(() => {
    setWeakTopics(getWeakTopics())
  }, [showReview])

  const handleStartMode = (mode: LearningMode) => {
    if (!inputValue.trim()) return
    setTopic(inputValue.trim())
    setCurrentMode(mode)
  }

  const handleExplainComplete = () => {
    recordExplain(topic)
  }

  const handleQuizComplete = (score: number, total: number, missedQuestions: MissedQuestion[]) => {
    recordQuizResult(topic, score, total, missedQuestions)
  }

  const handleFlashcardsComplete = (learned: number, total: number, cards: StudiedCard[]) => {
    recordFlashcardSet(topic, learned, total, cards)
  }

  const handleBack = () => {
    setCurrentMode(null)
    setTopic('')
    setInputValue('')
    // Refresh weak topics when returning
    setWeakTopics(getWeakTopics())
  }

  const handleReviewQuiz = (topicName: string) => {
    setShowReview(false)
    setTopic(topicName)
    setCurrentMode('quiz')
  }

  const handleReviewExplain = (topicName: string) => {
    setShowReview(false)
    setTopic(topicName)
    setCurrentMode('explain')
  }

  // Review mode overlay
  if (showReview) {
    return (
      <ReviewMode
        weakTopics={weakTopics}
        onStartQuiz={handleReviewQuiz}
        onStartExplain={handleReviewExplain}
        onClose={() => {
          setShowReview(false)
          setWeakTopics(getWeakTopics())
        }}
      />
    )
  }

  // Render active mode
  if (currentMode === 'explain') {
    return (
      <ExplainMode
        topic={topic}
        onComplete={handleExplainComplete}
        onBack={handleBack}
      />
    )
  }

  if (currentMode === 'quiz') {
    return (
      <QuizMode
        topic={topic}
        onComplete={handleQuizComplete}
        onClose={handleBack}
      />
    )
  }

  if (currentMode === 'flashcards') {
    return (
      <FlashcardMode
        topic={topic}
        onComplete={handleFlashcardsComplete}
        onClose={handleBack}
      />
    )
  }

  if (currentMode === 'notes') {
    return (
      <NotesMode
        topic={topic}
        onClose={handleBack}
      />
    )
  }

  // Home screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="pt-8 pb-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/icon.png"
              alt="BloomGuide"
              className="w-12 h-12 rounded-2xl shadow-lg shadow-bloom-500/30"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">BloomGuide</h1>
              <p className="text-sm text-gray-500">Learn smarter, not harder</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-600 hover:text-bloom-600 hover:border-bloom-200 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium hidden sm:inline">My Progress</span>
            </a>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              What do you want to learn?
            </h2>
            <p className="text-gray-500">
              Enter any topic and choose how you want to learn it
            </p>
          </div>

          {/* Input */}
          <div className="mb-8">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g., Photosynthesis, Pythagorean theorem, JavaScript loops..."
                  className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-bloom-500 focus:outline-none transition-colors bg-white shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputValue.trim()) {
                      handleStartMode('explain')
                    }
                  }}
                />
                {inputValue && (
                  <button
                    onClick={() => setInputValue('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <VoiceInput onTranscript={(text) => setInputValue(text)} />
            </div>
          </div>

          {/* Mode Cards */}
          <div className="grid gap-4">
            {/* Explain Mode */}
            <button
              onClick={() => handleStartMode('explain')}
              disabled={!inputValue.trim()}
              className={`group p-6 rounded-2xl border-2 text-left transition-all ${
                inputValue.trim()
                  ? 'border-blue-200 bg-blue-50 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10'
                  : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  inputValue.trim() ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-semibold mb-1 ${inputValue.trim() ? 'text-blue-900' : 'text-gray-500'}`}>
                    Explain It
                  </h3>
                  <p className="text-gray-500">
                    Get a clear, simple explanation with examples. Perfect for understanding new concepts.
                  </p>
                </div>
                <svg className={`w-6 h-6 mt-1 transition-transform group-hover:translate-x-1 ${
                  inputValue.trim() ? 'text-blue-400' : 'text-gray-300'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Quiz Mode */}
            <button
              onClick={() => handleStartMode('quiz')}
              disabled={!inputValue.trim()}
              className={`group p-6 rounded-2xl border-2 text-left transition-all ${
                inputValue.trim()
                  ? 'border-purple-200 bg-purple-50 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10'
                  : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  inputValue.trim() ? 'bg-purple-500' : 'bg-gray-300'
                }`}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-semibold mb-1 ${inputValue.trim() ? 'text-purple-900' : 'text-gray-500'}`}>
                    Take a Quiz
                  </h3>
                  <p className="text-gray-500">
                    Test your knowledge with 5 multiple choice questions. Earn a badge if you pass!
                  </p>
                </div>
                <svg className={`w-6 h-6 mt-1 transition-transform group-hover:translate-x-1 ${
                  inputValue.trim() ? 'text-purple-400' : 'text-gray-300'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Flashcards Mode */}
            <button
              onClick={() => handleStartMode('flashcards')}
              disabled={!inputValue.trim()}
              className={`group p-6 rounded-2xl border-2 text-left transition-all ${
                inputValue.trim()
                  ? 'border-amber-200 bg-amber-50 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10'
                  : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  inputValue.trim() ? 'bg-amber-500' : 'bg-gray-300'
                }`}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-semibold mb-1 ${inputValue.trim() ? 'text-amber-900' : 'text-gray-500'}`}>
                    Flashcards
                  </h3>
                  <p className="text-gray-500">
                    Study with interactive flashcards. Flip to reveal answers and track what you've learned.
                  </p>
                </div>
                <svg className={`w-6 h-6 mt-1 transition-transform group-hover:translate-x-1 ${
                  inputValue.trim() ? 'text-amber-400' : 'text-gray-300'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Notes Mode */}
            <button
              onClick={() => handleStartMode('notes')}
              disabled={!inputValue.trim()}
              className={`group p-6 rounded-2xl border-2 text-left transition-all ${
                inputValue.trim()
                  ? 'border-teal-200 bg-teal-50 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/10'
                  : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  inputValue.trim() ? 'bg-teal-500' : 'bg-gray-300'
                }`}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-semibold mb-1 ${inputValue.trim() ? 'text-teal-900' : 'text-gray-500'}`}>
                    Generate Notes
                  </h3>
                  <p className="text-gray-500">
                    Get comprehensive study notes with key concepts. Download as PDF for revision.
                  </p>
                </div>
                <svg className={`w-6 h-6 mt-1 transition-transform group-hover:translate-x-1 ${
                  inputValue.trim() ? 'text-teal-400' : 'text-gray-300'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          {/* Multiplayer Mode Button */}
          <div className="mt-6">
            <button
              onClick={() => setShowMultiplayer(true)}
              className="w-full p-4 rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 hover:border-indigo-400 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Multiplayer Quiz</p>
                  <p className="text-sm text-gray-500">Compete with friends in real-time!</p>
                </div>
                <svg className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          {/* Quick topics */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400 mb-3">Try these topics:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Photosynthesis', 'Fractions', 'Solar System', 'World War 2', 'Python basics'].map((t) => (
                <button
                  key={t}
                  onClick={() => setInputValue(t)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-bloom-300 hover:text-bloom-600 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Review Weak Topics Button */}
          {weakTopics.length > 0 && (
            <div className="mt-8">
              <button
                onClick={() => setShowReview(true)}
                className="w-full p-4 rounded-2xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50 hover:border-red-400 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Review Weak Topics</p>
                    <p className="text-sm text-gray-500">
                      You have {weakTopics.length} topic{weakTopics.length !== 1 ? 's' : ''} to practice
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400">
        Built for CodeSpring Hackathon 2025
      </footer>

      {/* Multiplayer Modal */}
      {showMultiplayer && (
        <MultiplayerMode onClose={() => setShowMultiplayer(false)} />
      )}
    </div>
  )
}

// Wrap with Suspense for useSearchParams
export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-green-50 to-white" />}>
      <HomeContent />
    </Suspense>
  )
}
