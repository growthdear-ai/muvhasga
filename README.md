# DealRoom — AI Deal Desk Agent for B2B Sales

An intelligent deal desk that sits in on every sales call and builds a persistent memory of each deal: objections raised, competitors mentioned, stakeholder concerns, and pricing discussions. Over time, it learns which objection-handling tactics actually close deals and generates personalized briefings before every follow-up.

## Demo Story

**Call 1** (Generic pitch) → **Call 3** (Recalls prospect's Competitor X pain point) → **Call 5** (Synthesizes full deal strategy from 5 interactions of memory)

**Memory is the product** — visible, accumulating, and directly tied to revenue.

## Features

### 🎯 Deal Memory & Tracking
- **Persistent deal context** across all calls and interactions
- **Stakeholder mapping** with influence, sentiment, and concerns
- **Call logging** with transcript processing, key moments, and action items
- **Timeline view** of every interaction

### 📋 Objection Intelligence
- **Categorized objections** (price, competitor, timeline, features, trust, implementation)
- **Response tracking** with effectiveness scoring (0-100%)
- **Outcome tracking** (unresolved → partially-resolved → resolved → escalated)
- **Playbook generation** from real deal data

### ⚔️ Competitor Intelligence
- **Competitor mention tracking** with context and prospect sentiment
- **Differentiation mapping** — what works against each competitor
- **Threat assessment** per deal and across pipeline

### 💰 Pricing Discussion Memory
- **Budget, discount, packaging, ROI** discussion tracking
- **Prospect reaction logging** (positive/neutral/negative/pushed-back)
- **Pricing strategy recommendations** based on sensitivity analysis

### 🧠 AI-Generated Insights
- **Deal health scoring** (0-100) with confidence levels
- **Risk factor identification** with mitigation strategies
- **Buying signal detection** from call transcripts
- **Next best action** recommendations
- **Stakeholder risk mapping** (influence × sentiment)

### 📋 Pre-Call Briefings
- **Executive summary** synthesizing all prior interactions
- **Stakeholder-specific updates** with sentiment changes
- **Objection status** with recommended responses from playbook
- **Competitor intel** with win themes
- **Pricing position** and strategy
- **Talk tracks** with stakeholder-specific points
- **Risk assessment** with deal health score

### 📚 Self-Improving Playbook
- **Successful response library** with effectiveness scores
- **Failed response library** with failure reasons
- **Trigger pattern recognition** for objection categories
- **Best practice distillation** from real deals
- **Usage analytics** per playbook entry

### 📊 Pipeline Analytics
- **Weighted pipeline** tracking
- **Win/loss analysis** with confidence correlation
- **Objection effectiveness** by category
- **Competitor landscape** with sentiment analysis
- **Rep leaderboard** with pipeline and confidence metrics
- **Deal health distribution** across portfolio

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Context + localStorage (demo) / easily swappable for DB
- **Architecture**: Modular, type-safe, extensible

## Getting Started

```bash
cd dealroom
npm install
npm run dev
```

Open http://localhost:3000

## Project Structure

```
dealroom/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard (Kanban pipeline)
│   │   ├── layout.tsx            # Root layout with provider
│   │   ├── globals.css           # Tailwind + custom styles
│   │   ├── deals/[id]/page.tsx   # Deal detail with tabs
│   │   ├── playbook/page.tsx     # Objection playbook
│   │   ├── briefings/page.tsx    # Pre-call briefing generator
│   │   └── insights/page.tsx     # Pipeline analytics
│   ├── components/
│   │   └── Navigation.tsx        # Sidebar navigation
│   ├── hooks/
│   │   └── useDealRoom.ts        # Global state management
│   ├── lib/
│   │   ├── dealStore.ts          # Data layer + AI insight generation
│   │   └── utils.ts              # Formatters & helpers
│   └── types/
│       └── index.ts              # Complete type definitions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── postcss.config.js
```

## Core Data Models

### Deal
```typescript
{
  id, name, company, stage, value, probability,
  stakeholders[], calls[], objections[], 
  competitorMentions[], pricingDiscussions[],
  insights: DealInsights  // AI-generated
}
```

### Call
```typescript
{
  id, date, duration, participants[],
  transcript, summary, keyMoments[],
  actionItems[], sentiment, nextSteps
}
```

### Objection
```typescript
{
  category, description, context,
  responseGiven, outcome, effectiveness,
  raisedBy (stakeholder), callId
}
```

### Briefing
```typescript
{
  executiveSummary,
  stakeholderUpdates[],
  objectionStatus[],
  competitorIntel[],
  pricingPosition,
  recommendedTalkTrack[],
  riskAssessment,
  confidenceLevel
}
```

### ObjectionPlaybook
```typescript
{
  category,
  triggerPatterns[],
  successfulResponses[],
  failedResponses[],
  bestPractice,
  usageCount
}
```

## AI Insight Generation

The system automatically generates insights from deal data:

1. **Objection Analysis** — Categories, frequency, resolution rates, effectiveness
2. **Competitor Threats** — Mentions, sentiment, deal coverage
3. **Stakeholder Risk Map** — Influence × Sentiment = Risk Level
4. **Pricing Sensitivity** — Budget pushbacks, discount requests
5. **Buying Signals** — Extracted from key moments
6. **Risk Factors** — Auto-identified from patterns
7. **Confidence Score** — Stage + sentiment + objections + competitors
8. **Recommended Approach** — Stage-aware strategy
9. **Next Best Action** — Signal-driven or risk-mitigation

## Briefing Generation

Pre-call briefings synthesize:
- **Executive summary** — One-paragraph deal state
- **Stakeholder updates** — Sentiment changes, new concerns, engagement
- **Objection status** — Active/resolved/escalated with playbook responses
- **Competitor intel** — Mentions, win themes, weaknesses
- **Pricing position** — Budget, discounts, packaging, strategy
- **Talk tracks** — 6 structured tracks with objection handlers
- **Risk assessment** — Overall risk, health score, factor mitigations

## Playbook Learning Loop

```
Call happens → Objections logged → Response recorded → Outcome tracked
                                    ↓
                         Effective? → Add to successful responses
                         Failed? → Add to failed responses with reason
                                    ↓
                         Pattern analysis → Best practice updated
                                    ↓
                         Next briefing → Recommends proven responses
```

## Extending for Production

### Database
Replace `localStorage` in `dealStore.ts` with:
- PostgreSQL + Prisma
- MongoDB + Mongoose
- Supabase / Firebase

### Real-time
Add WebSocket/SSE for:
- Live call transcription
- Real-time briefing updates
- Team collaboration

### AI Integration
Replace keyword extraction in `processCall()` with:
- OpenAI / Anthropic API for transcript analysis
- Custom fine-tuned models for objection detection
- Vector embeddings for semantic search

### Auth & Teams
Add:
- NextAuth.js for authentication
- Role-based access (rep, manager, leadership)
- Team workspaces

### Integrations
- Gong/Chorus call recording
- Salesforce/HubSpot CRM sync
- Slack/Teams notifications
- Calendar for call scheduling

## Demo Data

The app initializes with 3 sample deals demonstrating:
1. **Acme Corp** — Negotiation stage, pricing objections, Databricks competitor
2. **TechStart** — Proposal stage, build-vs-buy objection
3. **GlobalRetail** — Qualification stage, Snowflake incumbent, vendor consolidation

## License

MIT — Build your own deal intelligence.