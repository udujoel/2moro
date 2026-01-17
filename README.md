# 2moro

## *Slogan: "What if you had known?"*

**2moro** is a comprehensive **Life Operating System (LifeOS)** designed specifically to bridge the gap between youthful energy and long-term wisdom. By leveraging AI and behavioral data, it transforms the concept of mentorship from an external lecture into an internal dialogue with one's own future self.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com)

---

## 📋 Table of Contents

- [The Philosophy](#the-core-philosophy-closing-the-wisdom-gap)
- [The Future Self Engine](#the-future-self-engine)
- [Key Features](#key-features--functionality)
- [Value Proposition](#the-value-proposition)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)

---

## The Core Philosophy: Closing the Wisdom Gap

While the prefrontal cortex—the area of the brain responsible for planning and impulse control—does not fully mature until the mid-20s, young people are expected to make decisions that define their lifetimes.

* **The Problem:** Youth possess time and energy but often lack foresight and experience. Mentorship is scarce, and young people often reject external advice due to a lack of perceived urgency.
* **The Reality:** As the proverb goes, *"The best time to plant a tree was yesterday. The next best time is today."* Regret often stems from realized ignorance—the painful admission of "If I had only known."
* **The Solution:** **2moro** eliminates the "stranger danger" of advice. It utilizes the psychological truth that while we may reject opinions from others, we rarely reject the needs of our future selves if we can clearly visualize them.

---

## The "Future Self" Engine

The platform’s central innovation is the **Future Simulator**. Instead of a generic coach, 2moro uses user data (habits, finances, memories) to model a vivid projection of the user's future reality.

* **Visual Aging:** Generates an aged visualization of the user, turning the "future self" from an abstract concept into a recognizable person. This builds empathy and comfort with one's own aging process.
* **Reality Simulation:** Projects current behaviors forward. If a user saves $X or exercises Y times a week, what does their life look like in 10 years? This serves as both an effective warning system and a powerful encouragement mechanism.

---

## Key Features & Functionality

### 1. The Oracle (AI Mentorship Interface) 🔮
A dedicated space where users communicate with their "Future Self" in real-time.

* **Perspective Shifting:** Users can text or speak to The Oracle about current pressures, obsessions, or rash decisions.
* **Wisdom Injection:** Using the user's personality and goals, the AI responds with the tempered wisdom of an older, more experienced version of themselves, preventing regretful mistakes before they happen.

### 2. The Real-Time Digital Autobiographer 📖
2moro turns daily living into a legacy through an **Omni-Journal**.

* **Non-Linear Input, Linear Output:** Users can input memories multimodally (text, voice, photo) as they happen. Whether it is a current event or a childhood memory, the system intelligently files it into the correct chronological slot.
* **Legacy Creation:** The platform acts as a ghostwriter, composing these entries into a coherent autobiography or audio-book. Users can read their own unfolding story, gaining a "third-person perspective" on their own life.
* **People-Centric Search:** Memories are tagged against the people involved, creating a relational database of social history.

### 3. Behavioral & Financial Life OS 🧭
Beyond reflection, 2moro provides the tactical tools to engineer a better tomorrow.

* **Financial Projection:** Connects to banking apps or accepts manual input to track assets and investments. It visualizes not just current net worth, but *future value estimates* based on current trajectories.
* **Atomic Habits:** Includes psychometric testing (Personality Tests) to tailor habit recommendations. It breaks big goals down into atomic habits synced directly to the user's calendar.

---

## The Value Proposition

**2moro** is not just an app; it is an **anti-regret engine**.

By introducing the young to their future selves early, the platform fosters conscientiousness without feeling like a chore. It answers the haunting question—*"What if you had known?"*—by allowing the user to "know" today, ensuring that their current actions serve their future reality.

It is a fun, engaging, and deeply personalized coach that grows with the user, ensuring they maximize their life’s potential, not by chance, but by design.

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1 | React framework with App Router |
| **React** | 19.2 | UI component library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Three.js** | 0.182 | 3D graphics (Oracle orb) |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API** | 16.1 | Serverless endpoints |
| **Prisma ORM** | 5.22 | Database access |
| **PostgreSQL** | 15+ | Primary database |
| **NextAuth** | 5.0 | Authentication |
| **Zod** | 4.x | Runtime validation |

### External Services
| Service | Purpose |
|---------|---------|
| **Google Gemini** | AI model for Oracle & Analysis |
| **Google Gemini Live** | Real-time voice interactions |
| **ElevenLabs** | Visionary text-to-speech for audiobooks |
| **Google Calendar** | Task synchronization |

---

## Project Structure

```
2moro/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (Oracle, Auth, Speech)
│   ├── archive/                  # Diary functionality
│   ├── compass/                  # Financial & Habit OS
│   ├── dashboard/                # Daily Overview
│   ├── mystory/                  # Autobiography generation
│   ├── oracle/                   # Future Self Interface
│   └── simulation/               # Future Visualization
├── components/                   # UI Components
├── lib/                          # Business Logic (AI, Auth, Finance)
├── prisma/                       # Database Schema
└── public/                       # Assets
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL Database
- Google Cloud Project (OAuth & Gemini API)

### Installation

```bash
# Clone repository
git clone https://github.com/udujoel/2moro.git
cd 2moro

# Install dependencies
npm install

# Setup env
cp .env.example .env.local

# Initialize DB
npx prisma migrate dev

# Run development server
npm run dev
```

---

## API Reference

See [docs/API.md](./docs/API.md) for full API documentation.
See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for system design.

---

<div align="center">
Made with ❤️ by the 2moro Team
</div>
