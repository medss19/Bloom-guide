import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json()

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are an expert educator creating comprehensive study notes for a student about: "${topic}"

Create well-organized study notes that are perfect for revision. Follow this exact format:

# ${topic}

## Overview
[A clear 2-3 sentence introduction explaining what this topic is about]

## Key Concepts

### [Concept 1 Name]
[Explanation with key points]
- Important point 1
- Important point 2

### [Concept 2 Name]
[Explanation with key points]
- Important point 1
- Important point 2

### [Concept 3 Name]
[Explanation with key points]
- Important point 1
- Important point 2

## Quick Facts to Remember
- [Fact 1]
- [Fact 2]
- [Fact 3]
- [Fact 4]
- [Fact 5]

## Common Mistakes to Avoid
1. [Mistake 1 and why it's wrong]
2. [Mistake 2 and why it's wrong]
3. [Mistake 3 and why it's wrong]

## Summary
[A brief 2-3 sentence summary of the most important takeaways]

Guidelines:
- Keep language clear and concise
- Use bullet points and numbered lists for easy scanning
- Include specific examples where helpful
- Make it comprehensive but not overwhelming (aim for ~500-700 words)
- If the topic involves code/programming, include simple code examples wrapped in triple backticks
- Use proper markdown formatting

Generate the study notes now:`

    // Retry logic for rate limits
    let lastError: Error | null = null
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) {
          await delay(1000 * Math.pow(2, attempt))
        }

        const result = await model.generateContent(prompt)
        const response = result.response
        const text = response.text()

        return NextResponse.json({ notes: text })
      } catch (error: unknown) {
        lastError = error as Error
        const err = error as { status?: number }
        if (err.status !== 429) {
          throw error
        }
      }
    }

    throw lastError || new Error('Failed after retries')
  } catch (error) {
    console.error('Notes API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate notes. Please try again.' },
      { status: 500 }
    )
  }
}
