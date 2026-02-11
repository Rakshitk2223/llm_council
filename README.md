# Axis Council

An LLM Council deliberation system where multiple AI models collaboratively answer user queries through a transparent voting and verdict process.

## Overview

Axis Council is an AI module designed for integration with web applications. It features:

- **Multiple Council Members**: 3 AI personas (Axis Alpha, Beta, Gamma) that independently answer queries
- **Blind Voting**: Council members rate each other's responses without knowing which is theirs
- **Senator Verdict**: A neutral judge (Senator Axis) delivers the final verdict
- **Full Transparency**: Users see the entire deliberation process in real-time
- **Multi-Provider Support**: Works with Azure OpenAI, Azure Foundry, and optional third-party providers (xAI, Anthropic)
- **Persona Options**: Choose from 10+ personas or use "No Persona" for direct queries
- **Smart Model Assignment**: Random assignment of cost-effective models for council, premium models for senator

## Quick Start

### Prerequisites

- Python 3.10+ (backend)
- Node.js 18+ (frontend)
- Azure OpenAI API access (primary provider)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd llm_councilmen/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Linux/Mac
   # or
   .venv\Scripts\activate  # Windows
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Azure OpenAI credentials
   ```

5. **Run the server**
   ```bash
   uvicorn app.main:app --reload --port 8001
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd llm_councilmen/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the dev server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8001
   - Health Check: http://localhost:8001/api/health

## Configuration

### Environment Variables (Backend `.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI resource endpoint | Yes |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | Yes |
| `AZURE_OPENAI_API_VERSION` | API version (default: 2024-02-15-preview) | No |
| `AZURE_FOUNDRY_ENDPOINT` | Azure Foundry endpoint (optional) | No |
| `AZURE_FOUNDRY_API_KEY` | Azure Foundry API key (optional) | No |
| `XAI_API_KEY` | xAI API key for Grok models (optional) | No |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude (optional) | No |

**Note**: Authentication is disabled by default (`AUTH_DISABLED=true`). JWT settings are optional.

### Model Configuration

Models are configured in `backend/app/config.py`:

**Council Members** (cost-effective for multiple responses):
- Claude Haiku 3.5
- Grok 4.1 Fast
- GPT-4o Mini
- GPT-4o

**Senator** (premium for final verdict):
- GPT-4.1
- Claude Sonnet 3.5
- Grok 4
- GPT-4o

To modify available models, edit the `COUNCIL_MODELS` and `SENATOR_MODELS` lists in `backend/app/config.py`.

### Persona Configuration

Personas are defined in `backend/app/config.py`. To add a new persona:

```python
{
    "id": "your_persona_id",
    "name": "Persona Name",
    "description": "Brief description",
    "temperature": 0.5,
    "persona": """Persona instructions...""",
}
```

The "none" persona (no persona) is available for direct queries without persona influence.

## Project Structure

```
llm_councilmen/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── config.py          # Configuration & models
│   │   ├── routers/           # API endpoints
│   │   ├── services/          # Business logic (council, voting, LLM)
│   │   ├── models/            # Pydantic schemas
│   │   └── middleware/        # Auth (disabled by default)
│   ├── requirements.txt
│   ├── .env.example
│   └── BACKEND.md             # Backend documentation
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom hooks
│   │   ├── stores/            # State management (Zustand)
│   │   ├── services/          # API client
│   │   ├── types/             # TypeScript types
│   │   └── styles/            # CSS & theme
│   ├── package.json
│   └── FRONTEND.md            # Frontend documentation
│
└── README.md                  # This file
```

## Development to Production

### Changes for Production

1. **Environment Variables**:
   - Set `FRONTEND_URL` to your production domain
   - Enable authentication if needed (`AUTH_DISABLED=false`)
   - Set strong `JWT_SECRET`

2. **CORS Configuration**:
   - Update `FRONTEND_URL` in `.env` to match your production frontend URL
   - Example: `FRONTEND_URL=https://yourdomain.com`

3. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

4. **Static File Serving**:
   - Serve built frontend files from backend or use a reverse proxy (nginx)

### Security Considerations

- Never commit `.env` files with real credentials
- Use strong JWT secrets in production
- Enable rate limiting if needed (`RATE_LIMIT_PER_DAY`)
- Configure CORS properly for your domain

## Troubleshooting

**Backend won't start**: Check that all required environment variables are set in `.env`

**Model not available error**: Ensure the provider API keys are configured for the requested model

**CORS errors**: Update `FRONTEND_URL` in backend `.env` to match your frontend URL

## License

MIT License - See LICENSE file for details
