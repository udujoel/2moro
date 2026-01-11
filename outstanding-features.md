## Overview
This issue tracks all outstanding features and "Phase" items across the project, including the Oracle section and MyStory module.

---

## 🔮 Oracle Section (Phases 2-4)

### 📋 Phase 2: Visual Future Self ("Peep Into Future")
**Goal:** Allow users to upload a photo and see AI-generated visualizations 20 years in the future.

#### Tasks
- [ ] Create `components/oracle/future-vision.tsx`
  - Photo upload dropzone
  - 3-column scenario display grid
  - Life path breakdown panels
- [ ] Create `app/api/oracle/vision/route.ts`
  - Nanobanana API integration for age progression
  - Generate 3 scenarios (Optimistic, Realistic, Cautionary)

### 📋 Phase 3: Persistence
**Goal:** Store generated visualizations for revisiting.

#### Tasks
- [ ] Add `FutureVisualization` model to Prisma
- [ ] Store visualization results in DB
- [ ] Add "Re-simulate" button

### 📋 Phase 4: Guidance & PDF Export
**Goal:** Professional PDF export of future projections.

#### Tasks
- [ ] Create `components/oracle/future-guidance.tsx` (wisdom & next steps)
- [ ] Create `app/api/oracle/export/route.ts` (PDF generation)

---

## 📖 MyStory Module

### 📋 Ongoing Phases
Found in `app/actions/mystory.ts` and `lib/mystory.ts`.

#### Tasks
- [ ] **Phase 3 Regeneration:** Implement "Delete existing chapters for full regeneration" logic in `lib/mystory.ts`.
- [ ] **Phase 9: DALL-E Covers:** Implement DALL-E cover generation for stories.
- [ ] **Phase 9: Chapter Illustrations:** Generate unique illustrations per chapter.
- [ ] **Phase 9: PDF Export:** Implement full story PDF export in `app/actions/mystory.ts`.

---

## 🧩 Other Technical Tasks

### Compass
- [ ] **Todo Sync:** Improve calendar sync reliability in `app/actions/compass.ts`.

### Dashboard
- [ ] **Impact Slider:** Replace mock logic with real future projection algorithm in `components/dashboard/impact-slider.tsx`.

### Dependencies
- [ ] **DALL-E Integration:** Required for MyStory visuals.
- [ ] **Nanobanana API:** Required for Oracle age progression.

---

## Priority Order
1. **Oracle Phase 2** (Visual features)
2. **MyStory Visuals** (DALL-E integration)
3. **Oracle Persistence** (DB updates)
4. **Export Features** (PDF generation for both Oracle and MyStory)
