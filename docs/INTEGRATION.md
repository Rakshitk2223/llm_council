# Axis Council - Integration Guide

This document is for the **main dashboard development team** who will integrate the Axis Council module into the file-sharing website.

---

## What You're Receiving

| Component | Description |
|-----------|-------------|
| `backend/` | Python FastAPI backend that handles LLM orchestration |
| `frontend/` | React frontend with chat interface |
| `docker-compose.yml` | Container orchestration for both services |
| `.env.example` | Environment configuration template |

---

## Prerequisites

1. **LLM API Access** (any OpenAI-compatible provider)
   - OpenAI, Azure OpenAI, LM Studio, Ollama, Together.ai, Groq, etc.
   - Base URL for the API
   - API Key (if required by provider)
   - Model names or deployment names

2. **JWT Authentication**
   - Share the same JWT secret used by your main authentication system
   - The Axis Council validates JWTs to ensure users are logged in

3. **Docker** (for deployment)

---

## Quick Integration Steps

### Step 1: Configure Environment

```bash
# Copy the template
cp .env.example .env

# Edit with your values
nano .env
```

Required values:
```bash
# LLM Provider (choose one)
# For LM Studio (local testing):
LLM_BASE_URL=http://localhost:1234/v1
LLM_API_KEY=not-needed

# For OpenAI:
# LLM_BASE_URL=https://api.openai.com/v1
# LLM_API_KEY=sk-your-openai-key

# For Azure OpenAI:
# LLM_BASE_URL=https://your-resource.openai.azure.com/v1
# LLM_API_KEY=your-azure-key

# Authentication
JWT_SECRET=your-shared-jwt-secret  # Same as main site
FRONTEND_URL=https://your-domain.com  # Your production URL
```

### Step 2: Update Model Names

Edit `backend/app/config.py` and update the `model` for each council member:

```python
COUNCIL_MEMBERS = [
    {
        "id": "alpha",
        "name": "Axis Alpha",
        "model": "gpt-4o-mini",  # <-- Update this
        # For Azure: use the deployment name (nickname given to the model)
        # For LM Studio/Ollama: use the model you have loaded
        # ...
    },
    # ... same for other members
]

SENATOR = {
    "name": "Senator Axis",
    "model": "gpt-4o",  # <-- Update this (use stronger model if available)
    # ...
}
```

> **Note for Azure OpenAI:** The `model` field should be the deployment name (nickname) you gave to the model, NOT the model name like "gpt-4o-mini".

### Step 3: Match Theme Colors (Optional)

To match your dashboard theme, edit `frontend/src/styles/theme.css`:

```css
:root {
  --color-primary: #your-primary-color;
  --color-background: #your-background-color;
  /* ... update other colors as needed */
}
```

### Step 4: Deploy

**Option A: Docker Compose (Recommended for testing)**
```bash
docker-compose up --build
```

**Option B: Separate Containers**
```bash
# Backend
cd backend
docker build -t axis-council-backend .
docker run -p 8000:8000 --env-file ../.env axis-council-backend

# Frontend
cd frontend
docker build -t axis-council-frontend .
docker run -p 80:80 axis-council-frontend
```

**Option C: Your existing infrastructure**
- Backend: Any Python 3.11+ environment with the dependencies
- Frontend: Static files served by any web server (nginx, Apache, CDN)

---

## Routing Integration

Add a route in your main dashboard that leads to the Axis Council:

```jsx
// In your React Router configuration
<Route path="/ai-council" element={<AxisCouncil />} />

// Or as a link in your navigation
<Link to="/ai-council">AI Council</Link>
```

If hosting as a separate service, just link to it:
```jsx
<a href="https://council.yoursite.com">AI Council</a>
```

---

## Authentication Flow

The Axis Council expects a JWT token in the Authorization header:

```
Authorization: Bearer <user-jwt-token>
```

### How it works:

1. User logs into your main dashboard
2. User clicks "AI Council" link
3. Your frontend passes the JWT to the Axis Council frontend
4. Axis Council frontend includes JWT in API requests
5. Axis Council backend validates the JWT using the shared secret

### Passing the JWT

The frontend expects the JWT in localStorage:

```javascript
// When user logs in to your main site, store the token
localStorage.setItem('auth_token', userJwtToken);

// The Axis Council frontend reads it from there
const token = localStorage.getItem('auth_token');
```

**Alternative:** If you use a different storage mechanism, update `frontend/src/components/Input/InputArea.tsx`:

```typescript
// Change this line to match your auth storage
const authToken = localStorage.getItem('auth_token') || '';

// To something like:
const authToken = yourAuthService.getToken();
```

---

## API Reference

### POST /api/council/query

Submit a query to the council. Returns a Server-Sent Events stream.

**Request:**
```http
POST /api/council/query
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "query": "What is the best programming language?",
  "session_history": [
    {"role": "user", "content": "Previous question"},
    {"role": "assistant", "content": "Previous answer", "member_name": "Axis Alpha"}
  ]
}
```

**Response:** SSE stream with events:
- `council_start` - Process begins
- `thinking` - Council member is generating
- `answer_chunk` - Streaming answer text
- `answer_complete` - Full answer ready
- `voting_start` - Voting phase begins
- `voting_complete` - Ratings revealed
- `senator_start` - Senator deliberating
- `verdict_chunk` - Streaming verdict
- `verdict_complete` - Final verdict ready
- `council_complete` - Process complete

### GET /api/health

Health check endpoint (no auth required).

```http
GET /api/health

Response: {"status": "healthy", "service": "axis-council"}
```

---

## Error Handling

| HTTP Status | Error Code | Message | Cause |
|-------------|------------|---------|-------|
| 401 | AUTH_REQUIRED | "Please login first to use Axis Council" | Missing or invalid JWT |
| 429 | RATE_LIMIT_EXCEEDED | "You have reached your daily freemium limit" | User exceeded 20 queries/day |
| 500 | COUNCIL_ERROR | "Council is temporarily unavailable" | LLM API error or server issue |

---

## Rate Limiting

- Default: 20 queries per user per day
- Stored in-memory (resets on server restart)
- Each question counts (including follow-ups in same session)
- To change the limit, update `RATE_LIMIT_PER_DAY` in `.env`

The rate limiter is designed with a **pluggable interface** for easy database integration:

```python
# Current: In-memory (MVP)
rate_limiter = InMemoryRateLimiter()

# Future: Swap to database when ready
# rate_limiter = DatabaseRateLimiter(db_session)
```

To enable persistent rate limiting:
1. Implement the `RateLimiter` interface in `backend/app/middleware/rate_limit.py`
2. Connect to your database
3. Change one line to use the new implementation

---

## Customization Options

### Change Number of Council Members

Edit `backend/app/config.py`:
- Add new members to the `COUNCIL_MEMBERS` list
- Or uncomment the pre-defined Axis Delta and Axis Epsilon
- The system automatically adjusts

### Change Rate Limit

```bash
# In .env
RATE_LIMIT_PER_DAY=50  # Or whatever limit you want
```

### Change Response Length

Edit the persona in `backend/app/config.py`:
```python
"persona": "... Keep responses under 15 lines ..."  # Change from 10 to 15
```

### Add Custom Voting Criteria

Edit `backend/app/config.py`:
```python
VOTING_CRITERIA = [
    {"id": "accuracy", "name": "Accuracy", "description": "..."},
    {"id": "creativity", "name": "Creativity", "description": "..."},  # Add new
    # ...
]
```

---

## Troubleshooting

### "Council is temporarily unavailable"

1. Check LLM provider credentials in `.env` (LLM_BASE_URL, LLM_API_KEY)
2. Verify model names in `config.py` match your provider's model names
   - For Azure: use deployment names
   - For LM Studio/Ollama: ensure the model is loaded
3. Check backend logs: `docker-compose logs backend`
4. Test your LLM endpoint directly with curl to verify it's working

### "Please login first to use Axis Council"

1. Ensure JWT secret matches between main site and Axis Council
2. Check that JWT is being passed in Authorization header
3. Verify JWT format is `Bearer <token>`

### CORS Errors

1. Update `FRONTEND_URL` in `.env` to match your frontend domain
2. Restart the backend after changing

### Styling Doesn't Match Dashboard

1. Edit CSS variables in `frontend/src/styles/theme.css`
2. Rebuild frontend: `docker-compose up --build frontend`

---

## Support

For issues with:
- **Azure OpenAI**: Check Azure Portal and OpenAI documentation
- **JWT Integration**: Coordinate with your auth team
- **Code Issues**: Review the implementation docs in `backend/BACKEND.md` and `frontend/FRONTEND.md`

---

## File Checklist for Handoff

Ensure you have:

- [ ] `backend/` - Complete backend code
- [ ] `frontend/` - Complete frontend code
- [ ] `docker-compose.yml` - Container configuration
- [ ] `.env.example` - Environment template
- [ ] `README.md` - Project overview
- [ ] `docs/SPECIFICATION.md` - Full specification
- [ ] `docs/INTEGRATION.md` - This document
- [ ] `backend/BACKEND.md` - Backend implementation details
- [ ] `frontend/FRONTEND.md` - Frontend implementation details
