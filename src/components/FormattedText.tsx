'use client'

import React from 'react'

interface FormattedTextProps {
  text: string
  className?: string
}

// Convert LaTeX math to readable Unicode text
function convertLatexToReadable(latex: string): string {
  return latex
    // Common operators
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±')
    .replace(/\\mp/g, '∓')
    .replace(/\\cdot/g, '·')
    .replace(/\\ast/g, '∗')
    // Comparison operators
    .replace(/\\neq/g, '≠')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\approx/g, '≈')
    .replace(/\\equiv/g, '≡')
    .replace(/\\sim/g, '∼')
    // Greek letters
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\epsilon/g, 'ε')
    .replace(/\\theta/g, 'θ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\pi/g, 'π')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\phi/g, 'φ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\Sigma/g, 'Σ')
    .replace(/\\Pi/g, 'Π')
    .replace(/\\Omega/g, 'Ω')
    // Fractions: \frac{a}{b} → (a/b)
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)')
    // Square root: \sqrt{x} → √(x)
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\sqrt(\w)/g, '√$1')
    // Superscripts (limited support)
    .replace(/\^0/g, '⁰')
    .replace(/\^1/g, '¹')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\^4/g, '⁴')
    .replace(/\^5/g, '⁵')
    .replace(/\^6/g, '⁶')
    .replace(/\^7/g, '⁷')
    .replace(/\^8/g, '⁸')
    .replace(/\^9/g, '⁹')
    .replace(/\^n/g, 'ⁿ')
    .replace(/\^\{([^}]+)\}/g, '^($1)')
    // Subscripts (limited support)
    .replace(/_0/g, '₀')
    .replace(/_1/g, '₁')
    .replace(/_2/g, '₂')
    .replace(/_3/g, '₃')
    .replace(/_4/g, '₄')
    .replace(/_5/g, '₅')
    .replace(/_6/g, '₆')
    .replace(/_7/g, '₇')
    .replace(/_8/g, '₈')
    .replace(/_9/g, '₉')
    .replace(/_\{([^}]+)\}/g, '_($1)')
    // Infinity and special
    .replace(/\\infty/g, '∞')
    .replace(/\\sum/g, 'Σ')
    .replace(/\\prod/g, 'Π')
    .replace(/\\int/g, '∫')
    .replace(/\\partial/g, '∂')
    .replace(/\\nabla/g, '∇')
    // Arrows
    .replace(/\\rightarrow/g, '→')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\Rightarrow/g, '⇒')
    .replace(/\\Leftarrow/g, '⇐')
    // Logic
    .replace(/\\forall/g, '∀')
    .replace(/\\exists/g, '∃')
    .replace(/\\land/g, '∧')
    .replace(/\\lor/g, '∨')
    .replace(/\\neg/g, '¬')
    // Sets
    .replace(/\\in/g, '∈')
    .replace(/\\subset/g, '⊂')
    .replace(/\\cup/g, '∪')
    .replace(/\\cap/g, '∩')
    .replace(/\\emptyset/g, '∅')
    // Dots
    .replace(/\\ldots/g, '…')
    .replace(/\\cdots/g, '⋯')
    // Text inside math
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    // Clean up remaining backslashes for common commands
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\,/g, ' ')
    .replace(/\\;/g, ' ')
    .replace(/\\!/g, '')
    .replace(/\\ /g, ' ')
    // Remove any remaining lone backslashes before letters
    .replace(/\\([a-zA-Z]+)/g, '$1')
}

// Renders text with inline code (`code`), code blocks (```code```), **bold**, *italic*, and math ($...$)
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
        } else if (part.type === 'math') {
          return (
            <span
              key={idx}
              className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-mono text-sm"
            >
              {part.content}
            </span>
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
  type: 'text' | 'codeblock' | 'inlinecode' | 'math' | 'bold' | 'italic'
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
      parts.push(...parseMath(text.slice(lastIndex, match.index)))
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
    parts.push(...parseMath(text.slice(lastIndex)))
  }

  return parts
}

function parseMath(text: string): ParsedPart[] {
  const parts: ParsedPart[] = []
  // Match display math ($$...$$) first, then inline math ($...$)
  // Use a combined regex to handle both, being careful with $ not being $$
  const mathRegex = /\$\$([^$]+)\$\$|\$([^$]+)\$/g
  let lastIndex = 0
  let match

  while ((match = mathRegex.exec(text)) !== null) {
    // Add text before the math
    if (match.index > lastIndex) {
      parts.push(...parseBoldItalic(text.slice(lastIndex, match.index)))
    }

    // Get the math content (either display or inline)
    const mathContent = match[1] || match[2]
    const converted = convertLatexToReadable(mathContent.trim())

    parts.push({
      type: 'math',
      content: converted
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
