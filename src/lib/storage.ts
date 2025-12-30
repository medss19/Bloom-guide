import { UserStats, QuizResult, FlashcardSet, MissedQuestion, WeakTopic, StudiedCard, MultiplayerResult } from './types'

// Base storage keys
const BASE_KEYS = {
  stats: 'bloomguide_stats',
  quizzes: 'bloomguide_quizzes',
  flashcards: 'bloomguide_flashcards',
  weakTopics: 'bloomguide_weak_topics',
  multiplayer: 'bloomguide_multiplayer'
}

// Current user ID for prefixing storage keys
let currentUserId: string | null = null

// Set the current user ID (call this when user signs in/out)
export function setCurrentUser(userId: string | null): void {
  currentUserId = userId
}

// Get the current user ID
export function getCurrentUser(): string | null {
  return currentUserId
}

// Get storage key with user prefix
function getKey(baseKey: string): string {
  if (currentUserId) {
    return `${baseKey}_${currentUserId}`
  }
  return baseKey
}

// Legacy key names for backwards compatibility
const STATS_KEY = BASE_KEYS.stats
const QUIZ_RESULTS_KEY = BASE_KEYS.quizzes
const FLASHCARD_SETS_KEY = BASE_KEYS.flashcards
const WEAK_TOPICS_KEY = BASE_KEYS.weakTopics
const MULTIPLAYER_RESULTS_KEY = BASE_KEYS.multiplayer

export function getStats(): UserStats {
  if (typeof window === 'undefined') {
    return getDefaultStats()
  }

  const data = localStorage.getItem(getKey(STATS_KEY))
  if (data) {
    const parsed = JSON.parse(data)
    return { ...getDefaultStats(), ...parsed }
  }

  return getDefaultStats()
}

function getDefaultStats(): UserStats {
  return {
    totalExplains: 0,
    totalQuizzes: 0,
    totalFlashcards: 0,
    totalMultiplayerGames: 0,
    quizzesPassed: 0,
    avgQuizScore: 0,
    flashcardsLearned: 0,
    multiplayerWins: 0,
    streak: 0,
    lastActiveDate: '',
    recentTopics: []
  }
}

function updateStreak(stats: UserStats): void {
  const today = new Date().toISOString().split('T')[0]

  if (stats.lastActiveDate) {
    const lastDate = new Date(stats.lastActiveDate)
    const todayDate = new Date(today)
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      stats.streak += 1
    } else if (diffDays > 1) {
      stats.streak = 1
    }
  } else {
    stats.streak = 1
  }

  stats.lastActiveDate = today
}

function addRecentTopic(stats: UserStats, topic: string): void {
  // Remove if already exists, add to front
  stats.recentTopics = stats.recentTopics.filter(t => t !== topic)
  stats.recentTopics.unshift(topic)
  // Keep only last 10
  stats.recentTopics = stats.recentTopics.slice(0, 10)
}

export function recordExplain(topic: string): void {
  const stats = getStats()
  stats.totalExplains += 1
  updateStreak(stats)
  addRecentTopic(stats, topic)
  localStorage.setItem(getKey(STATS_KEY), JSON.stringify(stats))
}

export function recordQuizResult(
  topic: string,
  score: number,
  total: number,
  missedQuestions?: MissedQuestion[]
): void {
  const stats = getStats()
  const passed = score >= Math.ceil(total * 0.6)

  stats.totalQuizzes += 1
  if (passed) stats.quizzesPassed += 1

  // Update average score
  const prevTotal = stats.avgQuizScore * (stats.totalQuizzes - 1)
  stats.avgQuizScore = Math.round((prevTotal + (score / total) * 100) / stats.totalQuizzes)

  updateStreak(stats)
  addRecentTopic(stats, topic)
  localStorage.setItem(getKey(STATS_KEY), JSON.stringify(stats))

  // Save quiz result with missed questions
  const results = getQuizResults()
  results.unshift({
    id: generateId(),
    topic,
    score,
    total,
    passed,
    completedAt: Date.now(),
    missedQuestions
  })
  localStorage.setItem(getKey(QUIZ_RESULTS_KEY), JSON.stringify(results.slice(0, 20)))

  // Update weak topics if there are missed questions
  if (missedQuestions && missedQuestions.length > 0) {
    updateWeakTopics(topic, missedQuestions)
  }
}

function updateWeakTopics(topic: string, missedQuestions: MissedQuestion[]): void {
  const weakTopics = getWeakTopics()

  // Find existing weak topic or create new one
  const existingIndex = weakTopics.findIndex(wt => wt.topic.toLowerCase() === topic.toLowerCase())

  if (existingIndex >= 0) {
    // Update existing
    weakTopics[existingIndex].missedCount += missedQuestions.length
    weakTopics[existingIndex].lastMissed = Date.now()
    // Add new questions, keep max 5 samples
    weakTopics[existingIndex].sampleQuestions = [
      ...missedQuestions,
      ...weakTopics[existingIndex].sampleQuestions
    ].slice(0, 5)
  } else {
    // Add new weak topic
    weakTopics.unshift({
      topic,
      missedCount: missedQuestions.length,
      lastMissed: Date.now(),
      sampleQuestions: missedQuestions.slice(0, 5)
    })
  }

  // Sort by missed count (most missed first) and keep top 10
  weakTopics.sort((a, b) => b.missedCount - a.missedCount)
  localStorage.setItem(getKey(WEAK_TOPICS_KEY), JSON.stringify(weakTopics.slice(0, 10)))
}

export function getWeakTopics(): WeakTopic[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(getKey(WEAK_TOPICS_KEY))
  return data ? JSON.parse(data) : []
}

export function removeWeakTopic(topic: string): void {
  const weakTopics = getWeakTopics()
  const filtered = weakTopics.filter(wt => wt.topic.toLowerCase() !== topic.toLowerCase())
  localStorage.setItem(getKey(WEAK_TOPICS_KEY), JSON.stringify(filtered))
}

export function recordFlashcardSet(
  topic: string,
  learned: number,
  total: number,
  cards?: StudiedCard[]
): void {
  const stats = getStats()
  stats.totalFlashcards += 1
  stats.flashcardsLearned += learned
  updateStreak(stats)
  addRecentTopic(stats, topic)
  localStorage.setItem(getKey(STATS_KEY), JSON.stringify(stats))

  // Save flashcard set with card details
  const sets = getFlashcardSets()
  sets.unshift({
    id: generateId(),
    topic,
    cardsLearned: learned,
    totalCards: total,
    completedAt: Date.now(),
    cards
  })
  localStorage.setItem(getKey(FLASHCARD_SETS_KEY), JSON.stringify(sets.slice(0, 20)))
}

export function getQuizResults(): QuizResult[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(getKey(QUIZ_RESULTS_KEY))
  return data ? JSON.parse(data) : []
}

export function getFlashcardSets(): FlashcardSet[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(getKey(FLASHCARD_SETS_KEY))
  return data ? JSON.parse(data) : []
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Migrate anonymous data to user account on login
export function migrateAnonymousData(userId: string): void {
  if (typeof window === 'undefined') return

  const allBaseKeys = Object.values(BASE_KEYS)

  allBaseKeys.forEach(baseKey => {
    const anonymousKey = baseKey // non-prefixed key
    const userKey = `${baseKey}_${userId}` // user-prefixed key

    const anonymousData = localStorage.getItem(anonymousKey)

    if (anonymousData) {
      // Check if user already has data (from previous login)
      const existingUserData = localStorage.getItem(userKey)

      if (!existingUserData) {
        // No existing user data - migrate anonymous data
        localStorage.setItem(userKey, anonymousData)
      } else {
        // User has existing data - merge (user data takes priority, but add counts)
        try {
          const anonParsed = JSON.parse(anonymousData)
          const userParsed = JSON.parse(existingUserData)

          // For stats, merge the counts
          if (baseKey === BASE_KEYS.stats) {
            const merged = {
              ...anonParsed,
              ...userParsed,
              totalExplains: (userParsed.totalExplains || 0) + (anonParsed.totalExplains || 0),
              totalQuizzes: (userParsed.totalQuizzes || 0) + (anonParsed.totalQuizzes || 0),
              totalFlashcards: (userParsed.totalFlashcards || 0) + (anonParsed.totalFlashcards || 0),
              totalMultiplayerGames: (userParsed.totalMultiplayerGames || 0) + (anonParsed.totalMultiplayerGames || 0),
              quizzesPassed: (userParsed.quizzesPassed || 0) + (anonParsed.quizzesPassed || 0),
              flashcardsLearned: (userParsed.flashcardsLearned || 0) + (anonParsed.flashcardsLearned || 0),
              multiplayerWins: (userParsed.multiplayerWins || 0) + (anonParsed.multiplayerWins || 0),
              // Keep user's streak and recent topics
              streak: userParsed.streak || anonParsed.streak || 0,
              lastActiveDate: userParsed.lastActiveDate || anonParsed.lastActiveDate || '',
              recentTopics: [...new Set([...(userParsed.recentTopics || []), ...(anonParsed.recentTopics || [])])].slice(0, 10)
            }
            localStorage.setItem(userKey, JSON.stringify(merged))
          } else if (Array.isArray(anonParsed) && Array.isArray(userParsed)) {
            // For arrays (quizzes, flashcards, etc.), merge and dedupe by id
            const existingIds = new Set(userParsed.map((item: { id: string }) => item.id))
            const newItems = anonParsed.filter((item: { id: string }) => !existingIds.has(item.id))
            const merged = [...userParsed, ...newItems].slice(0, 20)
            localStorage.setItem(userKey, JSON.stringify(merged))
          }
        } catch {
          // If parsing fails, just use user data
        }
      }

      // Clear anonymous data after migration
      localStorage.removeItem(anonymousKey)
    }
  })

  console.log('BloomGuide: Migrated anonymous data to user account')
}

// Multiplayer results
export function getMultiplayerResults(): MultiplayerResult[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(getKey(MULTIPLAYER_RESULTS_KEY))
  return data ? JSON.parse(data) : []
}

export function recordMultiplayerResult(
  roomId: string,
  topic: string,
  score: number,
  total: number,
  rank: number,
  totalPlayers: number,
  players: { name: string; score: number; isYou: boolean }[],
  missedQuestions?: MissedQuestion[]
): void {
  const stats = getStats()
  const won = rank === 1

  stats.totalMultiplayerGames += 1
  if (won) stats.multiplayerWins += 1
  updateStreak(stats)
  addRecentTopic(stats, topic)
  localStorage.setItem(getKey(STATS_KEY), JSON.stringify(stats))

  // Save multiplayer result
  const results = getMultiplayerResults()
  results.unshift({
    id: generateId(),
    roomId,
    topic,
    score,
    total,
    rank,
    totalPlayers,
    won,
    completedAt: Date.now(),
    missedQuestions,
    players
  })
  localStorage.setItem(getKey(MULTIPLAYER_RESULTS_KEY), JSON.stringify(results.slice(0, 20)))

  // Update weak topics if there are missed questions
  if (missedQuestions && missedQuestions.length > 0) {
    updateWeakTopics(topic, missedQuestions)
  }
}
