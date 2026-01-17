# 2moro API Reference

Complete documentation for all API endpoints in the 2moro application.

---

## Table of Contents

- [Authentication](#authentication)
- [Oracle](#oracle)
- [Suggestions](#suggestions)
- [Speech](#speech)
- [Server Actions](#server-actions)

---

## Authentication

### Base URL
All auth endpoints are prefixed with `/api/auth/`

---

### NextAuth Handler

```
ALL /api/auth/[...nextauth]
```

Handles all NextAuth.js authentication flows including sign-in, sign-out, callbacks, and session management.

**Providers**:
- Google OAuth 2.0
- Credentials (Development only - "Login as Test User")

---

### Get Current User

```http
GET /api/auth/user
```

Returns the currently authenticated user's profile.

**Response (200)**:
```json
{
  "success": true,
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://...",
    "title": "Explorer",
    "onboardingCompleted": true
  }
}
```

**Response (401)**:
```json
{
  "success": false,
  "error": "Not authenticated"
}
```

---

### Clear Cookies

```http
POST /api/auth/clear-cookies
```

Clears all authentication cookies. Used for debugging session issues.

**Response (200)**:
```json
{
  "success": true,
  "message": "Cookies cleared"
}
```

---

### Google Calendar OAuth

#### Initiate Connection

```http
GET /api/auth/google/calendar
```

Redirects to Google OAuth consent screen for Calendar permissions.

**Query Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `redirect` | string | Optional URL to redirect after success |

---

#### OAuth Callback

```http
GET /api/auth/google/callback
```

Handles the OAuth callback from Google. Stores encrypted refresh token in database.

**Query Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `code` | string | Authorization code from Google |
| `state` | string | CSRF protection state |

---

#### Disconnect Calendar

```http
POST /api/auth/google/disconnect
```

Revokes Calendar access and removes stored tokens.

**Response (200)**:
```json
{
  "success": true,
  "message": "Calendar disconnected"
}
```

---

## Oracle

### Base URL
All Oracle endpoints are prefixed with `/api/oracle/`

---

### Chat

```http
POST /api/oracle/chat
```

Send a message to the Oracle and receive an AI response.

**Request Body**:
```json
{
  "message": "What should I focus on today?",
  "conversationId": "clx123..." // Optional, for continuing conversation
}
```

**Response (200)**:
```json
{
  "success": true,
  "response": "Based on your recent activities...",
  "conversationId": "clx123...",
  "messageId": "msg_456"
}
```

**Rate Limit**: 20 requests per minute

---

### Voice Transcription

```http
POST /api/oracle/voice
```

Transcribe audio and get an AI response.

**Request Body**: `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| `audio` | File | Audio file (WAV, MP3, WebM) |
| `conversationId` | string | Optional conversation context |

**Response (200)**:
```json
{
  "success": true,
  "transcription": "User's spoken text",
  "response": "Oracle's response",
  "conversationId": "clx123..."
}
```

---

### Live Streaming

```http
WebSocket /api/oracle/live
```

Real-time bidirectional audio streaming using Gemini Live API.

**Connection Flow**:
1. Client opens WebSocket connection
2. Client sends audio chunks (base64)
3. Server streams response audio back
4. Connection persists for session duration

**Message Types**:

*Client → Server*:
```json
{
  "type": "audio",
  "data": "base64_audio_chunk"
}
```

*Server → Client*:
```json
{
  "type": "response",
  "audio": "base64_audio_chunk",
  "text": "Transcribed response"
}
```

---

### Text-to-Speech

```http
POST /api/oracle/speak
```

Convert text to speech audio.

**Request Body**:
```json
{
  "text": "Hello, this is the Oracle speaking.",
  "voice": "alloy" // Optional
}
```

**Response**: Audio stream (`audio/mpeg`)

---

### List Conversations

```http
GET /api/oracle/conversations
```

Get paginated list of user's Oracle conversations.

**Query Parameters**:
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `limit` | number | 20 | Max conversations |
| `offset` | number | 0 | Pagination offset |
| `type` | string | all | Filter: "text", "voice", "all" |

**Response (200)**:
```json
{
  "success": true,
  "conversations": [
    {
      "id": "clx123...",
      "type": "text",
      "summary": "Discussion about career goals",
      "createdAt": "2024-01-15T10:30:00Z",
      "messageCount": 12
    }
  ],
  "total": 45,
  "hasMore": true
}
```

---

### Get Conversation

```http
GET /api/oracle/conversations/[id]
```

Get a specific conversation with all messages.

**Response (200)**:
```json
{
  "success": true,
  "conversation": {
    "id": "clx123...",
    "type": "text",
    "messages": [
      {
        "role": "user",
        "content": "Hello",
        "timestamp": "2024-01-15T10:30:00Z"
      },
      {
        "role": "assistant",
        "content": "Hello! How can I help?",
        "timestamp": "2024-01-15T10:30:05Z"
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Delete Conversation

```http
DELETE /api/oracle/conversations/[id]
```

Delete a conversation and all its messages.

**Response (200)**:
```json
{
  "success": true,
  "message": "Conversation deleted"
}
```

---

### Recent Conversations

```http
GET /api/oracle/recent
```

Get summary of recent Oracle activity.

**Response (200)**:
```json
{
  "success": true,
  "recentConversations": 3,
  "lastInteraction": "2024-01-15T10:30:00Z",
  "topTopics": ["career", "wellness", "relationships"]
}
```

---

### Future Visualization

#### Generate Future Scenarios

```http
POST /api/oracle/future/generate
```

Generate AI-powered future life path scenarios.

**Request Body**:
```json
{
  "forceRegenerate": false
}
```

**Response (200)**:
```json
{
  "success": true,
  "visualization": {
    "id": "clx123...",
    "scenarios": [
      {
        "type": "optimistic",
        "title": "The Thriving Path",
        "description": "...",
        "lifePaths": {
          "career": "...",
          "relationships": "...",
          "health": "...",
          "finances": "..."
        }
      },
      // ... 2 more scenarios
    ],
    "narrative": "Your potential futures...",
    "wisdomContent": "Key insights..."
  }
}
```

---

#### Get Future Visualization

```http
GET /api/oracle/future
```

Get existing future visualization (if any).

**Response (200)**:
```json
{
  "success": true,
  "hasVisualization": true,
  "visualization": { /* same structure as generate */ }
}
```

---

#### Generate Scenario Images

```http
POST /api/oracle/future/image
```

Generate AI images for future scenarios.

**Request Body**:
```json
{
  "visualizationId": "clx123...",
  "userPhoto": "base64_image_data" // Optional
}
```

**Response (200)**:
```json
{
  "success": true,
  "images": [
    { "scenario": "optimistic", "url": "https://..." },
    { "scenario": "current", "url": "https://..." },
    { "scenario": "warning", "url": "https://..." }
  ]
}
```

---

## Suggestions

### Base URL
All suggestions endpoints are prefixed with `/api/suggestions/`

---

### Daily Suggestions

```http
GET /api/suggestions/daily
```

Get daily memory prompts personalized to the user.

**Response (200)**:
```json
{
  "success": true,
  "suggestions": [
    {
      "id": "sug_123",
      "content": "What made you smile today?",
      "context": { "type": "mood", "priority": "high" }
    },
    {
      "id": "sug_124",
      "content": "Describe a conversation that stuck with you",
      "context": { "type": "social", "priority": "medium" }
    }
  ],
  "expiresAt": "2024-01-16T00:00:00Z"
}
```

---

### Regenerate Suggestions

```http
POST /api/suggestions/regenerate
```

Force generation of new daily suggestions.

**Response (200)**:
```json
{
  "success": true,
  "suggestions": [ /* new suggestions */ ],
  "message": "Suggestions regenerated"
}
```

---

## Speech

### Base URL
All speech endpoints are prefixed with `/api/speech/`

---

### Get TTS Token

```http
GET /api/speech/token
```

Get a temporary ElevenLabs session token for client-side TTS.

**Response (200)**:
```json
{
  "success": true,
  "token": "el_xxxxx",
  "expiresAt": "2024-01-15T11:30:00Z"
}
```

---

## Server Actions

Server Actions are called directly from React components, not via HTTP. They handle form submissions and data mutations.

### Compass Actions (`app/actions/compass.ts`)

| Action | Parameters | Description |
|--------|------------|-------------|
| `savePersonalityTest` | mbtiType, description, traits, responses | Save MBTI results |
| `getLatestPersonalityTest` | - | Fetch user's test |
| `generateAIRecommendations` | forceRefresh | Get AI suggestions |
| `acceptRecommendation` | recommendation | Create todos from suggestion |
| `dismissRecommendation` | recommendationId | Dismiss suggestion |
| `getTodosByTimeframe` | timeframe | Get todos (today/week/month) |
| `updateTodoStatus` | todoId, status | Complete/dismiss todo |
| `createTodo` | task, category, timeframe | Manual todo creation |
| `deleteTodo` | todoId | Remove todo |
| `calculateStreak` | - | Get completion streak |
| `saveFinancialSnapshot` | financialData | Store financial data |
| `generateFinancialAnalysis` | - | AI financial insights |

### Dashboard Actions (`app/actions/dashboard.ts`)

| Action | Parameters | Description |
|--------|------------|-------------|
| `getDashboardStats` | - | Memory counts, streaks |
| `getActivityLog` | limit | Recent activity |
| `getUpcomingEvents` | - | Calendar integration |

### Habits Actions (`app/actions/habits.ts`)

| Action | Parameters | Description |
|--------|------------|-------------|
| `getHabits` | - | User's habits |
| `createHabit` | title, frequency | New habit |
| `completeHabit` | habitId | Mark complete |
| `deleteHabit` | habitId | Remove habit |

### MyStory Actions (`app/actions/mystory.ts`)

| Action | Parameters | Description |
|--------|------------|-------------|
| `generateChapter` | startDate, endDate | Create biography section |
| `getChapters` | - | All chapters |
| `regenerateChapter` | chapterId | Refresh content |

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE" // Optional
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limits

| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| Oracle Chat | 20 | 1 minute |
| Oracle Voice | 10 | 1 minute |
| AI Generation | 5 | 1 minute |
| Other APIs | 100 | 1 minute |
