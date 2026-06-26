# SenseMaker Investigation Lifecycle

Visual guide showing how investigations evolve through their lifecycle.

## Investigation Lifecycle

```
                        ┌─────────────────────────────────┐
                        │     Investigation Created       │
                        │   (front matter + first entry)   │
                        └─────────────┬───────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
              ┌─────▼─────┐                     ┌──────▼───────┐
              │    SEED   │                     │   ARCHIVED   │
              │  (idea)   │                     │  (preserved) │
              └─────┬─────┘                     └──────▲───────┘
                    │                                   │
                    │ Add observations                  │
                    │ and ask questions                 │
                    │                                   │
              ┌─────▼──────────┐                       │
              │    THINKING    │                       │
              │ (exploration)  │                       │
              └─────┬──────────┘                       │
                    │                                   │
        ┌───────────┼───────────┐                      │
        │           │           │                      │
   ┌────▼───┐  ┌────▼────┐  ┌──▼───────┐             │
   │READING │  │EXPLORING│  │ Back to  │             │
   │(sources)  │(testing) │  │  SEED   │             │
   └────┬───┘  └────┬────┘  └──┬───────┘             │
        │           │          │                      │
        └───────────┼──────────┘                      │
                    │                                   │
            ┌───────▼────────────┐                     │
            │  MODEL EMERGING    │                     │
            │ (framework forms)  │                     │
            └───────┬────────────┘                     │
                    │                                   │
            ┌───────▼─────────────┐                    │
            │   ESSAY DRAFT       │                    │
            │ (ready to synthesize)                    │
            └───────┬─────────────┘                    │
                    │                                   │
              ┌─────▼──────┐                           │
              │   STABLE   │◄──────┐                   │
              │ (reference)│      │                    │
              └─────┬──────┘      │                    │
                    │             │                    │
              ┌─────▼──────┐      │                    │
              │  REOPENED  │──────┘                    │
              │(questioning)                           │
              └─────┬──────┘                           │
                    │                                   │
                    └───────────────┬───────────────────┘
                                    │
                            ┌───────▼────────┐
                            │   ARCHIVED     │
                            │  (preserved)   │
                            └────────────────┘
```

## Status Meanings & Colors

```
┌──────────────┬────────────────────────────────────────┐
│   Status     │        What It Means                    │
├──────────────┼────────────────────────────────────────┤
│ SEED    🟢   │ Initial idea. Barely formed. Just a    │
│              │ question or observation that caught    │
│              │ your attention.                        │
├──────────────┼────────────────────────────────────────┤
│ THINKING 🔵  │ Active exploration. You're puzzling    │
│              │ through it. Adding observations.       │
│              │ Not reading yet, just thinking.        │
├──────────────┼────────────────────────────────────────┤
│ READING 🟣   │ You're studying sources. Books,        │
│              │ papers, experts. Gathering context.    │
│              │ Still exploring, but with guidance.    │
├──────────────┼────────────────────────────────────────┤
│ EXPLORING 🟠 │ Practical experimentation. Testing     │
│              │ ideas. Building prototypes. Writing    │
│              │ code. Running experiments.             │
├──────────────┼────────────────────────────────────────┤
│ MODEL  🔵    │ A framework is forming. You see a      │
│ EMERGING     │ pattern. A model is emerging that      │
│              │ explains things. Not settled yet.      │
├──────────────┼────────────────────────────────────────┤
│ ESSAY ⚪      │ Time to synthesize. You can write     │
│ DRAFT        │ this up. The thinking is coherent.    │
│              │ Draft form ready.                      │
├──────────────┼────────────────────────────────────────┤
│ STABLE 💙    │ Settled for now. Reference ready.      │
│              │ You can cite this. Likely to stay      │
│              │ this way unless something changes.     │
├──────────────┼────────────────────────────────────────┤
│ REOPENED ❌   │ You were wrong. Or incomplete.        │
│              │ Back to questioning a stable idea.     │
│              │ Likely to cycle back through.          │
├──────────────┼────────────────────────────────────────┤
│ ARCHIVED ⚫  │ Closed but preserved. Not active.      │
│              │ Still searchable. Historical record.   │
└──────────────┴────────────────────────────────────────┘
```

## Investigation Components

```
Investigation File Structure:

┌─────────────────────────────────────────────┐
│              FRONT MATTER                   │
│  (Metadata - How the investigation is)      │
├─────────────────────────────────────────────┤
│ title: "..."                                │
│ created: YYYY-MM-DD                         │
│ status: "Seed" | "Thinking" | ...           │
│ areas: ["Area1", "Area2"]                   │
│ topics: ["Topic1", "Topic2"]                │
│ questions:                                  │
│   - "Question 1?"                           │
│   - "Question 2?"                           │
│ tags: ["tag1", "tag2"]                      │
│ related: ["other-investigation"]            │
│ draft: false                                │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          INVESTIGATION CONTENT              │
│  (The actual thinking - Your journal)       │
├─────────────────────────────────────────────┤
│                                             │
│  ## 26-June-2026                            │
│                                             │
│  Initial observations...                    │
│  Questions and ideas...                     │
│  Thoughts and sketches...                   │
│                                             │
│  ─────────────────────                      │
│                                             │
│  ## 11-July-2026                            │
│                                             │
│  New insight after reading...               │
│  How my thinking evolved...                 │
│                                             │
│  ─────────────────────                      │
│                                             │
│  ## 04-February-2027                        │
│                                             │
│  Updated perspective...                     │
│                                             │
└─────────────────────────────────────────────┘
```

## How Status Changes Over Time

```
A typical investigation might evolve like:

Week 1:
   SEED (new idea) → THINKING (exploring question)

Week 2-3:
   THINKING (observing) → READING (found relevant sources)

Week 4:
   READING (learning) → EXPLORING (testing ideas)

Week 5-6:
   EXPLORING (experimenting) → MODEL EMERGING (pattern forms)

Week 7-8:
   MODEL EMERGING (refining) → ESSAY DRAFT (writing it up)

Week 9:
   ESSAY DRAFT → STABLE (settled)


Months later:
   STABLE (reference) → REOPENED (new question found)
   → THINKING (exploring again) → READING (learning more)
   ...cycle repeats...

Eventually:
   Any status → ARCHIVED (completed or abandoned)
```

## Navigation Through Investigations

```
Homepage
    ├── Recently Updated
    │   └── Click to view investigation
    ├── Recently Created
    │   └── Click to view investigation
    ├── Areas
    │   └── Click area → See all investigations in that area
    ├── Topics
    │   └── Click topic → See all investigations with that topic
    ├── Open Investigations
    │   └── Click to view (Seed, Thinking, Reading, Exploring)
    └── Stable Investigations
        └── Click to view (proven & settled)

Investigation Page
    ├── Title & Status Badge
    ├── Questions that drive the investigation
    ├── Chronological dated entries
    ├── Related investigations (via "related" field)
    ├── Tags
    └── Areas & Topics used
```

## Creating Connections

```
Three ways investigations connect:

1. MANUAL LINKS (Front Matter)
   In investigation A:
   related:
     - "investigation-b"
     - "investigation-c"
   
   Shows up as linked list at bottom

2. SEARCH CONNECTIONS
   Search for keyword across all investigations
   Find unexpected related investigations
   "Emergence" appears in philosophy, engineering, AI

3. TAXONOMY CONNECTIONS
   Same area → Click area to see all related
   Same topic → Click topic to see all related
   Same tag → Could be searched together
```

## Investigation Lifecycle Example

Real example: "Consciousness"

```
┌────────────────────────────────────────────────────────┐
│                    CONSCIOUSNESS                        │
├────────────────────────────────────────────────────────┤
│                                                         │
│ 26-June-2026  [SEED]                                   │
│ "What is consciousness?"                               │
│ Just a question. New seed.                             │
│                                                         │
│ ───────────────────                                    │
│                                                         │
│ 03-July-2026  [THINKING]                              │
│ Read some philosophy. Not satisfied with definitions.  │
│ Added more questions.                                  │
│                                                         │
│ ───────────────────                                    │
│                                                         │
│ 22-August-2026  [READING]                             │
│ Reading Hofstadter, Dennett, Searle. Taking notes.     │
│ Different schools of thought emerging.                 │
│                                                         │
│ ───────────────────                                    │
│                                                         │
│ 05-December-2026  [MODEL EMERGING]                    │
│ I think consciousness involves self-reference.         │
│ Like a strange loop of information processing.         │
│ New connections forming...                             │
│                                                         │
│ ───────────────────                                    │
│                                                         │
│ 14-January-2027  [ESSAY DRAFT]                        │
│ I could write this up now. Framework is solid.         │
│ Ready to synthesize thinking into coherent essay.      │
│                                                         │
│ ───────────────────                                    │
│                                                         │
│ 28-February-2027  [STABLE]                            │
│ Framework settled. Can reference this. Clear thinking. │
│ This will stay stable until new challenge emerges.     │
│                                                         │
│ ───────────────────                                    │
│                                                         │
│ Later... [REOPENED]                                   │
│ Found new evidence that challenges my model.          │
│ Back to questioning... cycle repeats                  │
│                                                         │
└────────────────────────────────────────────────────────┘

Total time: ~8 months from seed to stable
But growth potential: infinite through reopenings
```

## Weekly Rhythm

```
Monday:      Create new investigation on topic that intrigues you
Tuesday:     Add to existing investigation with new thinking
Wednesday:   Search for connections between investigations
Thursday:    Update status of investigation as thinking evolves
Friday:      Review open investigations, consider archiving completed ones
Saturday:    Free day - let ideas percolate
Sunday:      Plan next week's investigations
```

## Monthly Review Process

```
1. Search for a keyword or concept
2. See all related investigations
3. Notice patterns:
   - Do multiple investigations touch the same theme?
   - Are there unexpected connections?
   - What's emerged from the network?

4. Update relationships:
   - Add new related investigations
   - Update status where thinking matured
   - Archive investigations that are complete

5. Look for synthesis opportunities:
   - Could an ESSAY DRAFT be written?
   - Should a THINKING investigation restart?
   - Any REOPENED investigations that need attention?
```

## Preservation & Accumulation

```
Year 1:
├── 10-20 investigations created
├── Scattered thoughts
└── Foundation building

Year 2-3:
├── 30-50 investigations
├── Some connections forming
├── Patterns beginning to emerge
└── Revisiting earlier investigations

Year 5+:
├── 100+ investigations
├── Rich network of connections
├── Themes visible across disciplines
├── Evolved thinking from years of accumulation
└── Ability to see how you've grown
```

## Remember

- **Every entry is preserved** - The evolution matters
- **Status is fluid** - Investigations can move between states
- **Search is powerful** - Use it to find connections
- **Accumulation over time** - Value increases with years
- **Never delete** - Archive instead; you might revisit
- **One person, deep thinking** - Optimized for long-term personal development

---

This is your thinking laboratory. Let it grow.
