'use client'

import React from 'react'

interface FormattedTextProps {
  text: string
  className?: string
}

// Renders text with inline code (`code`), code blocks (```code```), **bold**, and *italic*
export default function FormattedText({ text, className = '' }: FormattedTextProps) {
  // Parse the text for code blocks and inline code
  const parts = parseCodeBlocks(text)

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (part.type === 'codeblock') {
          return (
            <pre
              key={idx}
              className="bg-gray-900 text-green-400 rounded-lg p-3 my-2 overflow-x-auto text-sm font-mono"
            >
              <code>{part.content}</code>
            </pre>
          )
        } else if (part.type === 'inlinecode') {
          return (
            <code
              key={idx}
              className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono"
            >
              {part.content}
            </code>
          )
        } else if (part.type === 'bold') {
          return <strong key={idx} className="font-semibold">{part.content}</strong>
        } else if (part.type === 'italic') {
          return <em key={idx} className="italic">{part.content}</em>
        } else {
          return <span key={idx}>{part.content}</span>
        }
      })}
    </span>
  )
}

interface ParsedPart {
  type: 'text' | 'codeblock' | 'inlinecode' | 'bold' | 'italic'
  content: string
}

function parseCodeBlocks(text: string): ParsedPart[] {
  const parts: ParsedPart[] = []

  // First, handle code blocks (```)
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before the code block
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index)
      parts.push(...parseInlineCode(beforeText))
    }

    // Add the code block
    parts.push({
      type: 'codeblock',
      content: match[2].trim()
    })

    lastIndex = match.index + match[0].length
  }

  // Add remaining text after last code block
  if (lastIndex < text.length) {
    parts.push(...parseInlineCode(text.slice(lastIndex)))
  }

  return parts
}

function parseInlineCode(text: string): ParsedPart[] {
  const parts: ParsedPart[] = []
  const inlineCodeRegex = /`([^`]+)`/g
  let lastIndex = 0
  let match

  while ((match = inlineCodeRegex.exec(text)) !== null) {
    // Add text before the inline code
    if (match.index > lastIndex) {
      parts.push(...parseBoldItalic(text.slice(lastIndex, match.index)))
    }

    // Add the inline code
    parts.push({
      type: 'inlinecode',
      content: match[1]
    })

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(...parseBoldItalic(text.slice(lastIndex)))
  }

  return parts
}

function parseBoldItalic(text: string): ParsedPart[] {
  const parts: ParsedPart[] = []
  // Match **bold** or *italic* (bold first to avoid conflict)
  const regex = /\*\*([^*]+)\*\*|\*([^*]+)\*/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      })
    }

    // Check if it's bold (**) or italic (*)
    if (match[1]) {
      // Bold match (group 1)
      parts.push({
        type: 'bold',
        content: match[1]
      })
    } else if (match[2]) {
      // Italic match (group 2)
      parts.push({
        type: 'italic',
        content: match[2]
      })
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex)
    })
  }

  return parts
}
