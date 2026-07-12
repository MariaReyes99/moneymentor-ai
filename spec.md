# MoneyMentor AI — spec.md

**Course:** AIM Postgraduate Artificial Intelligence
**Project:** MoneyMentor AI
**Reference:** Week 4 — Graded Assignment 4.2 (aligned with Idea Validation Report and PRD)

## Product Summary

MoneyMentor AI is a beginner-friendly, AI-powered financial coach. It delivers personalized savings guidance, plain-language investment education, an investment readiness guide, and authenticated goal tracking through a responsive web interface designed for users of any age or digital literacy level.
The app is educational and planning-only: it never custodies funds, executes trades, links bank accounts, or presents its output as licensed financial advice.
Users can create accounts and securely sign in using Supabase Authentication to save goals, contributions, and coaching history across sessions.

---

## Feature 1 — AI Financial Coach

### Feature
Conversational chat interface where users describe their financial situation and goals in
everyday language and receive plain-language coaching in return.

### Inputs
- User message (free text)
- Conversation history (for context continuity)

### Processing
AI generates:
- A plain-language response addressing the user's question or situation
- A persistent educational-only disclaimer on the first message of every session
- No product-specific or brokerage-specific recommendations

### Outputs
- Chat reply (plain language, beginner-safe)
- Disclaimer flag (shown / already shown this session)

### Acceptance Criteria
Given a signed-in user with a financial question
When the user sends a message in the AI Financial Coach
Then the system returns a plain-language response in under 8 seconds, with the educational
disclaimer shown on the first message of the session.

Given a user submits an empty message
When the user clicks Send
Then the system returns a validation error and does not call the AI model.

---

## Feature 2 — Personalized Savings Plan Generator

### Feature
AI-generated savings plan based on the user's financial profile.

### Inputs
- Age
- Monthly income
- Monthly expenses
- Savings goal (amount + description)
- Timeframe (target date or duration)

### Processing
AI generates:
- Monthly savings target
- Goal timeline with milestones
- Practical, plain-language saving recommendations

### Outputs
- Savings roadmap (monthly target + milestone dates)
- Goal timeline
- Recommended next actions (e.g. "set up an automatic monthly transfer")

### Acceptance Criteria
Given a user has entered age, monthly income, monthly expenses, savings goal, and timeframe
When the user clicks Generate Plan
Then the system returns a customized savings roadmap with a monthly savings target and
milestone timeline in less than 10 seconds.

Given a user enters a savings goal with a target date in the past
When the user clicks Generate Plan
Then the system returns a validation error ("Target date must be in the future") and does not
call the AI model.

Given the AI-generated monthly savings target does not mathematically reach the goal by the
target date
When the system validates the AI's response
Then the system recalculates the target deterministically (goal amount ÷ months remaining)
before returning it to the user, rather than displaying an inconsistent plan.

---

## Feature 3 — Plain-Language Investment Education

### Feature
On-demand explanations of financial and investment concepts in beginner-friendly language
(e.g. "What is investing?", "What is compound interest?", "What is risk tolerance?", "What is
an ETF?").

### Inputs
- User's question or selected topic
- Optional: user's stated experience level (beginner / advanced mode)

### Processing
AI generates:
- A plain-language explanation of the requested concept
- A relatable example or analogy
- A suggested related topic to explore next

### Outputs
- Concept explanation (plain language, max ~150 words)
- Example/analogy
- Related-topic suggestion

### Acceptance Criteria
Given a user selects or asks about a financial concept
When the request is submitted
Then the system returns a plain-language explanation with at least one example, using no
undefined jargon, in under 8 seconds.

Given a user has selected "beginner mode"
When any concept is explained
Then the response avoids technical terminology entirely or defines every technical term used
in the same response.

---

## Feature 4 — Investment Readiness Guide

### Feature
Educational guidance on trusted online investment platforms and the factors to consider when
choosing one — without recommending a specific brokerage, stock, or fund.

### Inputs
- User's savings goal and timeframe (reused from Feature 2, if available)
- User's stated risk tolerance (optional)

### Processing
AI generates:
- General educational criteria for evaluating investment platforms (fees, account minimums,
  platform type)
- Plain-language explanation of common account/platform types (e.g. robo-advisor vs.
  self-directed brokerage), without naming or endorsing a specific company

### Outputs
- Readiness checklist (plain language)
- Platform-evaluation criteria list

### Acceptance Criteria
Given a user requests investment platform guidance
When the system generates a response
Then the response includes general evaluation criteria only and never names or endorses a
specific brokerage, stock, or fund.

---

## Feature 5 — Goal Progress Dashboard

### Feature
Simple visual display of the user's savings goal and progress.

### Inputs
- Saved goal record (from Feature 2): goal name, target amount, target date, monthly target
- User-logged contributions (manual entry, no bank linking)

### Processing
System calculates:
- Cumulative amount saved to date
- Progress percentage toward goal
- On-track / behind-schedule status versus the monthly milestone

### Outputs
- Goal summary card (goal name, target amount, target date)
- Progress bar / percentage
- On-track status indicator

### Acceptance Criteria
Given an authenticated user has an active savings goal with logged contributions
When the user opens the Goal Progress Dashboard
Then the system displays the current progress percentage and on-track status, calculated from the logged contributions, without requiring any bank account connection.
Given an authenticated user has no active goals
When the user opens the Goal Progress Dashboard
Then the system displays a prompt to create a first goal, rather than an empty or broken view.
Given an unauthenticated user
When they attempt to access the Goal Progress Dashboard
Then the system redirects them to Sign In and does not expose any user data.

---

Feature 6 — User Authentication
Feature
Secure user authentication and session management using Supabase Auth.
Purpose
Allow users to:

Create a secure account
Sign in and sign out
Save goals and contributions
Retain coaching history
View personalized dashboard information across sessions

Inputs
Registration

Email address
Password

Sign In

Email address
Password

Processing
System:

Creates user account
Authenticates credentials
Issues secure session token
Associates goals, contributions, and chat history with the authenticated user

Outputs

User account
Active session
Authenticated user profile

Acceptance Criteria
Given a user enters a valid email and password
When they create a new account
Then the system creates a user profile and signs them in.
Given a user enters valid credentials
When they sign in
Then the system grants access to their goals, contributions, and coaching history.
Given a user enters invalid credentials
When they attempt to sign in
Then the system displays a friendly authentication error.
Given a user signs out
When the sign-out process completes
Then the session is terminated and protected routes require authentication again.

---

Routes

GET    /api/goals
POST   /api/goals
PATCH  /api/goals/:id
DELETE /api/goals/:id
``
Purpose
Allow authenticated users to create, update, view, and delete savings goals.
Acceptance Criteria
Given an authenticated user
When they request their goals
Then only goals belonging to that user are returned.
Given an authenticated user
When they create a goal
Then the goal is associated with their user account.
Given a user attempts to access another user's goal
When the request is processed
Then the system returns 403 Forbidden.
Given a user is not authenticated
When they access any Goals CRUD endpoint
Then the system returns 401 Unauthorized.
Given a user deletes a goal
When deletion succeeds
Then the goal is removed and cannot be accessed again.

---

## Cross-Cutting Requirements (apply to all features)

- No hardcoded secrets — all API keys and database URLs via environment variables.
- Every AI-generated response is validated server-side before being returned to the client.
- Every session displays the educational-only disclaimer at least once.
- All user input is validated on both client and server sides.
- If the AI provider call fails, the system returns a friendly retry message — never a raw error or stack trace.
- Authentication must be enforced server-side on all protected routes.
- Users may only access their own goals, contributions, and saved coaching history.
- Supabase Auth is the sole authentication provider for Version 1.

## Out of Scope (v1)
Per the PRD:
- Stock trading
- Direct investment execution
- Financial account integration
- Bank account linking
- Real money transfers
- Personalized licensed financial advice
- Cryptocurrency recommendations
- Native mobile apps
- Advanced portfolio analysis
