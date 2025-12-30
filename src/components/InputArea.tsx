'use client'

import { useState } from 'react'

interface InputAreaProps {
  onSubmit: (input: string) => void
  isLoading: boolean
}

const examplePrompts = [
  "Explain how recursion works in programming",
  "Help me understand the Pythagorean theorem",
  "What is photosynthesis and why is it important?",
]

export default function InputArea({ onSubmit, isLoading }: InputAreaProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSubmit(input.trim())
    }
  }

  const handleExampleClick = (example: string) => {
    setInput(example)
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your notes, problem, or topic you want to learn about..."
            className="w-full h-32 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-bloom-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
            disabled={isLoading}
          />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {input.length > 0 && `${input.length} characters`}
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-5 py-2 bg-bloom-500 text-white rounded-lg font-medium text-sm hover:bg-bloom-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Thinking...' : 'Get Help'}
          </button>
        </div>
      </form>

      {!input && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
