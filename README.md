# BloomGuide

**AI That Teaches, Not Answers**

An ethical AI learning assistant that guides students through concepts instead of handing out solutions. Built for CodeSpring Hackathon 2025.

## The Problem

Students increasingly rely on AI for instant answers, often sacrificing real understanding and academic integrity. Traditional AI assistants optimize for speed, not learning. This creates a dependency that hinders genuine knowledge development.

## The Solution

BloomGuide is an AI-powered learning assistant designed to guide students through concepts rather than simply giving answers. It features three distinct learning modes that encourage active learning, critical thinking, and deep understanding.

## Features

### Three Learning Modes

| Mode | Description | Best For |
|------|-------------|----------|
| **Explain** | Clear, step-by-step explanations with examples and analogies | Understanding new concepts |
| **Hint** | Guided hints without revealing answers | Problem-solving practice |
| **Challenge** | AI asks questions to test understanding | Self-assessment |

### Key Features

- **Multi-turn Conversations** - Continue learning with context-aware follow-up questions
- **Session History** - All your learning sessions are saved locally
- **Dashboard Analytics** - Track your learning progress, streaks, and mode usage
- **Topic Suggestions** - Quick-start with curated topics across subjects
- **Mobile Responsive** - Learn on any device
- **Clean, Professional UI** - Distraction-free learning environment

### Subject Categories

- Mathematics (Algebra, Calculus, Probability)
- Science (Physics, Chemistry, Biology)
- Programming (Data Structures, Algorithms, OOP)
- Languages (Writing, Grammar, Literature)

## Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **AI**: Google Gemini 2.5 Flash API
- **Storage**: localStorage (client-side persistence)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API key ([Get one free](https://makersuite.google.com/app/apikey))

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

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts    # AI API endpoint
│   ├── dashboard/page.tsx   # Analytics dashboard
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main chat interface
│   └── globals.css          # Global styles
├── components/
│   ├── ChatInput.tsx        # Message input
│   ├── ChatMessage.tsx      # Message display
│   ├── ModeSelector.tsx     # Learning mode picker
│   ├── Sidebar.tsx          # Session history
│   └── WelcomeScreen.tsx    # Topic suggestions
└── lib/
    ├── gemini.ts            # Gemini API client
    ├── prompts.ts           # Mode-specific prompts
    ├── storage.ts           # localStorage utilities
    └── types.ts             # TypeScript types
```

## How It Works

1. **Select a Learning Mode** - Choose Explain, Hint, or Challenge based on your goal
2. **Enter Your Topic** - Type a question or select from suggested topics
3. **Learn Through Conversation** - Continue the dialogue with follow-up questions
4. **Track Progress** - View your stats and session history on the Dashboard

### The Magic: Mode-Specific AI Prompts

Each learning mode uses carefully crafted system prompts that instruct the AI to:

- **Explain**: Break down concepts, use analogies, provide examples
- **Hint**: Guide without revealing, ask leading questions
- **Challenge**: Generate questions, evaluate responses, provide feedback

## Deployment

Deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/medss19/Bloom-guide)

**Important**: Add `GEMINI_API_KEY` to your Vercel environment variables.

## Why BloomGuide Can Win

1. **Innovative Approach** - Learning-mode lock is a unique differentiator
2. **Ethical AI Use** - Addresses real concerns about AI in education
3. **Complete Solution** - Full-featured with history, analytics, and multi-turn chat
4. **Clean Execution** - Professional UI, robust architecture
5. **Strong Narrative** - "AI that teaches, not answers" is memorable

## Demo Script

1. Show the problem: Traditional AI gives direct answers
2. Introduce BloomGuide: AI that guides instead
3. Demo Explain Mode: Watch concepts unfold step-by-step
4. Demo Hint Mode: Get guidance without spoilers
5. Demo Challenge Mode: Test understanding with AI-generated questions
6. Show Dashboard: Track learning progress
7. Close: "BloomGuide helps students learn, not cheat"

## License

MIT

---

Built with love for **CodeSpring Hackathon 2025** - Where Ideas Bloom into Innovation
