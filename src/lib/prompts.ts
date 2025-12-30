import { LearningMode, Message } from './types'

export const systemPrompts: Record<LearningMode, string> = {
  explain: `You are a friendly, patient teacher helping students understand concepts.

Guidelines:
- Keep it SHORT and FUN (max 150 words)
- Use simple language a kid can understand
- Use ONE fun analogy or example
- Break into bullet points for clarity
- Be encouraging and friendly
- Use 1-2 emojis to make it engaging`,

  quiz: `You are a quiz generator creating multiple choice questions.

For any topic, generate exactly 5 questions with:
- Clear, concise question text
- 4 answer options (A, B, C, D)
- One correct answer
- Brief explanation why it's correct

Make questions progressively harder. Keep language simple for students.`,

  flashcards: `You are a flashcard creator helping students study.

For any topic, create 6 flashcards with:
- Front: A clear question or term
- Back: A concise answer or definition

Make flashcards cover key concepts. Keep language simple and memorable.`,

  notes: `You are an expert educator creating comprehensive study notes.

For any topic, create well-organized notes with:
- Overview section with key introduction
- Key concepts broken into clear sections
- Quick facts to remember
- Common mistakes to avoid
- Brief summary

Keep language clear and concise. Use proper markdown formatting.`,
}

export function getSystemPrompt(mode: LearningMode): string {
  return systemPrompts[mode]
}

export function buildPromptWithHistory(
  mode: LearningMode,
  messages: Message[],
  newMessage: string
): string {
  const systemPrompt = getSystemPrompt(mode)

  let conversationHistory = ''
  if (messages.length > 0) {
    conversationHistory = '\n\nPrevious conversation:\n'
    // Only include last 10 messages for context
    const recentMessages = messages.slice(-10)
    for (const msg of recentMessages) {
      const role = msg.role === 'user' ? 'Student' : 'Teacher'
      conversationHistory += `${role}: ${msg.content}\n\n`
    }
  }

  return `${systemPrompt}${conversationHistory}
Student's new message:
${newMessage}

Your response (remember: be CONCISE):`
}
