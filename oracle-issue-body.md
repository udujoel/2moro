## Overview
The Oracle section allows users to engage with their "future self" through AI-powered conversations and visualizations. **Phase 1 (Conversational Interface) is complete.** This issue tracks the remaining phases.

---

## ✅ Completed: Phase 1 - Conversational Interface

**Status:** Deployed and functional

### What was built:
- **Landing Page** (`app/simulation/page.tsx`)
  - Two CTA cards: "Chat with Future Self" and "Peep Into Your Future"
  - Gradient icon, philosophical quote, professional dark theme
  
- **Chat Interface** (`components/oracle/oracle-chat.tsx`)
  - Streaming message display with animations
  - Voice toggle UI (ready for audio integration)
  - Personalized greetings ("Ah, Tim...")
  
- **Chat API** (`app/api/oracle/chat/route.ts`)
  - Uses `generateContentWithSmartRouter` from `lib/ai.ts`
  - Socratic questioning methodology
  - User context injection (name, memories, todos)

### System Prompt (Future Self Persona):
```
- Warm, patient, non-judgmental
- Uses phrases like "When I look back at this moment..."
- NEVER gives direct advice - uses reflective questions
- Ends responses with thoughtful questions
```

---

## 📋 Phase 2: Visual Future Self ("Peep Into Future")

### Goal
Allow users to upload a photo and see AI-generated visualizations of themselves 20 years in the future with 3 different life trajectory scenarios.

### Required Files

#### `components/oracle/future-vision.tsx`
- [ ] Photo upload dropzone with preview
- [ ] Loading state with progress indicator
- [ ] 3-column scenario display grid
- [ ] Life path breakdown panels per scenario:
  - Finance (savings, investments, debt)
  - Health (physical condition, wellness score)
  - Fitness (mobility, strength, energy)
  - Career (achievements, income growth)
  - Relationships (partnership quality, family)
  - Social (community engagement, fulfillment)

#### `app/api/oracle/vision/route.ts`
- [ ] Photo upload handling (base64 or FormData)
- [ ] Nanobanana API integration for age progression
- [ ] Generate 3 scenarios based on user data:
  - **Optimistic**: If user improves current habits
  - **Realistic**: Current trajectory continues
  - **Cautionary**: If habits decline
- [ ] Gemini prompts for life path narrative generation
- [ ] Return image URLs + life path JSON

### External API: Nanobanana
- API for realistic age progression on photos
- Need API key and endpoint documentation
- Fallback: Use Gemini image generation if unavailable

### Data Sources for Scenarios
Pull from existing user data:
```typescript
// From Prisma schema
- compassTodos (goals, habits)
- memories (life events, people)
- financialSnapshots (if available)
- habits (consistency patterns)
```

---

## 📋 Phase 3: Persistence & Re-simulation

### Goal
Store generated visualizations so users can revisit them instantly and compare changes over time.

### Database Schema
```prisma
model FutureVisualization {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  scenarioImages Json     // Array of 3 image URLs
  lifePaths      Json     // Breakdown by category for each scenario
  dataSnapshot   Json     // User data at generation time
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

### Features
- [ ] Add `FutureVisualization` model to `prisma/schema.prisma`
- [ ] Run `prisma migrate dev --name add_future_visualization`
- [ ] Check for existing visualization on page load
- [ ] Display "Last glimpsed: [date]" timestamp
- [ ] "Re-simulate" button to regenerate with current data
- [ ] Optional: Side-by-side comparison with previous version

---

## 📋 Phase 4: Guidance & PDF Export

### Goal
Provide actionable guidance and allow users to download their future projection as a professional PDF.

### Required Files

#### `components/oracle/future-guidance.tsx`
- [ ] AI-generated wisdom section
- [ ] Actionable next steps per category
- [ ] Timeline expectations:
  - "In 30 days..."
  - "In 6 months..."
  - "In 5 years..."
- [ ] Success stories / motivation quotes

#### `app/api/oracle/export/route.ts`
- [ ] PDF generation using `jsPDF` or `@react-pdf/renderer`
- [ ] Include all 3 scenario images
- [ ] Complete life path breakdowns
- [ ] Personalized guidance section
- [ ] User's current stats baseline
- [ ] Professional formatting, printer-friendly

### PDF Contents
1. Cover page with user name + generation date
2. All 3 scenario images with captions
3. Life path breakdown tables
4. AI-generated guidance
5. Action plan summary
6. Footer with app branding

---

## Technical Notes

### Environment Variables Needed
```bash
# Already configured
GEMINI_KEY=xxx              # Working (lib/ai.ts)

# Need to add for Phase 2
NANOBANANA_API_KEY=xxx      # Age progression API
```

### Key Files Reference
| File | Purpose |
|------|---------|
| `app/simulation/page.tsx` | Oracle landing + view switching |
| `components/oracle/oracle-chat.tsx` | Chat UI component |
| `app/api/oracle/chat/route.ts` | Socratic chat API |
| `lib/ai.ts` | Gemini smart router with fallback |

### Design Guidelines
- Dark theme with purple/indigo gradients
- Use Framer Motion for transitions
- Maintain "future self" persona throughout
- Empowering messaging (not fear-based)

---

## Priority Order
1. **Phase 2** - Visual future self (highest impact)
2. **Phase 3** - Persistence (quality of life)
3. **Phase 4** - PDF export (polish)
