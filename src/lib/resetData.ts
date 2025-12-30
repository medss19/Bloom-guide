// Utility to reset all BloomGuide data from localStorage

const STORAGE_KEYS = [
  'bloomguide_stats',
  'bloomguide_quizzes',
  'bloomguide_flashcards',
  'bloomguide_weak_topics'
]

export function resetAllData(): void {
  if (typeof window === 'undefined') return

  STORAGE_KEYS.forEach(key => {
    localStorage.removeItem(key)
  })

  console.log('BloomGuide: All data has been reset')
}

export function resetQuizData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('bloomguide_quizzes')
  console.log('BloomGuide: Quiz data has been reset')
}

export function resetFlashcardData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('bloomguide_flashcards')
  console.log('BloomGuide: Flashcard data has been reset')
}

export function resetWeakTopics(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('bloomguide_weak_topics')
  console.log('BloomGuide: Weak topics have been reset')
}

export function resetStats(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('bloomguide_stats')
  console.log('BloomGuide: Stats have been reset')
}
