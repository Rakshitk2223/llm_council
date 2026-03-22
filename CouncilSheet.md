# LLM Council - DETAILED DESCRIPTION

> **WARNING:** This file contains sensitive configuration details and internal architecture. 

---

## Table of Contents
1. [Quick Start for Development](#quick-start-for-development)
2. [Core Architecture](#core-architecture)
3. [Configuration Guide](#configuration-guide)
4. [Adding/Modifying Features](#addingmodifying-features)
5. [Error Handling & Debugging](#error-handling--debugging)
6. [Integration with Main Axis Website](#integration-with-main-axis-website)
7. [Handover Checklist](#handover-checklist)
8. [FAQ & Troubleshooting](#faq--troubleshooting)

---

## Quick Start for Development

### Backend Setup (2 minutes)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your Azure credentials (see Configuration section)

# Run server
uvicorn app.main:app --reload --port 8001
```

### Frontend Setup (2 minutes)
```bash
cd frontend
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8001
- API Docs: http://localhost:8001/docs

---

## Core Architecture

### How Multi-Provider Works

```
User Query
    ↓
Frontend (React + Vite)
    ↓ (HTTP POST /api/council/query)
Backend (FastAPI)
    ↓
LLMService._get_client_for_model()
    ↓
IF USE_GPT4O_AS_DEFAULT = True:
    → Always use gpt-4o (safety mode)
ELSE:
    Check model's "provider" field
        ↓
    Provider = "azure" → Try Azure OpenAI → Try Azure Foundry (fallback)
    Provider = "xai" → Try xAI (Grok)
    Provider = "anthropic" → Try Anthropic (Claude)
        ↓
    If provider not configured:
        → Raise ModelNotAvailableError
        → Show user-friendly toast: "X model not available, try Y"
```

### Model Routing Logic

**Example Scenarios:**

| User Selects | USE_GPT4O_AS_DEFAULT | AZURE Config | ANTHROPIC Config | Result |
|-------------|----------------------|---------------|------------------ |---------|
| Claude Sonnet |           True      |     ✓       |         ✗         | Uses GPT-4o (silent) |
| Claude Sonnet | False | ✓ | ✗ | Error: "Claude not available" |
| Claude Sonnet | False | ✓ | ✓ | Uses Claude |
| GPT-4o | Any | ✓ | Any | Uses GPT-4o |

**Key Points:**
- System does NOT automatically cycle through providers
- Each model has a specific provider
- If provider not configured → shows error (or falls back to GPT-4o if flag enabled)

### Persona System

**How it works:**
1. Personas defined in `backend/app/config.py` → `PERSONAS` list
2. Frontend fetches via `/api/council/config/personas`
3. User selects persona in Settings popup
4. Backend applies persona instructions as system prompt

**Auto-Update:**
- Edit `PERSONAS` in backend
- Restart backend
- Frontend auto-updates (fetched on Settings popup open)

---

## Configuration Guide

### Critical Variables (backend/.env)

```bash
# REQUIRED: At least one provider must be configured
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-key-here

# Optional providers:
AZURE_FOUNDRY_ENDPOINT=        # Secondary Azure
AZURE_FOUNDRY_API_KEY=
XAI_API_KEY=                    # For Grok models
ANTHROPIC_API_KEY=              # For Claude models

# SAFETY SWITCHES
USE_GPT4O_AS_DEFAULT=True      # Force all to GPT-4o
AUTH_DISABLED=True             # No login required

# LIMITS
MAX_QUERY_WORDS=200            # Words per query
RATE_LIMIT_PER_DAY=20        # Queries per day per user

# PRODUCTION
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=strong-random-secret
```

### Frontend Configuration

**Environment Variables:**
```bash
# frontend/.env
VITE_API_URL=http://localhost:8001
```

---

## Adding/Modifying Features

### How to Add a New Model

**Step 1: Add to config.py (30 seconds)**
```python
# backend/app/config.py
COUNCIL_MODELS = [
    # ... existing models ...
    {
        "id": "your-model-id",           # Must be unique
        "name": "Display Name",          # Shows in dropdown
        "provider": "azure",             # azure, xai, or anthropic
        "description": "What it does"    # Tooltip text
    },
]
```

**Step 2: Restart backend**
```bash
Ctrl+C
uvicorn app.main:app --reload --port 8001
```

**Done!** Frontend auto-updates.

### How to Add/Remove Personas

**Adding:**
```python
# backend/app/config.py
PERSONAS = [
    # ... existing personas ...
    {
        "id": "unique-id",
        "name": "Persona Name",
        "description": "Brief description",
        "temperature": 0.5,
        "persona": """You are The Persona. Instructions here.
- Bullet point 1
- Bullet point 2
- Bullet point 3"""
    },
]
```

**Removing:** Comment out from `PERSONAS` list.

---

## Error Handling

### User-Friendly Errors

| Error | User Sees | Developer Sees |
|-------|-----------|----------------|
| Model not available | "Claude Sonnet is not available right now. Please try GPT-4o or another model." | Provider not configured |
| Query too long | "Your question is too long (X words). Please keep it under X words." | MAX_QUERY_WORDS exceeded |
| Rate limit | "You've reached the daily query limit. Please try again tomorrow." | Too many requests |
| Connection error | "Connection issue. Please check your internet and try again." | Backend not running |

**Toast Display:**
- Position: Top center
- Duration: 5 seconds
- Style: Greyish background, left border color-coded by type

---

## Integration with Main Axis Website

### Option 1: Iframe (Recommended)

**Implementation:**
```html
<button onclick="openCouncil()">Ask AI Council</button>

<div id="council-modal" style="display:none; position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,0.8);">
  <iframe src="https://council.yourdomain.com" style="width:100%; height:100%; border:none;" />
  <button onclick="closeCouncil()" style="position:absolute; top:20px; right:20px;">✕</button>
</div>

<script>
function openCouncil() {
  document.getElementById('council-modal').style.display = 'block';
}
function closeCouncil() {
  document.getElementById('council-modal').style.display = 'none';
}
</script>
```

**Pros:** Complete isolation, easy to implement (30 min)
**Cons:** Slightly slower load



### Option 2: Web Component

**More complex but better integration:**
```javascript
import { LLMCouncilWidget } from './llm-council-widget.js';

const widget = new AxisCouncilWidget({
  apiUrl: 'https://council-api.yourdomain.com',
  authToken: currentUser.token,
  container: '#council-container'
});
```

### Authentication

**JWT Flow:**
1. Main site stores token: `localStorage.setItem('auth_token', user.jwt)`
2. Council reads token from localStorage
3. Backend validates with shared `JWT_SECRET`

**Critical:** Main site and Council must use same `JWT_SECRET`

---

- [ ] Set `USE_GPT4O_AS_DEFAULT=True` (safety mode)
- [ ] Set `AUTH_DISABLED=False` (if using auth)
- [ ] Configure production Azure credentials
- [ ] Set `FRONTEND_URL` to production domain
- [ ] Test all error scenarios
- [ ] Verify token limits


**Q: How to customize theme?**
A: Edit `frontend/src/styles/theme.css` - CSS variables control all colors

**Q: How to add models?**
A: Add to `COUNCIL_MODELS` in config.py (2-minute task)

**Q: How to track costs?**
A: Token usage logged to console; add analytics in `llm_service.py`

**Q: Only want GPT models?**
A: Set `USE_GPT4O_AS_DEFAULT=True`, remove other models from config

**Q: Enable rate limiting?**
A: Set `RATE_LIMIT_PER_DAY` to desired number

---

## FAQ

### Switch from Dev to Production

```bash
# backend/.env
AUTH_DISABLED=false
FRONTEND_URL=https://yourdomain.com
RATE_LIMIT_PER_DAY=100
JWT_SECRET=strong-secret-min-32-chars

# Build frontend
cd frontend
npm run build
# Deploy backend with production ASGI server
```

### Monitor Token Usage

**Backend logs:**
```
[TOKENS] Prompt: 120, Completion: 450, Total: 570
```
**Add custom tracking:**
```python
# In llm_service.py
logger.info(f"[USAGE] User: {user_id}, Model: {model}, Tokens: {total_tokens}")
```

### Disable Model Temporarily?

- Comment out in `COUNCIL_MODELS` or `SENATOR_MODELS`
- Or keep `USE_GPT4O_AS_DEFAULT=True`

---

## Quick Reference

### File Locations

| What | File |
|------|------|
| Models config | `backend/app/config.py` |
| Personas config | `backend/app/config.py` |
| Error messages | `ERROR_HANDLING.md` |
| API endpoints | `backend/app/routers/council.py` |
| LLM service | `backend/app/services/llm_service.py` |
| Toast component | `frontend/src/components/Toast.tsx` |
| Query validation | `frontend/src/components/Input/InputArea.tsx` |
| Settings store | `frontend/src/stores/settingsStore.ts` |

### Important Flags

| Flag | Location | Purpose |
|------|----------|---------|
| USE_GPT4O_AS_DEFAULT | config.py | Force all to GPT-4o |
| AUTH_DISABLED | config.py | Disable/enable auth |
| MAX_QUERY_WORDS | config.py + InputArea.tsx | Query length limit |
| RATE_LIMIT_PER_DAY | config.py | Daily query limit |

### Default Values

- **Council members:** 3 members, all "none" persona, all gpt-4o
- **Senator:** "neutral" persona, gpt-4o
- **Max query:**200 words
- **Auth:** Disabled
- **Models:** Forced to GPT-4o (USE_GPT4O_AS_DEFAULT=True)

---

## Contact & Support

**For questions not covered here:**
- Check ERROR_HANDLING.md for error details
- Check backend/README.md and frontend/README.md
- Review code comments in key files

**Last Updated:** 2026-02-13
**Rakshit Kumar**