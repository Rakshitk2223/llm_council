# Axis Council

An LLM Council deliberation system where multiple AI models collaboratively answer user queries through a transparent voting and verdict process.

## Overview

Axis Council is an AI module designed for integration with web applications. It features:

- **Multiple Council Members**: 3 AI personas (Axis Alpha, Beta, Gamma) that independently answer queries
- **Blind Voting**: Council members rate each other's responses without knowing which is theirs
- **Senator Verdict**: A neutral judge (Senator Axis) delivers the final verdict with justification
- **Full Transparency**: Users see the entire deliberation process in real-time

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Azure OpenAI API access (endpoint + API key + deployment names)

### Setup

1. **Clone and configure environment**

cd llm_councilmen
# Copy environment template
cp .env.example .env
# Edit .env with your Azure OpenAI credentials

2. **Configure Azure OpenAI**
Edit `.env` with your credentials:

AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_API_VERSION=2024-02-15-preview
JWT_SECRET=your-jwt-secret

3. **Update deployment names**

Edit `backend/app/config.py` and update the `deployment_name` for each council member to match your Azure OpenAI deployments.

4. **Run with Docker Compose**

docker-compose up --build

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8001
- Health Check: http://localhost:8001/api/health

## Project Structure
llm_councilmen/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── config.py          # LLM configuration
│   │   ├── routers/           # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── models/            # Pydantic schemas
│   │   └── middleware/        # Auth & rate limiting
│   ├── requirements.txt
│   ├── Dockerfile
│   └── BACKEND.md             # Backend documentation
│
├─ frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom hooks
│   │   ├── stores/            # State management
│   │   ├── services/          # API client
│   │   ├── types/             # TypeScript types
│   │   └── styles/            # CSS & theme
│   ├── package.json
│   ├── Dockerfile
│   └── FRONTEND.md            # Frontend documentation
│
├── docker-compose.yml         # Container orchestration
├── .env.example               # Environment template
└── README.md                  # This file

### Environment Variables

| Variable                   | Description                                | Required |
| -------------------------- | ------------------------------------------ | -------- |
| `AZURE_OPENAI_ENDPOINT`    | Azure OpenAI resource endpoint             | Yes      |
| `AZURE_OPENAI_API_KEY`     | Azure OpenAI API key                       | Yes      |
| `AZURE_OPENAI_API_VERSION` | API version (default: 2024-02-15-preview)  | Yes      |
| `JWT_SECRET`               | Secret for JWT validation                  | Yes      |
| `JWT_ALGORITHM`            | JWT algorithm (default: HS256)             | No       |
| `RATE_LIMIT_PER_DAY`       | Queries per user per day (default: 20)     | No       |
| `FRONTEND_URL`             | Frontend URL for CORS (default: localhost) | No       |

### Adding/Removing Council Members

Edit `backend/app/config.py`:

```python
COUNCIL_MEMBERS = [
    {
        "id": "alpha",
        "name": "Axis Alpha",
        "deployment_name": "your-gpt4o-mini-deployment",  # Azure deployment name
        "temperature": 0.3,
        "persona": "..."
    },
    # Add or remove members here
]
```

The system automatically adjusts to the number of council members in the list.

## API Endpoints

| Method | Endpoint           | Description               | Auth     |
| ------ | ------------------ | ------------------------- | -------- |
| POST   | /api/council/query | Submit query (SSE stream) | Required |
| GET    | /api/health        | Health check              | None     |

## Integration Guide

### For the Main Dashboard Team
1. **Authentication**: Pass the user's JWT token in the Authorization header:
   Authorization: Bearer <user-jwt-token>
2. **JWT Secret**: Share the same JWT secret used by the main authentication system.
3. **Routing**: Add a route to the Axis Council page:

   /ai-council → Axis Council React component

4. **Theme Customization**: Update CSS variables in `frontend/src/styles/theme.css` to match your dashboard theme.

### Deployment Options

The Docker containers can be deployed on:

- AWS EC2 / ECS
- Azure VM / Container Apps
- Any Docker-compatible platform

## Rate Limiting
- Default: 20 queries per user per day
- Resets at midnight (server time)
- Each question (including follow-ups) counts against the limit

## Error Messages
| Scenario           | Message                                      |
| ------------------ | -------------------------------------------- |
| Not logged in      | "Please login first to use Axis Council"     |
| Rate limit reached | "You have reached your daily freemium limit" |
| Server error       | "Council is temporarily unavailable"         |

## Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with credentials
uvicorn app.main:app --reload --port 8001
```

### Frontend

```bash
cd frontend
bun install
bun run dev
```