'use client'

import { useState, useEffect, useRef } from 'react'
import { QuizQuestion, MissedQuestion } from '@/lib/types'
import MathText from './MathText'
import { apiPost } from '@/lib/api'

interface QuizModeProps {
  topic: string
  onComplete: (score: number, total: number, missedQuestions: MissedQuestion[]) => void
  onClose: () => void
}

export default function QuizMode({ topic, onComplete, onClose }: QuizModeProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quizComplete, setQuizComplete] = useState(false)
  const hasFetched = useRef(false)

  // Fetch quiz on mount (with guard against double-fetch in Strict Mode)
  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchQuiz()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchQuiz = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await apiPost('/api/quiz', { topic })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate quiz')
      }

      const formattedQuestions: QuizQuestion[] = data.questions.map((q: QuizQuestion, i: number) => ({
        ...q,
        id: `q-${i}`,
      }))

      setQuestions(formattedQuestions)
      setAnswers(new Array(formattedQuestions.length).fill(null))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAnswer = (index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    const newAnswers = [...answers]
    newAnswers[currentIndex] = selectedAnswer
    setAnswers(newAnswers)
    setShowResult(true)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      // Quiz complete - calculate final score and collect missed questions
      let finalScore = 0
      const missed: MissedQuestion[] = []

      for (let idx = 0; idx < answers.length; idx++) {
        const q = questions[idx]
        const userAnswerIdx = answers[idx]

        if (userAnswerIdx === q?.correctIndex) {
          finalScore++
        } else if (q && userAnswerIdx !== null) {
          // Collect missed question
          missed.push({
            question: q.question,
            userAnswer: q.options[userAnswerIdx],
            correctAnswer: q.options[q.correctIndex],
            explanation: q.explanation,
            topic: topic
          })
        }
      }

      setQuizComplete(true)
      onComplete(finalScore, questions.length, missed)
    }
  }

  const currentQuestion = questions[currentIndex]
  const isCorrect = selectedAnswer === currentQuestion?.correctIndex
  const score = answers.filter((ans, idx) => ans === questions[idx]?.correctIndex).length

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Generating Quiz...</h3>
          <p className="text-gray-500 text-sm mt-2">Creating questions about {topic}</p>
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
          <h3 className="text-lg font-semibold text-gray-900">Failed to Load Quiz</h3>
          <p className="text-gray-500 text-sm mt-2">{error}</p>
          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={fetchQuiz}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (quizComplete) {
    // Calculate final score from answers array (already saved)
    const finalScore = answers.filter((ans, idx) => ans === questions[idx]?.correctIndex).length
    const passed = finalScore >= Math.ceil(questions.length * 0.6)

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            passed ? 'bg-green-100' : 'bg-amber-100'
          }`}>
            {passed ? (
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {passed ? 'Congratulations!' : 'Keep Learning!'}
          </h2>

          <div className="text-5xl font-bold my-4">
            <span className={passed ? 'text-green-500' : 'text-amber-500'}>{finalScore}</span>
            <span className="text-gray-300">/{questions.length}</span>
          </div>

          <p className="text-gray-500 mb-6">
            {passed
              ? 'You\'ve mastered this topic!'
              : 'Review the material and try again.'}
          </p>

          {passed && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Mastery Badge Earned!
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-medium"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-600 font-medium">Quiz: {topic}</p>
            <p className="text-xs text-gray-400">Question {currentIndex + 1} of {questions.length}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-purple-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="text-lg font-semibold text-gray-900 mb-6">
            <MathText>{currentQuestion?.question || ''}</MathText>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion?.options.map((option, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx]
              let optionStyle = 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'

              if (showResult) {
                if (idx === currentQuestion.correctIndex) {
                  optionStyle = 'border-green-500 bg-green-50'
                } else if (idx === selectedAnswer && idx !== currentQuestion.correctIndex) {
                  optionStyle = 'border-red-500 bg-red-50'
                } else {
                  optionStyle = 'border-gray-200 opacity-50'
                }
              } else if (selectedAnswer === idx) {
                optionStyle = 'border-purple-500 bg-purple-50'
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${optionStyle}`}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                    showResult && idx === currentQuestion.correctIndex
                      ? 'bg-green-500 text-white'
                      : showResult && idx === selectedAnswer
                        ? 'bg-red-500 text-white'
                        : selectedAnswer === idx
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                  }`}>
                    {letter}
                  </span>
                  <span className="flex-1 text-gray-700">
                    <MathText>{option}</MathText>
                  </span>
                  {showResult && idx === currentQuestion.correctIndex && (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {showResult && idx === selectedAnswer && idx !== currentQuestion.correctIndex && (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {showResult && (
            <div className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-green-50' : 'bg-amber-50'}`}>
              <p className={`text-sm font-medium ${isCorrect ? 'text-green-700' : 'text-amber-700'}`}>
                {isCorrect ? '✓ Correct!' : '✗ Not quite'}
              </p>
              <div className="text-sm text-gray-600 mt-1">
                <MathText>{currentQuestion?.explanation || ''}</MathText>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Score: {score}/{currentIndex + (showResult ? 1 : 0)}
          </div>
          {!showResult ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium"
            >
              {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
