# 2moro Architecture Documentation

## Overview

2moro is built on a modern, serverless-first architecture using Next.js 16 with the App Router. This document details the system design, component interactions, and key architectural decisions.

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Component Layers](#component-layers)
3. [Data Flow Patterns](#data-flow-patterns)
4. [Feature Modules](#feature-modules)
5. [AI Pipeline](#ai-pipeline)
6. [Security Architecture](#security-architecture)
7. [Performance Optimizations](#performance-optimizations)
8. [Scalability Considerations](#scalability-considerations)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────────────┐  │
│  │   Browser   │  │  React UI    │  │  Providers  │  │  State Managers  │  │
│  │   (DOM)     │  │  Components  │  │  (Context)  │  │  (Local)         │  │
│  └─────────────┘  └──────────────┘  └─────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            APPLICATION LAYER                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Next.js App Router                               │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────────┐  │   │
│  │  │ API Routes  │  │Server Actions│  │     Middleware             │  │   │
│  │  │ /api/*      │  │ app/actions/ │  │ (Auth, Rate Limit, CORS)   │  │   │
│  │  └─────────────┘  └──────────────┘  └────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SERVICE LAYER                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │ AI Service  │  │ Auth Service│  │Calendar Svc │  │ Crypto Service   │   │
│  │ lib/ai.ts   │  │ lib/auth.ts │  │ google-cal. │  │ lib/crypto.ts    │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────────────┘   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │ Rate Limit  │  │   Logger    │  │  Horoscope  │  │    Finance       │   │
│  │ lib/rate-.. │  │ lib/logger  │  │lib/horoscope│  │  lib/finance.ts  │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         Prisma ORM                                      │ │
│  │  ┌──────────┐  ┌───────────────┐  ┌────────────┐  ┌────────────────┐  │ │
│  │  │  Models  │  │  Migrations   │  │   Client   │  │  Connection    │  │ │
│  │  │  Schema  │  │  prisma/mig.  │  │  lib/db.ts │  │  Pooling       │  │ │
│  │  └──────────┘  └───────────────┘  └────────────┘  └────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│                                      ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                       PostgreSQL Database                               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │Google Gemini│  │Google OAuth │  │Google Cal.  │  │   ElevenLabs     │   │
│  │     AI      │  │    2.0      │  │    API      │  │      TTS         │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Layers

### 1. Client Layer

**Purpose**: User interface and browser interactions

| Component | Location | Responsibility |
|-----------|----------|----------------|
| React Components | `components/` | UI rendering, user interaction |
| Context Providers | `components/*-provider.tsx` | Global state (user, theme) |
| Custom Hooks | Used within components | Reusable logic patterns |

**Key Providers**:
- `UserProvider` - User session state
- `ThemeProvider` - Dark/light mode
- `ToastContext` - Notification system

### 2. Application Layer

**Purpose**: Request handling, routing, and business logic orchestration

| Component | Location | Responsibility |
|-----------|----------|----------------|
| API Routes | `app/api/` | HTTP endpoint handlers |
| Server Actions | `app/actions/` | Form submissions, mutations |
| Middleware | `middleware.ts` | Auth guards, route protection |

**Server Action Modules**:
- `compass.ts` - Todos, recommendations, financial data
- `dashboard.ts` - Dashboard widgets, activity feed
- `habits.ts` - Habit tracking and streaks
- `mystory.ts` - Biography generation
- `onboarding.ts` - User setup flow

### 3. Service Layer

**Purpose**: Business logic, external API integrations, utilities

| Service | File | Responsibility |
|---------|------|----------------|
| AI Service | `lib/ai.ts` | Gemini API wrapper, model routing |
| Auth Service | `lib/auth.ts` | NextAuth configuration |
| Crypto Service | `lib/crypto.ts` | AES-256-GCM encryption |
| Calendar Service | `lib/google-calendar.ts` | Google Calendar API |
| Rate Limiter | `lib/rate-limit.ts` | Token bucket algorithm |
| Logger | `lib/logger.ts` | Environment-aware logging |
| Finance | `lib/finance.ts` | Financial calculations |
| Horoscope | `lib/horoscope.ts` | Zodiac-based content |

### 4. Data Layer

**Purpose**: Database access and data modeling

- **Prisma ORM**: Type-safe database queries
- **Migrations**: Version-controlled schema changes
- **Connection Pooling**: Optimized for serverless

---

## Data Flow Patterns

### Pattern 1: Server Action (Mutations)

```
User Action → React Component → Server Action → Prisma → Database
     ↑                                              │
     └─────────────── Response ────────────────────┘
```

**Example**: Completing a task
```typescript
// Component calls server action directly
const result = await updateTodoStatus(todoId, "completed");
```

### Pattern 2: API Route (External APIs)

```
Component → fetch() → API Route → External Service → Response → Component
                          │
                          └→ Prisma (if caching)
```

**Example**: Oracle chat
```typescript
// POST /api/oracle/chat
const response = await fetch('/api/oracle/chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversationId })
});
```

### Pattern 3: Real-time (WebSocket)

```
Component ←→ WebSocket Connection ←→ API Route ←→ Gemini Live API
```

**Example**: Voice mode streaming

---

## Feature Modules

### Dashboard Module

```
app/dashboard/
├── page.tsx                 # Main dashboard page
components/dashboard/
├── memory-breakdown.tsx     # Memory statistics
├── habit-stack.tsx          # Habit tracking widget
├── activity-log.tsx         # Recent activity feed
├── sidebar.tsx              # Navigation sidebar
└── error-wrapper.tsx        # Error boundary wrapper
```

### Compass Module

```
app/compass/
├── page.tsx                 # Main compass page
├── assessment/page.tsx      # MBTI assessment
├── financials/page.tsx      # Financial input form
components/compass/
├── ai-recommendations.tsx   # AI-generated suggestions
├── todo-sections.tsx        # Task management
├── streak-tracker.tsx       # Completion streaks
├── financial-health.tsx     # Health score display
├── investment-projection.tsx# Calculator widget
└── portfolio-chart.tsx      # Financial charts
```

### Oracle Module

```
app/oracle/
├── page.tsx                 # Oracle entry point
├── session/[id]/page.tsx    # Conversation session
app/api/oracle/
├── chat/route.ts            # Text chat endpoint
├── voice/route.ts           # Voice transcription
├── live/route.ts            # Real-time streaming
├── speak/route.ts           # Text-to-speech
├── conversations/route.ts   # History management
├── future/route.ts          # Future visualization
└── recent/route.ts          # Recent summary
components/oracle/
├── oracle-chat.tsx          # Chat interface
├── oracle-voice.tsx         # Voice controls
├── three-orb.tsx            # 3D animated orb
└── animated-orb.tsx         # 2D fallback orb
```

---

## AI Pipeline

### Model Selection Strategy

```typescript
// lib/ai.ts - Smart Router
export async function generateContentWithSmartRouter(
    prompt: string,
    mode: "smart" | "pro" | "flash"
): Promise<string>
```

| Mode | Model | Latency | Quality | Use Case |
|------|-------|---------|---------|----------|
| flash | gemini-2.0-flash | ~500ms | Good | Quick responses |
| smart | gemini-2.0-flash | ~1s | Better | Balanced default |
| pro | gemini-2.0-flash | ~2s | Best | Complex reasoning |

### AI Feature Pipelines

#### 1. Chat Oracle
```
User Message → Context Assembly → Gemini API → Response Parsing → Storage → UI
                    │
                    └── User preferences, personality, recent memories
```

#### 2. Recommendations Engine
```
Personality Test → Horoscope Fetch → Prompt Construction → Gemini → Parse JSON → Store
```

#### 3. Future Visualization
```
User Data Synthesis → Scenario Generation (3x) → Life Path Breakdown → Wisdom Layer
```

---

## Security Architecture

### Authentication Flow

```
┌──────────┐     ┌───────────────┐     ┌──────────────┐     ┌──────────┐
│  User    │────▶│  Login Page   │────▶│ Google OAuth │────▶│ Callback │
└──────────┘     └───────────────┘     └──────────────┘     └──────────┘
                                                                   │
                                                                   ▼
┌──────────┐     ┌───────────────┐     ┌──────────────┐     ┌──────────┐
│Dashboard │◀────│   Middleware  │◀────│  JWT Session │◀────│  NextAuth│
└──────────┘     │ (Validation)  │     │   (Cookie)   │     │ Callback │
                 └───────────────┘     └──────────────┘     └──────────┘
```

### Security Layers

| Layer | Implementation | Purpose |
|-------|----------------|---------|
| Transport | HTTPS (Vercel) | Encryption in transit |
| Session | JWT + httpOnly cookies | Stateless auth |
| Route Protection | middleware.ts | Reject unauthorized |
| Input Validation | Zod schemas | Prevent injection |
| Rate Limiting | Token bucket | Prevent abuse |
| Token Storage | AES-256-GCM encryption | Protect OAuth tokens |

### Encryption Details

```typescript
// lib/crypto.ts
// Algorithm: AES-256-GCM
// Key: 32-byte from ENCRYPTION_KEY env var
// IV: 16 random bytes per encryption
// Tag: 16-byte authentication tag
```

---

## Performance Optimizations

### 1. Caching Strategies

| Data Type | Strategy | TTL |
|-----------|----------|-----|
| Horoscope | Database + memory | Monthly |
| AI Recommendations | Database | Until regenerated |
| Static Assets | Vercel CDN | Immutable |

### 2. Code Splitting

- Dynamic imports for heavy components (Three.js orb)
- Route-based code splitting via App Router
- Lazy loading for non-critical features

### 3. Database Optimization

- Composite indexes on frequently queried columns
- Connection pooling for serverless
- Select specific fields (avoid SELECT *)

---

## Scalability Considerations

### Current Architecture Limits

| Resource | Current | Scalability Path |
|----------|---------|------------------|
| Database | Single PostgreSQL | Read replicas, sharding |
| AI Calls | Rate limited | Queue + worker pool |
| File Storage | Not implemented | S3/GCS integration |
| Sessions | JWT (stateless) | Already scalable |

### Recommended Scaling Path

1. **Phase 1**: Add Redis for session caching, rate limiting
2. **Phase 2**: Background job queue (Bull/Inngest) for AI tasks
3. **Phase 3**: CDN for media, S3 for uploads
4. **Phase 4**: Database read replicas

---

## Appendix: Technology Decisions

### Why Next.js App Router?
- Server Components reduce JS bundle
- Server Actions simplify mutations
- Built-in optimization features

### Why Prisma?
- Type-safe queries
- Excellent migration tooling
- Works well with serverless

### Why Gemini over OpenAI?
- Better multimodal support
- Gemini Live for real-time voice
- Competitive pricing

### Why JWT over Database Sessions?
- Serverless-friendly (no session lookups)
- Scales horizontally without shared state
- Trade-off: Can't instantly revoke
