'use client'

import { useState, useEffect, useRef } from 'react'
import { Flashcard, StudiedCard } from '@/lib/types'
import MathText from './MathText'

interface FlashcardModeProps {
  topic: string
  onComplete: (learned: number, total: number, cards: StudiedCard[]) => void
  onClose: () => void
}

export default function FlashcardMode({ topic, onComplete, onClose }: FlashcardModeProps) {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [round, setRound] = useState(1)
  const [totalLearned, setTotalLearned] = useState(0)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchFlashcards()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchFlashcards = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate flashcards')
      }

      const formattedCards: Flashcard[] = data.cards.map((c: { front: string; back: string }, i: number) => ({
        id: `card-${i}`,
        front: c.front,
        back: c.back,
        learned: false,
      }))

      setCards(formattedCards)
      setStudyQueue(formattedCards)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flashcards')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleMarkLearned = (learned: boolean) => {
    const currentCard = studyQueue[currentIndex]

    // Update the master cards array
    const newCards = cards.map(c =>
      c.id === currentCard.id ? { ...c, learned: learned || c.learned } : c
    )
    setCards(newCards)

    if (learned) {
      setTotalLearned(prev => prev + 1)
    }

    // Check if this was the last card in current queue
    if (currentIndex >= studyQueue.length - 1) {
      // Get cards that still need learning (from this round)
      const stillLearning = studyQueue.filter((card, idx) => {
        if (idx === currentIndex) return !learned // Current card
        return !newCards.find(c => c.id === card.id)?.learned
      })

      // Also check for any unmarked cards from master that weren't learned
      const needsReview = newCards.filter(c => !c.learned)

      if (needsReview.length > 0 && round < 3) {
        // Start another round with cards that need review
        setRound(prev => prev + 1)
        setStudyQueue(needsReview)
        setCurrentIndex(0)
        setIsFlipped(false)
      } else {
        // Complete - either all learned or max rounds reached
        const finalLearned = newCards.filter(c => c.learned).length
        setIsComplete(true)
        // Pass card data for history
        const studiedCards: StudiedCard[] = newCards.map(c => ({
          front: c.front,
          back: c.back,
          learned: c.learned
        }))
        onComplete(finalLearned, cards.length, studiedCards)
      }
    } else {
      // Move to next card
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handleShuffle = () => {
    const shuffled = [...studyQueue].sort(() => Math.random() - 0.5)
    setStudyQueue(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < studyQueue.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handleStudyAgain = () => {
    // Reset and study cards that weren't learned
    const needsReview = cards.filter(c => !c.learned)
    if (needsReview.length > 0) {
      setStudyQueue(needsReview)
    } else {
      setStudyQueue(cards.map(c => ({ ...c, learned: false })))
      setCards(cards.map(c => ({ ...c, learned: false })))
    }
    setCurrentIndex(0)
    setIsFlipped(false)
    setIsComplete(false)
    setRound(1)
    setTotalLearned(0)
  }

  const learnedCount = cards.filter(c => c.learned).length
  const currentCard = studyQueue[currentIndex]

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Creating Flashcards...</h3>
          <p className="text-gray-500 text-sm mt-2">Generating cards for {topic}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Failed to Load</h3>
          <p className="text-gray-500 text-sm mt-2">{error}</p>
          <div className="flex gap-3 justify-center mt-6">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
              Cancel
            </button>
            <button
              onClick={() => {
                hasFetched.current = false
                fetchFlashcards()
              }}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Completion screen
  if (isComplete) {
    const percentage = Math.round((learnedCount / cards.length) * 100)
    const allLearned = learnedCount === cards.length

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center">
          {/* Celebration animation */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            allLearned ? 'bg-green-100' : 'bg-amber-100'
          }`}>
            {allLearned ? (
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {allLearned ? 'Amazing Work!' : 'Good Progress!'}
          </h2>

          {/* Stats */}
          <div className="flex justify-center gap-6 my-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-500">{learnedCount}</p>
              <p className="text-sm text-gray-500">Learned</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-amber-500">{cards.length - learnedCount}</p>
              <p className="text-sm text-gray-500">Need Review</p>
            </div>
          </div>

          {/* Progress ring */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke={allLearned ? '#22c55e' : '#f59e0b'}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(percentage / 100) * 352} 352`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
            </div>
          </div>

          <p className="text-gray-500 mb-6">
            {allLearned
              ? 'You\'ve mastered all the flashcards!'
              : `${cards.length - learnedCount} card${cards.length - learnedCount !== 1 ? 's' : ''} still need practice.`}
          </p>

          {/* Mastery badge */}
          {allLearned && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Flashcard Master!
            </div>
          )}

          <div className="flex gap-3">
            {!allLearned && (
              <button
                onClick={handleStudyAgain}
                className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-medium"
              >
                Review Again
              </button>
            )}
            <button
              onClick={onClose}
              className={`${allLearned ? 'w-full' : 'flex-1'} px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-medium`}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-500">
          <div className="text-white">
            <p className="font-medium">Flashcards: {topic}</p>
            <p className="text-xs opacity-90">
              Card {currentIndex + 1} of {studyQueue.length}
              {round > 1 && ` • Round ${round}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffle}
              className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
              title="Shuffle cards"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / studyQueue.length) * 100}%` }}
          />
        </div>

        {/* Stats bar */}
        <div className="px-6 py-2 bg-gray-50 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-gray-600">{learnedCount} learned</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-gray-600">{cards.length - learnedCount} remaining</span>
          </div>
        </div>

        {/* Card */}
        <div className="p-6">
          <div
            onClick={handleFlip}
            className="relative h-64 cursor-pointer"
          >
            <div
              className="absolute inset-0 transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 flex flex-col items-center justify-center text-white shadow-lg overflow-auto"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <p className="text-xs uppercase tracking-wide opacity-70 mb-4">Question</p>
                <div className="text-xl font-medium text-center leading-relaxed">
                  <MathText>{currentCard?.front || ''}</MathText>
                </div>
                <div className="absolute bottom-4 flex items-center gap-1 text-xs opacity-70">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  Tap to flip
                </div>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 flex flex-col items-center justify-center text-white shadow-lg overflow-auto"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <p className="text-xs uppercase tracking-wide opacity-70 mb-4">Answer</p>
                <div className="text-lg font-medium text-center leading-relaxed">
                  <MathText>{currentCard?.back || ''}</MathText>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100">
          {isFlipped ? (
            <div className="space-y-3">
              <p className="text-center text-sm text-gray-500 mb-2">How well did you know this?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleMarkLearned(false)}
                  className="flex-1 py-3 bg-amber-100 text-amber-700 rounded-xl font-medium hover:bg-amber-200 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Still Learning
                </button>
                <button
                  onClick={() => handleMarkLearned(true)}
                  className="flex-1 py-3 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Got It!
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <p className="text-sm text-gray-500">
                Tap card to reveal answer
              </p>
              <button
                onClick={handleNext}
                disabled={currentIndex === studyQueue.length - 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
