'use client'

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

interface MathTextProps {
  children: string
  className?: string
}

// Renders markdown with LaTeX math support using KaTeX
// Supports inline math: $x^2$ and display math: $$\frac{a}{b}$$
export default function MathText({ children, className = '' }: MathTextProps) {
  return (
    <div className={`math-text ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Style code blocks
          code: ({ className, children, ...props }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              )
            }
            return (
              <pre className="bg-gray-900 text-green-400 rounded-lg p-3 my-2 overflow-x-auto text-sm font-mono">
                <code {...props}>{children}</code>
              </pre>
            )
          },
          // Style paragraphs - use block display for proper line breaks
          p: ({ children }) => (
            <p className="mb-2 last:mb-0">{children}</p>
          ),
          // Style unordered lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>
          ),
          // Style ordered lists
          ol: ({ children }) => (
            <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>
          ),
          // Style list items
          li: ({ children }) => (
            <li className="text-inherit">{children}</li>
          ),
          // Style strong/bold
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          // Style emphasis/italic
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
