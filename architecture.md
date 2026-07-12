# Architecture Notes — MoneyMentor AI

**Course:** AIM Postgraduate Artificial Intelligence
**Reference:** Week 4 — Graded Assignment 4.2 (aligned with Idea Validation Report and PRD)

## System Overview

MoneyMentor AI is a three-layer web application: a Next.js frontend, an API layer that
orchestrates calls to an LLM provider, and a lightweight database for persisting user goals,
progress, and coaching context. Per the PRD's constraints, the app never custodies funds, links
bank accounts, executes trades, or presents its output as licensed financial advice — it is an
education and planning layer only.

## High-Level Diagram (textual)

```
┌─────────────────┐      ┌──────────────────────┐      ┌────────────────────┐
│   Next.js 14     │      │  API Layer              │      │   LLM Provider        │
│   (App Router)   │─────▶│  (Next.js API routes)   │─────▶│   OpenAI or Claude    │
│   + Tailwind CSS │◀─────│                         │◀─────│   (Vercel AI SDK)     │
└─────────────────┘      └──────────────────────┘      └────────────────────┘
        │                          │
        │                          ▼
        │                ┌──────────────────┐
        │                │   PostgreSQL       │
        │                │   (Supabase)       │
        │                │   - users          │
        │                │   - goals          │
        │                │   - contributions   │
        │                │   - chat_sessions   │
        │                └──────────────────┘
        ▼
┌─────────────────┐
│  Auth Provider    │
│  (Supabase Auth)  │
└─────────────────┘
```

## Components

### 1. Frontend — Next.js 14 (App Router) + TypeScript + Tailwind CSS
Maps to the PRD's four MVP features plus the dashboard:
- **Authentication Screens** 
- **AI Financial Coach** — chat window UI
- **Savings Plan Generator** — profile input form (age, income, expenses, goal, timeframe) and
  roadmap display
- **Investment Education** — topic browser / on-demand concept explainer UI
- **Investment Readiness Guide** — checklist and platform-evaluation criteria display
- **Goal Progress Dashboard** — goal summary card, progress bar, on-track indicator

Design constraint (per PRD Section 6): interface must use plain language, minimal jargon, and
be understandable by users with low digital literacy — no dense tables or financial-report-style
UI patterns.

### 2. API Layer — Next.js API Routes
- `Post/api/chat` — AI Financial Coach conversational endpoint
- `Post/api/plan/generate` — Savings Plan Generator endpoint
- `Post/api/education/explain` — Investment Education concept-explainer endpoint
- `Post/api/readiness-guide` — Investment Readiness Guide endpoint
- `Post/api/goals:id/contributions` — CRUD for goals and logged contributions (Goal Progress Dashboard)

Responsibilities

- Authentication checks
- Input validation
- AI orchestration
- Database operations
- Output validation
- Error handling

### 3. AI Layer — OpenAI or Claude via Vercel AI SDK
Two output modes, per spec.md:
1. **Conversational (free-form)** — used by the AI Financial Coach and Investment Education
   features
2. **Structured generation (JSON schema)** — used by the Savings Plan Generator, so the roadmap
   (monthly target, milestones) can be validated and rendered reliably

All prompts enforce, per the PRD's risk mitigations:
- Plain-language output, no undefined jargon
- Persistent educational-only disclaimer
- No product-specific or brokerage-specific recommendations (mitigates "Financial Advice Misinterpretation" risk)
- Prompt guardrails against hallucinated figures (mitigates "AI Hallucinations" risk)

### 4. Database — PostgreSQL via Supabase
Tables (minimum):
- `users` — id, email, created_at (managed via Supabase Auth)
- `goals` — id, user_id, goal_name, target_amount, target_date, monthly_target, created_at
- `contributions` — id, goal_id, amount, logged_at (manual entry only — no bank linking, per PRD non-goals)
- `chat_sessions` — id, session_id, role, message, created_at (stores messages for coaching continuity)

### 5. Auth — Supabase Auth
Required so goals, contributions, and coaching history persist per user across sessions.

Responsibilities
- User registration
- User login
- User logout
- Session management
- Route protection

Protected Resources:
- Goals
- Contributions
- Dashboard
- Saved coaching history

Authorization Rules
- Users can only access their own goals.
- Users can only access their own contribution records.
- Users can only access their own coaching history.
- Unauthorized requests return HTTP 401.
- Ownership violations return HTTP 403.

### 6. Deployment — Vercel + Github + GitHub Actions
- Frontend and API routes deployed to Vercel
- GitHub Actions runs lint + tests on every push/PR + Tests + Build + Deploy to Vercel, blocks merge on failure
- Environment variables (LLM API key, database URL, auth keys) set in Vercel project settings — never committed to the repo (per PRD Constraint: "All secrets must be stored in environment variables")

## Data Flow — Example: "Generate a savings plan"

1. User Signs in.
2. User fills in the profile form (age, monthly income, monthly expenses, savings goal, timeframe)
3. Frontend calls `POST /api/plan/generate`
4. Backend validates input server-side (even though the client already validated it)
5. Backend builds a structured-output prompt and calls the LLM with a JSON schema
6. Backend validates the LLM's JSON response; if the monthly target doesn't mathematically reach the goal by the target date, the backend recalculates it deterministically before returning
7. Backend persists the goal to the `goals` table
8. Frontend renders the roadmap and links to the Goal Progress Dashboard

## Data Flow — Example: "Log a contribution and check progress"

1. User signs in.
2. User manually logs a contribution amount on the Goal Progress Dashboard
3. Frontend calls `POST /api/goals/:id/contributions`
4. Backend validates the amount and writes to the `contributions` table
5. Backend recalculates cumulative saved amount, progress %, and on-track status
6. Frontend re-renders the progress bar and status indicator

## Risk-to-Architecture Mapping

Per the Idea Validation Report and PRD risk sections, each identified risk maps to a concrete architectural mitigation:

| Risk | Architectural Mitigation |
|---|---|
| AI generates incorrect information / hallucinations | Server-side validation of all structured AI outputs; deterministic fallback calculation for the savings plan; prompt guardrails |
| Users interpret guidance as professional financial advice | Disclaimer flag enforced at the API layer, not just the UI, so it can't be silently dropped by a frontend change |
| User confusion over financial concepts | Investment Education feature with plain-language + example requirement built into the prompt contract |
| Unauthorised access |
| Data exposure |
| Low user engagement | Goal Progress Dashboard with milestones and on-track status, backed by the `contributions` table |
| Regulatory/legal exposure from fund handling | No bank linking, no payment processing, no trade execution anywhere in the architecture — enforced by simply not building those integrations into v1 |

## Key Non-Functional Requirements
- **No hardcoded secrets** — all API keys and DB URLs via environment variables; protected routes require authentication
- **Input validation** - on every API route (both client and server side); retry logic for AI failures; Fallback calculations for savings plans
- **Response time** - chat and education endpoints under 8 seconds; savings plan generation under 10 seconds (per spec.md acceptance criteria)
- **Graceful AI failure handling** — friendly retry message on LLM provider failure, never a raw error
- **Accessibility** — plain language, high color contrast, readable font sizes by default, usable by low digital-literacy users on both desktop and mobile web
- **Scalability** - Stateless API architecture; Managed PostgreSQL database;  Serverless deployment on Vercel