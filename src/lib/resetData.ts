// Utility to reset all BloomGuide data from localStorage

import { getCurrentUser } from './storage'

const BASE_STORAGE_KEYS = [
  'bloomguide_stats',
  'bloomguide_quizzes',
  'bloomguide_flashcards',
  'bloomguide_weak_topics',
  'bloomguide_multiplayer'
]

function getKey(baseKey: string): string {
  const userId = getCurrentUser()
  if (userId) {
    return `${baseKey}_${userId}`
  }
  return baseKey
}

export function resetAllData(): void {
  if (typeof window === 'undefined') return

  BASE_STORAGE_KEYS.forEach(key => {
    localStorage.removeItem(getKey(key))
  })

  console.log('BloomGuide: All data has been reset')
}

export function resetQuizData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(getKey('bloomguide_quizzes'))
  console.log('BloomGuide: Quiz data has been reset')
}

export function resetFlashcardData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(getKey('bloomguide_flashcards'))
  console.log('BloomGuide: Flashcard data has been reset')
}

export function resetWeakTopics(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(getKey('bloomguide_weak_topics'))
  console.log('BloomGuide: Weak topics have been reset')
}

export function resetStats(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(getKey('bloomguide_stats'))
  console.log('BloomGuide: Stats have been reset')
}
