# LLM Council

An AI deliberation system where multiple LLM models collaborate to answer queries through structured discussion and voting.

## Features

- **Multi-Model Deliberation**: 3+ AI models discuss and debate user questions
- **Blind Voting**: Models rate each other's responses anonymously
- **Final Verdict**: A neutral judge synthesizes the best answer
- **Real-time Streaming**: See the entire deliberation process via SSE
- **Multi-Provider**: Azure OpenAI, Azure Foundry, xAI, Anthropic
- **Customizable Personas**: Choose from 11+ personas or create custom ones

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
uvicorn app.main:app --reload --port 8001
```

### Frontend

```bash
cd frontend
bun install
bun run dev
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint | Yes |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | Yes |
| `AZURE_FOUNDRY_ENDPOINT` | Azure Foundry (optional) | No |
| `ANTHROPIC_API_KEY` | Anthropic API key (optional) | No |
| `XAI_API_KEY` | xAI API key (optional) | No |

## Project Structure

```
llm_councilmen/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py       # API entry point
│   │   ├── config.py      # Models & personas
│   │   ├── routers/       # API endpoints
│   │   ├── services/      # Business logic
│   │   └── models/        # Pydantic schemas
│   └── requirements.txt
│
└── frontend/             # React + Vite frontend
    ├── src/
    │   ├── components/   # UI components
    │   ├── hooks/        # Custom hooks
    │   ├── stores/        # State management
    │   └── services/     # API client
    └── package.json
```

## Modes

- **Fast**: Quick responses, skips voting
- **Full**: Full deliberation with voting
- **Deep**: N×N voting matrix for maximum thoroughness

## Production Deployment

1. Set `FRONTEND_URL` to your domain
2. Enable auth if needed: `AUTH_DISABLED=false`
3. Set strong `JWT_SECRET`
4. Build frontend: `cd frontend && bun run build`
