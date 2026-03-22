# Frontend-Backend Merge Guide

Reference document for integrating a new frontend with the existing LLM Council backend.

---

## 1. Backend Changes Required

The backend is frontend-agnostic. Only minimal config changes are needed.

### 1.1 CORS — `backend/.env`

Update `FRONTEND_URL` to match the new frontend's origin:

```bash
# If new frontend runs on port 3000:
FRONTEND_URL=http://localhost:3000

# For development (allow any origin):
FRONTEND_URL=*
```

This value is used in `backend/app/main.py:15`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    ...
)
```

If you need multiple origins (e.g. old + new frontend during migration), change `main.py` to:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    ...
)
```

### 1.2 Mode Naming — `backend/app/models/schemas.py:40`

The backend accepts exactly these mode values:

```python
mode: Literal["fast", "comprehensive", "deep"] = "comprehensive"
```

If the new frontend uses "full" as a UI label, it must map it to `"comprehensive"` when sending the request. Alternatively, to accept "full" as a backend value, update the schema:

```python
mode: Literal["fast", "comprehensive", "full", "deep"] = "comprehensive"
```

And handle it in `backend/app/services/council.py:237` — treat `"full"` same as `"comprehensive"`:

```python
if mode == "fast":
    # skip voting
else:
    # comprehensive/full/deep - do voting
```

### 1.3 Word Limit Sync — `backend/app/config.py:108`

```python
MAX_QUERY_WORDS = 200
```

The new frontend should enforce the same limit client-side. The backend also enforces it at `backend/app/routers/council.py:43`.

---

## 2. API Endpoints

### 2.1 Health Check

```
GET /api/health

Response:
{ "status": "healthy", "service": "llm-council" }
```

### 2.2 Get Available Models

```
GET /api/council/config/models

Response:
{
  "council_models": [
    { "id": "claude-haiku-3-5", "name": "Claude Haiku 3.5", "provider": "anthropic", "description": "Fast, cost-effective" },
    { "id": "grok-4-1-fast", "name": "Grok 4.1 Fast", "provider": "xai", "description": "Quick responses" },
    { "id": "gpt-4o-mini", "name": "GPT-4o Mini", "provider": "azure", "description": "Efficient and capable" },
    { "id": "gpt-4o", "name": "GPT-4o", "provider": "azure", "description": "Most capable" }
  ],
  "senator_models": [
    { "id": "gpt-4-1", "name": "GPT-4.1", "provider": "azure", "description": "Highest quality reasoning" },
    { "id": "claude-sonnet-3-5", "name": "Claude Sonnet 3.5", "provider": "anthropic", "description": "Excellent analysis" },
    { "id": "grok-4", "name": "Grok 4", "provider": "xai", "description": "Advanced reasoning" },
    { "id": "gpt-4o", "name": "GPT-4o", "provider": "azure", "description": "Reliable and capable" }
  ]
}
```

### 2.3 Get Available Personas

```
GET /api/council/config/personas

Response:
{
  "personas": [
    { "id": "none", "name": "No Persona", "description": "...", "temperature": 0.5 },
    { "id": "skeptic", "name": "The Skeptic", "description": "...", "temperature": 0.3 },
    { "id": "explainer", "name": "The Explainer", ... },
    { "id": "contrarian", "name": "The Contrarian", ... },
    { "id": "maximalist", "name": "The Maximalist", ... },
    { "id": "minimalist", "name": "The Minimalist", ... },
    { "id": "historian", "name": "The Historian", ... },
    { "id": "futurist", "name": "The Futurist", ... },
    { "id": "pragmatist", "name": "The Pragmatist", ... },
    { "id": "analyst", "name": "The Analyst", ... },
    { "id": "empath", "name": "The Empath", ... }
  ],
  "senator_personas": [
    { "id": "neutral", "name": "The Neutral Judge", ... },
    { "id": "analyst", "name": "The Analyst", ... },
    { "id": "pragmatist", "name": "The Pragmatist", ... },
    { "id": "historian", "name": "The Historian", ... },
    { "id": "explainer", "name": "The Explainer", ... }
  ]
}
```

### 2.4 Submit Query (SSE Stream)

```
POST /api/council/query
Content-Type: application/json
```

#### Request Body

```json
{
  "query": "What is the best programming language?",
  "session_history": [
    { "role": "user", "content": "previous question" },
    { "role": "assistant", "content": "previous answer", "member_name": "Senator" }
  ],
  "mode": "comprehensive",
  "council_config": {
    "council_members": [
      { "persona_id": "none", "model_id": "gpt-4o-mini" },
      { "persona_id": "skeptic", "model_id": "gpt-4o" },
      { "persona_id": "explainer", "model_id": "gpt-4o" }
    ],
    "senator_persona": "neutral",
    "senator_model": "gpt-4o",
    "custom_persona": null
  }
}
```

#### Field Constraints

| Field                      | Type   | Required        | Constraints                                                       |
| -------------------------- | ------ | --------------- | ----------------------------------------------------------------- |
| `query`                    | string | Yes             | Max 200 words, non-empty                                          |
| `session_history`          | array  | No              | Default `[]`                                                      |
| `mode`                     | string | No              | `"fast"`, `"comprehensive"`, or `"deep"`. Default `"comprehensive"` |
| `council_config`           | object | No              | If null, uses 3x "none" persona + gpt-4o defaults                 |
| `council_members`          | array  | Yes (in config) | Min 2, Max 8 items                                                |
| `custom_persona.name`      | string | Yes (if custom) | Max 50 chars                                                      |
| `custom_persona.description` | string | Yes (if custom) | Max 500 chars                                                   |
| `custom_persona.temperature` | float | No              | 0.1 to 1.0, default 0.5                                          |

#### Custom Persona (optional)

If the user creates a custom persona, include:

```json
{
  "council_config": {
    "council_members": [
      { "persona_id": "custom", "model_id": "gpt-4o" },
      { "persona_id": "skeptic", "model_id": "gpt-4o" },
      { "persona_id": "none", "model_id": "gpt-4o" }
    ],
    "senator_persona": "neutral",
    "senator_model": "gpt-4o",
    "custom_persona": {
      "name": "The Pirate",
      "description": "Answers everything like a pirate captain",
      "temperature": 0.8,
      "model_id": "gpt-4o"
    }
  }
}
```

Note: `persona_id: "custom"` tells the backend to use the `custom_persona` object.

---

## 3. SSE Event Stream Format

The `/api/council/query` endpoint returns Server-Sent Events, NOT regular JSON.

### How to consume (JavaScript)

```javascript
const response = await fetch(`${API_URL}/api/council/query`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(requestBody),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const text = decoder.decode(value);
  // Parse SSE format: "event: <type>\ndata: <json>\n\n"
  const lines = text.split("\n");
  // ... parse event type and JSON data
}
```

### Event Sequence

Events arrive in this order:

```
1. council_start        -> { "phase": "answering", "mode": "comprehensive" }

--- Per council member (repeats 2-8 times) ---
2. thinking             -> { "member": "Axis Alpha - No Persona", "member_id": "none" }
3. answer_chunk         -> { "member": "...", "member_id": "...", "chunk": "partial text" }
   (many chunks)
4. answer_complete      -> { "member": "...", "member_id": "...", "full_answer": "complete text" }

--- Voting (skipped if mode="fast") ---
5. voting_start         -> { "phase": "voting" }
   OR voting_skipped    -> { "phase": "skipped" }
6. voting_complete      -> { "results": [...], "mapping": {...}, "votes": {...} }

--- Senator ---
7. senator_start        -> { "phase": "verdict", "member": "Senator - The Neutral Judge" }
8. verdict_chunk        -> { "chunk": "partial verdict text" }
   (many chunks)
9. verdict_complete     -> { "verdict": "full text", "highest_rated_member_id": "...", "highest_rated_member_name": "..." }

--- Final ---
10. token_summary       -> { "council_responses": {...}, "voting": {...}, "senator": {...}, "total": {...} }
11. council_complete    -> { "status": "complete", "queries_remaining": 999 }
```

### Error Events

Can arrive at any point:

```json
{
  "event": "error",
  "data": {
    "error": "User-friendly message here",
    "code": "MODEL_NOT_AVAILABLE"
  }
}
```

Error codes: `QUERY_TOO_LONG`, `EMPTY_QUERY`, `MODEL_NOT_AVAILABLE`, `RATE_LIMIT_EXCEEDED`, `TIMEOUT_ERROR`, `CONNECTION_ERROR`, `COUNCIL_ERROR`

HTTP-level errors (not SSE):
- `401` -- auth required (if `AUTH_DISABLED=false`)
- `429` -- rate limit exceeded
- `422` -- validation error (wrong request shape)

---

## 4. Voting Results Shape

When `voting_complete` fires, `results` is an array sorted by score (highest first):

```json
{
  "results": [
    {
      "response_label": "Response B",
      "member_id": "skeptic",
      "member_name": "Axis Beta - The Skeptic",
      "member_temperature": 0.3,
      "average_scores": {
        "accuracy": 7.5,
        "relevance": 8.0,
        "clarity": 7.0,
        "completeness": 6.5,
        "factual_confidence": 7.2
      },
      "overall_average": 7.32,
      "all_ratings": {}
    }
  ],
  "mapping": {
    "Response A": "Axis Alpha - No Persona",
    "Response B": "Axis Beta - The Skeptic",
    "Response C": "Axis Gamma - The Explainer"
  }
}
```

Scoring weights: Accuracy 30%, Relevance 25%, Clarity 15%, Completeness 15%, Factual Confidence 15%.

---

## 5. Token Summary Shape

```json
{
  "council_responses": { "prompt_tokens": 360, "completion_tokens": 900, "total_tokens": 1260, "total_words": 0 },
  "voting":            { "prompt_tokens": 500, "completion_tokens": 200, "total_tokens": 700,  "total_words": 0 },
  "senator":           { "prompt_tokens": 800, "completion_tokens": 250, "total_tokens": 1050, "total_words": 0 },
  "total":             { "prompt_tokens": 1660, "completion_tokens": 1350, "total_tokens": 3010, "total_words": 0 }
}
```

---

## 6. Summary of Backend Files to Touch

| Change                | File                            | Line(s)         | Notes                            |
| --------------------- | ------------------------------- | --------------- | -------------------------------- |
| CORS origin           | `backend/.env`                  | `FRONTEND_URL=` | Match new frontend URL           |
| Multiple CORS origins | `backend/app/main.py`           | 15              | Change to list if needed         |
| Accept "full" mode    | `backend/app/models/schemas.py` | 40              | Add `"full"` to Literal (optional) |
| Word limit            | `backend/app/config.py`         | 108             | Sync with frontend if changed    |

Everything else (models, personas, routes, services) stays untouched.

---

## 7. Running the Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env     # edit with real credentials
uvicorn app.main:app --reload --port 8001
```

API docs auto-generated at: `http://localhost:8001/docs`
