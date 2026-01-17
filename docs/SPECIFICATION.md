# Axis Council - Project Specification

## Overview

Axis Council is an AI module for a file-sharing website that serves as an engaging "gimmick" feature to attract users. It implements a council of multiple LLMs that collectively answer user queries through a transparent deliberation process.

### Core Concept

1. User submits a query
2. Multiple council members (LLMs) independently generate answers
3. Council members evaluate each other's answers through blind voting
4. A Senator (neutral judge LLM) synthesizes the final verdict with justification
5. Full transparency throughout the process

---

## Architecture

### Council Structure

| Role            | Name         | Count | Purpose                                      |
| --------------- | ------------ | ----- | -------------------------------------------- |
| Council Members | Axis Alpha   | 1     | Precise, fact-focused analyst                |
|                 | Axis Beta    | 1     | Creative, insightful thinker                 |
|                 | Axis Gamma   | 1     | Practical, user-focused advisor              |
| Senator         | Senator Axis | 1     | Final arbiter, delivers verdict              |
| **Total**       |              | **4** | 3 answering + 1 judging                      |

### Reserved for Future Expansion

| Name         | Persona                                    |
| ------------ | ------------------------------------------ |
| Axis Delta   | Thorough and methodical, comprehensive     |
| Axis Epsilon | Skeptical and critical, questions assumptions |

---

## Council Process Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      AXIS COUNCIL FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PHASE 1: Answer Generation (Sequential, Streamed)             │
│  ─────────────────────────────────────────────────              │
│  1. Axis Alpha receives query → generates answer (streamed)    │
│  2. Axis Beta receives query → generates answer (streamed)     │
│  3. Axis Gamma receives query → generates answer (streamed)    │
│                                                                 │
│  PHASE 2: Blind Voting (Parallel)                               │
│  ─────────────────────────────────────────────────              │
│  1. Answers are shuffled and anonymized (Response A, B, C)     │
│  2. Each council member rates ALL responses on 4 criteria      │
│  3. LLMs do not know which response is theirs                  │
│  4. Ratings are collected and aggregated                       │
│                                                                 │
│  PHASE 3: Senator Verdict (Streamed)                            │
│  ─────────────────────────────────────────────────              │
│  1. Senator Axis receives all answers + all ratings            │
│  2. Synthesizes final verdict with justification               │
│  3. Provides transparency on decision-making process           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Voting System

### Blind Voting Mechanism

To prevent self-rating bias:
- Answers are shuffled and labeled as "Response A", "Response B", "Response C"
- Council members rate without knowing which response is theirs
- Mapping is revealed only after voting is complete

### Rating Criteria

Each response is rated on a scale of 1-10 for:

| Criterion      | Description                              |
| -------------- | ---------------------------------------- |
| Accuracy       | Factually correct information            |
| Relevance      | Directly answers the user's question     |
| Clarity        | Easy to understand, well-structured      |
| Completeness   | Thorough enough without being excessive  |

### Score Aggregation

- Each criterion is scored 1-10
- Average score calculated per response
- All ratings passed to Senator for final verdict

---

## Technical Stack

### Backend

| Component     | Technology                                       |
| ------------- | ------------------------------------------------ |
| Framework     | Python + FastAPI                                 |
| LLM Provider  | OpenAI-compatible API (Azure, OpenAI, LM Studio, Ollama, etc.) |
| Streaming     | Server-Sent Events (SSE)                         |
| Auth          | JWT validation                                   |
| Rate Limiting | In-memory (pluggable for database later)         |
| Deployment    | Docker container                                 |

### Frontend

| Component   | Technology                     |
| ----------- | ------------------------------ |
| Framework   | React + TypeScript             |
| Build Tool  | Vite                           |
| Styling     | Tailwind CSS                   |
| State       | Zustand or React Context       |
| Storage     | localStorage (sessions)        |
| Deployment  | Docker container (nginx)       |

---

## Configuration

### LLM Provider Setup (Provider-Agnostic)

The system works with any OpenAI-compatible API:

| Provider     | Base URL                                  | API Key      | Model Name           |
| ------------ | ----------------------------------------- | ------------ | -------------------- |
| OpenAI       | `https://api.openai.com/v1`               | Required     | `gpt-4o-mini`        |
| Azure OpenAI | `https://your-resource.openai.azure.com/v1` | Required   | Deployment name      |
| LM Studio    | `http://localhost:1234/v1`                | Not required | `local-model`        |
| Ollama       | `http://localhost:11434/v1`               | Not required | `qwen2.5:8b`         |
| Together.ai  | `https://api.together.xyz/v1`             | Required     | Model identifier     |
| Groq         | `https://api.groq.com/openai/v1`          | Required     | Model identifier     |

```
LLM_BASE_URL=http://localhost:1234/v1
LLM_API_KEY=not-needed
```

> **Note for Azure OpenAI:** The `model` in config is the deployment name (nickname) given to the model in Azure OpenAI, not the actual model name like "gpt-4o-mini".

### Council Member Configuration

```python
COUNCIL_MEMBERS = [
    {
        "name": "Axis Alpha",
        "model": "gpt-4o-mini",  # Model name or Azure deployment name
        "temperature": 0.3,  # More focused/deterministic
        "persona": "You are Axis Alpha, a precise and analytical council member..."
    },
    # ... additional members
]
```

### Rate Limiting

- **Limit:** 20 queries per day per user
- **Storage:** In-memory (resets on server restart), pluggable for database later
- **Scope:** Each question counts (including follow-ups in same session)

---

## User Experience

### Session Management

- Sessions stored in browser localStorage
- Sessions persist across page refreshes (same browser)
- Different device/browser = fresh start (no cross-device sync)
- Session list shows first few words of initial query
- Users can rename sessions via 3-dot menu
- "+" button to create new session

### Conversation History

- Follow-up questions supported within a session
- Conversation history sent in compact form for context
- New sessions do not carry forward previous session history
- Each question counts against rate limit (including follow-ups)

### UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [Theme Toggle]                                    Axis Council │
├──────────────────┬──────────────────────────────────────────────┤
│                  │                                              │
│  [+] New Session │         COUNCIL PROCESS                      │
│                  │                                              │
│  ┌────────────┐  │   [Robot Icon] Axis Alpha                    │
│  │ Session 1  │  │   ┌──────────────────────────────────────┐   │
│  │ "Tell me..." │ │   │ "Answer text..." (GRAYED OUT 50%)    │   │
│  ├────────────┤  │   └──────────────────────────────────────┘   │
│  │ Session 2  │  │                                              │
│  │ "What is..."│  │   [Robot Icon] Axis Beta                    │
│  └────────────┘  │   ┌──────────────────────────────────────┐   │
│                  │   │ "Answer text..." (GRAYED OUT 50%)    │   │
│                  │   └──────────────────────────────────────┘   │
│                  │                                              │
│                  │   [Robot Icon] Axis Gamma                    │
│                  │   ┌──────────────────────────────────────┐   │
│                  │   │ "Answer text..." (GRAYED OUT 50%)    │   │
│                  │   └──────────────────────────────────────┘   │
│                  │                                              │
│                  │   ┌──────────────────────────────────────┐   │
│                  │   │ VOTING RESULTS (shown all at once)   │   │
│                  │   │ Alpha votes: A=8, B=7, C=6           │   │
│                  │   │ Beta votes:  A=7, B=9, C=5           │   │
│                  │   │ Gamma votes: A=8, B=8, C=7           │   │
│                  │   └──────────────────────────────────────┘   │
│                  │                                              │
│                  │   ╔══════════════════════════════════════╗   │
│                  │   ║ [Senator Icon] SENATOR AXIS          ║   │
│                  │   ║ FINAL VERDICT (PROMINENT, 100%)      ║   │
│                  │   ║                                      ║   │
│                  │   ║ "The council has deliberated, and    ║   │
│                  │   ║  Axis Alpha's response received the  ║   │
│                  │   ║  highest ratings..."                 ║   │
│                  │   ╚══════════════════════════════════════╝   │
│                  │                                              │
│                  ├──────────────────────────────────────────────┤
│                  │  [Type your question here...]    [Send]      │
└──────────────────┴──────────────────────────────────────────────┘
```

### Visual Hierarchy

| Element                | Opacity/Visibility | Styling                          |
| ---------------------- | ------------------ | -------------------------------- |
| Council member answers | 50% (grayed out)   | Readable but de-emphasized       |
| Voting results         | 70%                | Informative, shown all at once   |
| Senator's verdict      | 100% (prominent)   | Full opacity, border, larger     |

### Council Member Avatars

Each council member has a robot/avatar icon for visual identity:
- Axis Alpha: Purple robot icon
- Axis Beta: Cyan robot icon  
- Axis Gamma: Orange robot icon
- Senator Axis: Gold senator icon (larger, more prominent)

### Theme System

- Light/Dark mode toggle
- Preference persisted in localStorage
- Global CSS variables for easy customization
- Colors can be updated to match main dashboard theme

```css
:root {
  --color-primary: #3b82f6;
  --color-background: #ffffff;
  --color-surface: #f3f4f6;
  --color-text: #1f2937;
  /* ... etc */
}

[data-theme="dark"] {
  --color-primary: #60a5fa;
  --color-background: #111827;
  /* ... etc */
}
```

---

## Error Handling

| Scenario              | User Message                                    |
| --------------------- | ----------------------------------------------- |
| Rate limit exceeded   | "You have reached your daily freemium limit"    |
| Not logged in         | "Please login first to use Axis Council"        |
| API/Server failure    | "Council is temporarily unavailable"            |

---

## Content Moderation

- System prompts enforce family-friendly responses
- No profanity, bad words, or derogatory remarks
- Moderate, user-friendly tone
- Response length limited to ~10 lines via system prompt

---

## Deployment

### Docker-Based Deployment

Project is packaged as Docker containers for portability:
- Backend: Python 3.11 + FastAPI + uvicorn
- Frontend: Node 20 build + nginx static serving
- docker-compose.yml for local development/testing

### Handoff to Main Team

The other team receives:
1. Complete source code (backend + frontend)
2. Dockerfiles for both services
3. docker-compose.yml for easy testing
4. .env.example with all required configuration
5. README.md with setup and integration instructions

They can deploy on any infrastructure:
- EC2 / Azure VM
- ECS / Azure Container Apps
- Lambda (container mode)
- Any Docker-compatible platform

### Environment Variables

```bash
# LLM Provider (OpenAI-compatible)
LLM_BASE_URL=http://localhost:1234/v1
LLM_API_KEY=not-needed

# For Azure OpenAI only
AZURE_API_VERSION=2024-02-15-preview

# JWT Authentication
JWT_SECRET=your-jwt-secret
JWT_ALGORITHM=HS256

# Rate Limiting
RATE_LIMIT_PER_DAY=20

# CORS
FRONTEND_URL=http://localhost:5173  # Update for production
```

---

## API Endpoints

### Backend Endpoints

| Method | Endpoint            | Description                    | Auth Required |
| ------ | ------------------- | ------------------------------ | ------------- |
| POST   | /api/council/query  | Submit query, receive SSE stream | Yes (JWT)     |
| GET    | /api/health         | Health check                   | No            |

### SSE Event Types

| Event             | Description                              |
| ----------------- | ---------------------------------------- |
| council_start     | Council process begins                   |
| thinking          | Council member is generating response    |
| answer_chunk      | Streaming chunk of answer                |
| answer_complete   | Full answer from council member          |
| voting_start      | Voting phase begins                      |
| voting_complete   | All ratings collected, mapping revealed  |
| senator_start     | Senator deliberation begins              |
| verdict_chunk     | Streaming chunk of verdict               |
| verdict_complete  | Final verdict delivered                  |
| council_complete  | Process complete, includes remaining quota |
| error             | Error occurred                           |

---

## Cost Considerations

### Token Usage Per Query (Estimated)

| Phase             | Input Tokens | Output Tokens |
| ----------------- | ------------ | ------------- |
| 3 LLMs answer     | ~930         | ~450          |
| 3 LLMs rate       | ~2,100       | ~300          |
| Senator verdict   | ~1,100       | ~300          |
| **Total**         | **~4,130**   | **~1,050**    |

### Cost Per Query (Azure OpenAI Pricing)

| Model         | Approximate Cost |
| ------------- | ---------------- |
| GPT-4o        | ~$0.02 (2 cents) |
| GPT-4o-mini   | ~$0.001 (0.1 cents) |

### Recommended Configuration

- Council Members: GPT-4o-mini (cost-effective)
- Senator Axis: GPT-4o (better judgment quality)
- Estimated cost: ~$0.005-0.01 per query with mixed models

---

## Verification Checklist

After implementation, verify:

- [ ] 3 council members generate answers sequentially with streaming
- [ ] Answers are anonymized for blind voting
- [ ] Each council member rates all responses on 4 criteria
- [ ] Senator receives all data and generates final verdict
- [ ] SSE streaming works for all phases
- [ ] JWT authentication validates logged-in users
- [ ] Rate limiting enforces 20 queries/day per user
- [ ] Sessions persist in localStorage
- [ ] Session renaming works
- [ ] New session button works
- [ ] Follow-up questions maintain context
- [ ] Light/Dark theme toggle works
- [ ] Theme colors use CSS variables (easy to customize)
- [ ] Error messages display correctly
- [ ] Content is family-friendly
- [ ] Response length is reasonable (~10 lines)
- [ ] Docker build works
- [ ] docker-compose up starts both services
- [ ] Adding new council member requires only config change

---

## Future Enhancements (Out of Scope for MVP)

- Cross-device session sync (requires database)
- Query history analytics
- Custom rubric configuration
- Multiple council "rooms" with different personalities
- Voice input/output
- File context (analyze uploaded files)
