'use client'

import { useState } from 'react'
import { WeakTopic } from '@/lib/types'
import { removeWeakTopic } from '@/lib/storage'
import MathText from './MathText'
import { apiPost } from '@/lib/api'

interface ReviewModeProps {
  weakTopics: WeakTopic[]
  onStartQuiz: (topic: string) => void
  onStartExplain: (topic: string) => void
  onClose: () => void
}

export default function ReviewMode({ weakTopics, onStartQuiz, onStartExplain, onClose }: ReviewModeProps) {
  const [selectedTopic, setSelectedTopic] = useState<WeakTopic | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [deepDiveExplanation, setDeepDiveExplanation] = useState<string | null>(null)
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false)

  const handleLearnMore = async (question: string, correctAnswer: string, userAnswer: string, topic: string) => {
    setIsLoadingExplanation(true)
    setDeepDiveExplanation(null)

    try {
      const res = await apiPost('/api/explain', {
        topic: topic,
        followUp: `I got this question wrong and need help understanding it:

Question: ${question}
My wrong answer: ${userAnswer}
Correct answer: ${correctAnswer}

Please explain:
1. Why is "${correctAnswer}" the correct answer?
2. Why was my answer "${userAnswer}" incorrect?
3. Help me understand this concept better so I don't make the same mistake again.`,
        history: []
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get explanation')
      }

      setDeepDiveExplanation(data.explanation)
    } catch (err) {
      setDeepDiveExplanation('Sorry, could not load explanation. Please try again.')
    } finally {
      setIsLoadingExplanation(false)
    }
  }

  const handleCloseDeepDive = () => {
    setDeepDiveExplanation(null)
  }

  const handleMarkMastered = (topic: string) => {
    removeWeakTopic(topic)
    setSelectedTopic(null)
    // Trigger refresh by closing
    onClose()
  }

  if (selectedTopic) {
    const currentQuestion = selectedTopic.sampleQuestions[currentCardIndex]

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-red-500 to-orange-500">
            <div className="text-white">
              <p className="text-sm font-medium opacity-90">Review: {selectedTopic.topic}</p>
              <p className="text-xs opacity-75">Question {currentCardIndex + 1} of {selectedTopic.sampleQuestions.length}</p>
            </div>
            <button
              onClick={() => setSelectedTopic(null)}
              className="p-2 text-white/80 hover:text-white rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Card */}
          <div className="p-6">
            <div className="bg-gray-50 rounded-xl p-5 mb-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Question you missed:</p>
              <div className="text-gray-900 font-medium">
                <MathText>{currentQuestion.question}</MathText>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <p className="text-xs text-red-400 uppercase tracking-wide mb-1">Your answer</p>
                <div className="text-red-700 text-sm">
                  <MathText>{currentQuestion.userAnswer}</MathText>
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <p className="text-xs text-green-400 uppercase tracking-wide mb-1">Correct answer</p>
                <div className="text-green-700 text-sm">
                  <MathText>{currentQuestion.correctAnswer}</MathText>
                </div>
              </div>
            </div>

            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Show Explanation
              </button>
            ) : (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs text-blue-400 uppercase tracking-wide mb-1">Why?</p>
                <div className="text-blue-800 text-sm">
                  <MathText>{currentQuestion.explanation}</MathText>
                </div>
              </div>
            )}

            {/* Deep Dive Explanation */}
            {isLoadingExplanation && (
              <div className="mt-4 bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-center gap-2 text-indigo-600">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Getting detailed explanation...</span>
                </div>
              </div>
            )}

            {deepDiveExplanation && !isLoadingExplanation && (
              <div className="mt-4 bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-indigo-500 uppercase tracking-wide font-medium">Detailed Explanation</p>
                  <button
                    onClick={handleCloseDeepDive}
                    className="text-indigo-400 hover:text-indigo-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="text-indigo-900 text-sm">
                  <MathText>{deepDiveExplanation}</MathText>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => {
                if (currentCardIndex > 0) {
                  setCurrentCardIndex(currentCardIndex - 1)
                  setShowAnswer(false)
                  setDeepDiveExplanation(null)
                }
              }}
              disabled={currentCardIndex === 0}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => handleLearnMore(
                  currentQuestion.question,
                  currentQuestion.correctAnswer,
                  currentQuestion.userAnswer,
                  selectedTopic.topic
                )}
                disabled={isLoadingExplanation}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 disabled:opacity-50"
              >
                {isLoadingExplanation ? 'Loading...' : 'Learn More'}
              </button>
              <button
                onClick={() => onStartQuiz(selectedTopic.topic)}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200"
              >
                Retake Quiz
              </button>
            </div>

            <button
              onClick={() => {
                if (currentCardIndex < selectedTopic.sampleQuestions.length - 1) {
                  setCurrentCardIndex(currentCardIndex + 1)
                  setShowAnswer(false)
                  setDeepDiveExplanation(null)
                }
              }}
              disabled={currentCardIndex === selectedTopic.sampleQuestions.length - 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-red-500 to-orange-500">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h2 className="text-xl font-bold">Topics to Review</h2>
              <p className="text-sm opacity-90">Practice the topics you need help with</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Topics List */}
        <div className="flex-1 overflow-y-auto p-4">
          {weakTopics.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">All caught up!</h3>
              <p className="text-gray-500 text-sm">You don't have any weak topics. Keep learning!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {weakTopics.map((wt) => (
                <div
                  key={wt.topic}
                  className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{wt.topic}</h3>
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                          {wt.missedCount} missed
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {wt.sampleQuestions.length} question{wt.sampleQuestions.length !== 1 ? 's' : ''} to review
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        setSelectedTopic(wt)
                        setCurrentCardIndex(0)
                        setShowAnswer(false)
                      }}
                      className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      Review Mistakes
                    </button>
                    <button
                      onClick={() => onStartQuiz(wt.topic)}
                      className="flex-1 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600"
                    >
                      Retake Quiz
                    </button>
                    <button
                      onClick={() => handleMarkMastered(wt.topic)}
                      className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                      title="Mark as mastered"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
