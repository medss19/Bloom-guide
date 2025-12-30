// In-memory game room storage (for MVP - in production use Redis/database)
// Note: This will reset on server restart, suitable for hackathon demo

export interface Player {
  id: string
  name: string
  score: number
  answers: number[]  // Index of selected answers
  finishedAt?: number
}

export interface GameRoom {
  id: string
  hostId: string
  topic: string
  status: 'waiting' | 'playing' | 'finished'
  players: Player[]
  questions: QuizQuestion[]
  currentQuestion: number
  createdAt: number
  startedAt?: number
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
}

// In-memory storage
const rooms: Map<string, GameRoom> = new Map()

// Generate a 6-character room code
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'  // Excluded similar chars like 0/O, 1/I
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function createRoom(hostId: string, hostName: string, topic: string): GameRoom {
  let code = generateRoomCode()
  // Ensure unique code
  while (rooms.has(code)) {
    code = generateRoomCode()
  }

  const room: GameRoom = {
    id: code,
    hostId,
    topic,
    status: 'waiting',
    players: [{
      id: hostId,
      name: hostName,
      score: 0,
      answers: []
    }],
    questions: [],
    currentQuestion: 0,
    createdAt: Date.now()
  }

  rooms.set(code, room)
  return room
}

export function getRoom(roomId: string): GameRoom | undefined {
  return rooms.get(roomId.toUpperCase())
}

export function joinRoom(roomId: string, playerId: string, playerName: string): GameRoom | null {
  const room = rooms.get(roomId.toUpperCase())
  if (!room) return null
  if (room.status !== 'waiting') return null
  if (room.players.length >= 8) return null  // Max 8 players

  // Check if player already in room
  const existingPlayer = room.players.find(p => p.id === playerId)
  if (existingPlayer) {
    existingPlayer.name = playerName  // Update name if rejoining
    return room
  }

  room.players.push({
    id: playerId,
    name: playerName,
    score: 0,
    answers: []
  })

  return room
}

export function leaveRoom(roomId: string, playerId: string): boolean {
  const room = rooms.get(roomId.toUpperCase())
  if (!room) return false

  room.players = room.players.filter(p => p.id !== playerId)

  // If host leaves, delete room
  if (playerId === room.hostId || room.players.length === 0) {
    rooms.delete(roomId.toUpperCase())
  }

  return true
}

export function startGame(roomId: string, questions: QuizQuestion[]): GameRoom | null {
  const room = rooms.get(roomId.toUpperCase())
  if (!room) return null
  if (room.players.length < 2) return null

  room.questions = questions
  room.status = 'playing'
  room.startedAt = Date.now()
  room.currentQuestion = 0

  // Reset all player scores and answers
  room.players.forEach(p => {
    p.score = 0
    p.answers = []
    p.finishedAt = undefined
  })

  return room
}

export function submitAnswer(
  roomId: string,
  playerId: string,
  questionIndex: number,
  answerIndex: number
): { correct: boolean; room: GameRoom } | null {
  const room = rooms.get(roomId.toUpperCase())
  if (!room) return null
  if (room.status !== 'playing') return null

  const player = room.players.find(p => p.id === playerId)
  if (!player) return null

  // Already answered this question
  if (player.answers[questionIndex] !== undefined) {
    return { correct: player.answers[questionIndex] === room.questions[questionIndex].correctIndex, room }
  }

  const question = room.questions[questionIndex]
  if (!question) return null

  player.answers[questionIndex] = answerIndex
  const correct = answerIndex === question.correctIndex

  if (correct) {
    player.score += 1
  }

  // Check if player finished all questions
  if (player.answers.filter(a => a !== undefined).length === room.questions.length) {
    player.finishedAt = Date.now()
  }

  // Check if all players finished
  const allFinished = room.players.every(p =>
    p.answers.filter(a => a !== undefined).length === room.questions.length
  )

  if (allFinished) {
    room.status = 'finished'
  }

  return { correct, room }
}

export function getRoomState(roomId: string): GameRoom | null {
  return rooms.get(roomId.toUpperCase()) || null
}

// Cleanup old rooms (call periodically)
export function cleanupOldRooms(): void {
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  rooms.forEach((room, id) => {
    if (room.createdAt < oneHourAgo) {
      rooms.delete(id)
    }
  })
}
