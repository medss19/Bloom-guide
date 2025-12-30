'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import ModeSelector, { LearningMode } from '@/components/ModeSelector'
import InputArea from '@/components/InputArea'
import ResponseArea from '@/components/ResponseArea'
import Footer from '@/components/Footer'

export default function Home() {
  const [mode, setMode] = useState<LearningMode>('explain')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (input: string) => {
    setIsLoading(true)
    setResponse('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input, mode }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setResponse(data.response)
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Failed to get response. Please try again.'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setResponse('')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Choose your learning mode</h2>
          <ModeSelector selectedMode={mode} onModeChange={setMode} />
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-3">What do you want to learn?</h2>
          <InputArea onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        <ResponseArea
          response={response}
          isLoading={isLoading}
          mode={mode}
          onClear={handleClear}
        />
      </main>

      <Footer />
    </div>
  )
}
