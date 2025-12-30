'use client'

export type LearningMode = 'explain' | 'hint' | 'challenge'

interface ModeSelectorProps {
  selectedMode: LearningMode
  onModeChange: (mode: LearningMode) => void
}

const modes = [
  {
    id: 'explain' as const,
    title: 'Explain',
    description: 'Get clear, step-by-step explanations',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: 'hint' as const,
    title: 'Hint',
    description: 'Get guidance without full answers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'challenge' as const,
    title: 'Challenge',
    description: 'Test your understanding with questions',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export default function ModeSelector({ selectedMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            selectedMode === mode.id
              ? 'border-bloom-500 bg-bloom-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className={`mb-2 ${selectedMode === mode.id ? 'text-bloom-600' : 'text-gray-400'}`}>
            {mode.icon}
          </div>
          <h3 className={`font-medium text-sm ${selectedMode === mode.id ? 'text-bloom-700' : 'text-gray-900'}`}>
            {mode.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{mode.description}</p>
        </button>
      ))}
    </div>
  )
}
