# BloomGuide

**AI That Teaches, Not Answers**

> An ethical AI tutor that guides students through understanding rather than handing out solutions. Because real learning happens when you figure it out yourself.

**Live Demo**: [bloomguide.vercel.app](https://bloomguide.vercel.app) | **Devpost**: [View Submission](https://devpost.com/software/bloomguide-ai-that-teaches-not-answers)

---

## The Problem

Students are using AI to cheat. Schools are banning ChatGPT. But the real issue isn't AI—it's that current tools optimize for *answers*, not *learning*.

## The Solution

BloomGuide flips the script. Instead of giving answers, it:
- Explains concepts step-by-step with examples
- Tests understanding with AI-generated quizzes
- Creates flashcards for active recall
- Generates study notes you can download
- Lets you compete with friends in multiplayer quiz battles

---

## Features

| Feature | Description |
|---------|-------------|
| **Explain Mode** | Clear explanations with analogies and examples |
| **Quiz Mode** | 5-question MCQ tests with instant feedback |
| **Flashcards** | Swipeable cards with spaced repetition |
| **Notes Mode** | Comprehensive notes with PDF export |
| **Multiplayer** | Real-time quiz battles with friends |
| **Voice Input** | Speak your topic instead of typing |
| **Dashboard** | Track progress, streaks, weak topics |
| **Google Sign-In** | Optional auth for multiplayer |
| **Custom API Key** | Use your own Gemini API key if rate limited |

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **AI**: Google Gemini 2.5 Flash
- **Auth**: NextAuth.js (Google OAuth)
- **Storage**: localStorage (per-user isolation)
- **Deployment**: Vercel

---

## Architecture

```
src/
├── app/
│   ├── api/           # AI endpoints (explain, quiz, flashcards, notes, multiplayer)
│   ├── dashboard/     # Progress tracking
│   └── page.tsx       # Main interface
├── components/        # React components for each mode
└── lib/
    ├── storage.ts     # User-prefixed localStorage
    ├── multiplayer.ts # Game room management
    └── prompts.ts     # AI system prompts
```

---

## What Makes It Different

1. **Learning-First Design** — Every feature is built around understanding, not shortcuts
2. **Weak Topic Tracking** — Missed quiz questions become review targets
3. **Multiplayer Competition** — Social learning with real-time quiz battles
4. **Per-User Data** — Sign in and your progress follows you
5. **Works Without Login** — Solo features need no account
6. **Bring Your Own API Key** — Use your own Gemini key if rate limited (stored locally, never exposed)

---

## Future Enhancements

| Enhancement | Description |
|-------------|-------------|
| **Database Storage** | Replace localStorage with PostgreSQL/MongoDB for cross-device sync and data persistence |
| **Spaced Repetition** | Implement SM-2 algorithm for intelligent flashcard scheduling |
| **Teacher Dashboard** | Let educators create classes, assign topics, and track student progress |
| **AI Difficulty Scaling** | Adapt quiz difficulty based on user performance history |
| **Collaborative Study Rooms** | Persistent study groups with shared flashcard decks |
| **Mobile App** | Native iOS/Android apps with offline support |
| **LMS Integration** | Connect with Canvas, Google Classroom, Moodle |

---

## Timeline

Found this hackathon **1 day before deadline**. Built everything — from idea to deployment — in **~6 hours**.

Late to the party, but showed up anyway. Code is shipped. No regrets :)

---

Built for **CodeSpring Hackathon 2025** — Where Ideas Bloom into Innovation
