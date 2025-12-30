export type LearningMode = 'explain' | 'quiz' | 'flashcards' | 'notes'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Session {
  id: string
  title: string
  mode: LearningMode
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface MissedQuestion {
  question: string
  userAnswer: string
  correctAnswer: string
  explanation: string
  topic: string
}

export interface QuizResult {
  id: string
  topic: string
  score: number
  total: number
  passed: boolean
  completedAt: number
  missedQuestions?: MissedQuestion[]
}

export interface WeakTopic {
  topic: string
  missedCount: number
  lastMissed: number
  sampleQuestions: MissedQuestion[]
}

export interface Flashcard {
  id: string
  front: string
  back: string
  learned: boolean
}

export interface StudiedCard {
  front: string
  back: string
  learned: boolean
}

export interface FlashcardSet {
  id: string
  topic: string
  cardsLearned: number
  totalCards: number
  completedAt: number
  cards?: StudiedCard[]
}

export interface UserStats {
  totalExplains: number
  totalQuizzes: number
  totalFlashcards: number
  totalMultiplayerGames: number
  quizzesPassed: number
  avgQuizScore: number
  flashcardsLearned: number
  multiplayerWins: number
  streak: number
  lastActiveDate: string
  recentTopics: string[]
}

export interface MultiplayerResult {
  id: string
  roomId: string
  topic: string
  score: number
  total: number
  rank: number
  totalPlayers: number
  won: boolean
  completedAt: number
  missedQuestions?: MissedQuestion[]
  players: {
    name: string
    score: number
    isYou: boolean
  }[]
}
