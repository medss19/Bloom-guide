'use client'

import { useState, useEffect } from 'react'

interface ExplainModeProps {
  topic: string
  onComplete: () => void
  onBack: () => void
}

export default function ExplainMode({ topic, onComplete, onBack }: ExplainModeProps) {
  const [explanation, setExplanation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [followUpInput, setFollowUpInput] = useState('')
  const [conversation, setConversation] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])

  // Fetch explanation on mount
  useEffect(() => {
    fetchExplanation()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchExplanation = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, history: [] }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate explanation')
      }

      setExplanation(data.explanation)
      setConversation([{ role: 'assistant', content: data.explanation }])
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load explanation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowUp = async () => {
    if (!followUpInput.trim()) return

    const userMessage = followUpInput.trim()
    setFollowUpInput('')

    const newConversation = [...conversation, { role: 'user' as const, content: userMessage }]
    setConversation(newConversation)
    setIsLoading(true)

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          followUp: userMessage,
          history: newConversation
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      setConversation([...newConversation, { role: 'assistant', content: data.explanation }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response')
    } finally {
      setIsLoading(false)
    }
  }

  if (error && !explanation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Oops! Something went wrong</h3>
          <p className="text-gray-500 text-sm mt-2">{error}</p>
          <div className="flex gap-3 justify-center mt-6">
            <button onClick={onBack} className="px-4 py-2 text-gray-600 hover:text-gray-800">
              Go Back
            </button>
            <button
              onClick={fetchExplanation}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Explain Mode</p>
                <p className="text-xs text-gray-400 truncate max-w-[200px]">{topic}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {isLoading && !explanation ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Getting your explanation...</h3>
            <p className="text-gray-500 text-sm mt-2">Learning about {topic}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-5 ${
                  msg.role === 'assistant'
                    ? 'bg-white shadow-sm border border-gray-100'
                    : 'bg-blue-50 ml-8'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-3 text-blue-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-xs font-medium uppercase tracking-wide">Explanation</span>
                  </div>
                )}
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && explanation && (
              <div className="flex items-center gap-2 text-gray-400 py-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Follow-up input */}
      {explanation && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder="Ask a follow-up question..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleFollowUp()
                  }
                }}
                disabled={isLoading}
              />
              <button
                onClick={handleFollowUp}
                disabled={!followUpInput.trim() || isLoading}
                className="px-5 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Ask follow-up questions to learn more
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
