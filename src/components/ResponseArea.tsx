'use client'

import ReactMarkdown from 'react-markdown'
import { LearningMode } from './ModeSelector'

interface ResponseAreaProps {
  response: string
  isLoading: boolean
  mode: LearningMode
  onClear: () => void
}

const modeLabels = {
  explain: 'Explanation',
  hint: 'Hints',
  challenge: 'Challenge',
}

export default function ResponseArea({ response, isLoading, mode, onClear }: ResponseAreaProps) {
  if (!response && !isLoading) {
    return null
  }

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-bloom-500'}`} />
          <span className="text-sm font-medium text-gray-700">
            {isLoading ? 'Generating response...' : modeLabels[mode]}
          </span>
        </div>
        {!isLoading && response && (
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm">Thinking...</span>
          </div>
        ) : (
          <div className="prose max-w-none">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
