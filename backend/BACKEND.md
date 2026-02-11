# Axis Council - Backend Documentation

## Overview

FastAPI backend that orchestrates the Axis Council process: multiple LLM responses, blind voting, and final senator verdict with Server-Sent Events (SSE) streaming.

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Configuration, models, personas
│   ├── routers/
│   │   └── council.py       # API endpoints
│   ├── services/
│   │   ├── llm_service.py   # Multi-provider LLM client
│   │   ├── council.py       # Council orchestration
│   │   └── voting.py        # Voting logic
│   ├── models/
│   │   └── schemas.py       # Pydantic models
│   └── middleware/
│       └── auth.py          # JWT auth (disabled by default)
├── requirements.txt
└── .env.example
```

## Quick Start

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Azure credentials
uvicorn app.main:app --reload --port 8001
```

## Configuration

### Environment Variables

Create `backend/.env`:

```bash
# Primary: Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Optional: Azure Foundry (becomes primary if OpenAI empty)
AZURE_FOUNDRY_ENDPOINT=
AZURE_FOUNDRY_API_KEY=

# Optional: Third-party providers
XAI_API_KEY=           # For Grok models
ANTHROPIC_API_KEY=     # For Claude models

# Auth (disabled by default)
AUTH_DISABLED=true
JWT_SECRET=dev-secret

# Rate limiting (high limit by default)
RATE_LIMIT_PER_DAY=1000

# CORS (allow all for development)
FRONTEND_URL=*
```

### Multi-Provider Architecture

The backend supports multiple LLM providers simultaneously:

1. **Azure OpenAI** (primary) - GPT-4o, GPT-4o Mini, GPT-4.1
2. **Azure Foundry** (secondary) - Same models, different endpoint
3. **xAI** (optional) - Grok 4, Grok 4.1 Fast
4. **Anthropic** (optional) - Claude Haiku 3.5, Claude Sonnet 3.5

Provider selection is automatic based on model configuration in `config.py`.

### Model Configuration

Edit `backend/app/config.py`:

```python
# Council Members - Cost-effective models
COUNCIL_MODELS = [
    {"id": "claude-haiku-3-5", "name": "Claude Haiku 3.5", "provider": "anthropic"},
    {"id": "grok-4-1-fast", "name": "Grok 4.1 Fast", "provider": "xai"},
    {"id": "gpt-4o-mini", "name": "GPT-4o Mini", "provider": "azure"},
    {"id": "gpt-4o", "name": "GPT-4o", "provider": "azure"},
]

# Senator - Premium models
SENATOR_MODELS = [
    {"id": "gpt-4-1", "name": "GPT-4.1", "provider": "azure"},
    {"id": "claude-sonnet-3-5", "name": "Claude Sonnet 3.5", "provider": "anthropic"},
    {"id": "grok-4", "name": "Grok 4", "provider": "xai"},
    {"id": "gpt-4o", "name": "GPT-4o", "provider": "azure"},
]
```

Models are randomly assigned by default. Users can override in settings.

### Persona Configuration

Personas in `backend/app/config.py`:

```python
PERSONAS = [
    {
        "id": "none",           # No persona - direct query
        "name": "No Persona",
        "description": "Direct query without persona influence",
        "temperature": 0.5,
        "persona": None,
    },
    {
        "id": "skeptic",
        "name": "The Skeptic",
        "description": "Questions everything and demands evidence",
        "temperature": 0.3,
        "persona": """You are The Skeptic...
- Challenge assumptions
- Point out logical fallacies
- Only accept well-supported conclusions""",
    },
    # ... more personas
]
```

Add new personas by following the same structure.

## API Endpoints

### POST /api/council/query

Submit a query to the council. Returns SSE stream of events.

**Request:**
```json
{
  "query": "What is the best IDE for Python?",
  "session_history": [],
  "mode": "comprehensive",
  "council_config": {
    "council_members": [
      {"persona_id": "none", "model_id": "gpt-4o-mini"},
      {"persona_id": "skeptic", "model_id": "claude-haiku-3-5"},
      {"persona_id": "explainer", "model_id": "grok-4-1-fast"}
    ],
    "senator_persona": "neutral",
    "senator_model": "gpt-4o"
  }
}
```

**SSE Events:**
- `council_start` - Begin answering phase
- `thinking` - Member is generating response
- `answer_chunk` - Streaming response chunk
- `answer_complete` - Member finished
- `voting_start` - Begin voting phase
- `voting_complete` - Voting done, scores available
- `senator_start` - Begin verdict
- `verdict_chunk` - Streaming verdict
- `verdict_complete` - Final verdict done

### GET /api/council/config/models

Get available models for council and senator roles.

**Response:**
```json
{
  "council_models": [...],
  "senator_models": [...]
}
```

### GET /api/council/config/personas

Get available personas.

**Response:**
```json
{
  "personas": [...],
  "senator_persona_ids": [...]
}
```

### GET /api/health

Health check.

## Authentication

Authentication is **disabled by default** (`AUTH_DISABLED=true`).

To enable:
1. Set `AUTH_DISABLED=false` in `.env`
2. Set strong `JWT_SECRET`
3. Frontend must send JWT token in Authorization header

## Token Limits

Configured in `backend/app/config.py`:

```python
MAX_TOKENS_COUNCIL = 300    # Per council member response
MAX_TOKENS_SENATOR = 250    # Senator verdict
MAX_TOKENS_VOTING = 400     # Voting evaluation
```

## Error Handling

Common errors:

- **Model not available**: Provider API key not configured
- **Rate limit exceeded**: Too many requests
- **Provider error**: LLM API returned error

All errors are logged and returned to frontend with descriptive messages.

## Development Tips

### Adding New Models

1. Add to `COUNCIL_MODELS` or `SENATOR_MODELS` in `config.py`
2. Ensure provider is configured in `.env`
3. Restart backend

### Adding New Personas

1. Add to `PERSONAS` list in `config.py`
2. Include: id, name, description, temperature, persona text
3. Restart backend

### Testing Locally

```bash
# Run with auto-reload
uvicorn app.main:app --reload --port 8001

# Test health
 curl http://localhost:8001/api/health

# View logs
 tail -f logs/app.log
```

## Production Deployment

### Environment Changes

```bash
# .env
AUTH_DISABLED=false                    # Enable auth
JWT_SECRET=strong-random-secret        # Strong secret
FRONTEND_URL=https://yourdomain.com    # Production domain
RATE_LIMIT_PER_DAY=100                 # Lower limit
```

### Build Frontend

```bash
cd frontend
npm run build
```

### Serve Static Files

Option 1: Serve from backend
```python
# In main.py
from fastapi.staticfiles import StaticFiles
app.mount("/", StaticFiles(directory="../frontend/dist"), name="static")
```

Option 2: Use reverse proxy (nginx)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:8001;
    }
}
```

### Run with Systemd

Create `/etc/systemd/system/axis-council.service`:
```ini
[Unit]
Description=Axis Council Backend
After=network.target

[Service]
User=youruser
WorkingDirectory=/path/to/backend
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable axis-council
sudo systemctl start axis-council
```

## Troubleshooting

**Backend won't start**
- Check `.env` has required Azure credentials
- Verify Python version (3.10+)

**"Model not available" error**
- Check provider API key is set in `.env`
- Verify model ID matches config

**CORS errors**
- Update `FRONTEND_URL` to match frontend domain
- Use `*` for development only

**Slow responses**
- Council uses 3+ LLM calls per query
- Consider using faster models (Grok 4.1 Fast, GPT-4o Mini)

## Architecture Notes

### Why Multi-Provider?

- **Cost optimization**: Use cheaper models for council, expensive for senator
- **Redundancy**: Fallback between Azure OpenAI and Foundry
- **Model diversity**: Different providers have different strengths

### Why Random Assignment?

- Distributes load across providers
- Prevents overusing expensive models
- Users can still override in settings

### Persona "None"

When selected, only basic instructions are sent:
```
RULES:
- Start with **bold title**
- Be CONFIDENT
- Match user's request format
- Be concise
```

This is useful for direct queries without persona influence.
