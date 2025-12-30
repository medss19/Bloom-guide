# BloomGuide

**AI That Teaches, Not Answers**

An ethical AI learning assistant that guides students through concepts instead of handing out solutions. Built for CodeSpring Hackathon 2025.

## The Problem

Students increasingly rely on AI for instant answers, often sacrificing real understanding and academic integrity. Traditional AI assistants optimize for speed, not learning.

## The Solution

BloomGuide is an AI-powered learning assistant designed to guide students through concepts rather than simply giving answers. It features three distinct learning modes that encourage active learning and critical thinking.

## Features

### Learning Modes

1. **Explain Mode** - Get clear, step-by-step explanations with examples and analogies
2. **Hint Mode** - Receive guidance without full answers, encouraging you to think
3. **Challenge Mode** - Test your understanding with AI-generated questions and feedback

### Key Highlights

- Clean, distraction-free interface
- No direct answers - only guided learning
- Supports any topic or subject
- Mobile-responsive design

## Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/medss19/Bloom-guide.git
cd Bloom-guide
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Add your Gemini API key to `.env.local`:
```
GEMINI_API_KEY=your_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts    # API endpoint for AI responses
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main page
│   └── globals.css          # Global styles
├── components/
│   ├── Header.tsx           # App header
│   ├── ModeSelector.tsx     # Learning mode tabs
│   ├── InputArea.tsx        # Text input
│   ├── ResponseArea.tsx     # AI response display
│   └── Footer.tsx           # App footer
└── lib/
    ├── prompts.ts           # System prompts for each mode
    └── gemini.ts            # Gemini API client
```

## How It Works

1. User selects a learning mode (Explain, Hint, or Challenge)
2. User enters their topic, notes, or question
3. The app sends the input with mode-specific system prompts to Gemini
4. AI responds according to the selected mode's teaching strategy

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/medss19/Bloom-guide)

Remember to add `GEMINI_API_KEY` to your Vercel environment variables.

## License

MIT

## Hackathon

Built for **CodeSpring Hackathon 2025** - Where Ideas Bloom into Innovation
