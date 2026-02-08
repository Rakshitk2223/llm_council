# Axis Council - Quick Setup Guide

This guide will help you set up and run the Axis Council project on a new machine.

## Prerequisites

- Python 3.11+ with pip
- Node.js 18+ with npm

---

## Step 1: Extract the Zip

```bash
# Extract the zip file
unzip llm_councilmen.zip

# Navigate to the project folder
cd llm_councilmen
```

---

## Step 2: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from example and edit)
cp .env.example .env
# Edit .env with your API keys and settings
```

### Configure .env File

Edit the `.env` file with your settings:

```env
LLM_BASE_URL=https://your-azure-endpoint.openai.azure.com/
LLM_API_KEY=your-api-key-here
AZURE_API_VERSION=2024-02-15-preview
JWT_SECRET=your-jwt-secret
AUTH_DISABLED=true
FRONTEND_URL=http://localhost:5173
```

---

## Step 3: Frontend Setup

```bash
# Open a new terminal and navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env file (optional, for custom API URL)
# echo "VITE_API_URL=http://localhost:8001" > .env
```

---

## Step 4: Run the Application

### Terminal 1 - Backend

```bash
cd backend
# Activate venv if not already active
# Windows: .venv\Scripts\activate
# Linux/Mac: source .venv/bin/activate

# Start the backend server
uvicorn app.main:app --reload --port 8001
```

Backend will be available at: http://localhost:8001

### Terminal 2 - Frontend

```bash
cd frontend

# Start the frontend dev server
npm run dev
```

Frontend will be available at: http://localhost:5173

---

## Step 5: Access the Application

Open your browser and go to: **http://localhost:5173**

---

## Troubleshooting

### "Module not found" errors in backend
```bash
cd backend
pip install -r requirements.txt
```

### "Cannot find module" errors in frontend
```bash
cd frontend
npm install
```

### API connection errors
1. Make sure backend is running on port 8001
2. Check that `.env` file has correct API credentials
3. Verify `AUTH_DISABLED=true` in backend `.env` for local testing

### CORS errors
Make sure `FRONTEND_URL=http://localhost:5173` is set in backend `.env`

---

## Quick Reference

| Command | Location | Description |
|---------|----------|-------------|
| `pip install -r requirements.txt` | backend/ | Install Python dependencies |
| `npm install` | frontend/ | Install Node dependencies |
| `uvicorn app.main:app --reload --port 8001` | backend/ | Start backend server |
| `npm run dev` | frontend/ | Start frontend dev server |
| `npm run build` | frontend/ | Build frontend for production |

---

## Project Structure

```
llm_councilmen/
├── backend/
│   ├── app/
│   │   ├── config.py        # Configuration & personas
│   │   ├── main.py          # FastAPI app entry
│   │   ├── models/          # Pydantic schemas
│   │   ├── routers/         # API endpoints
│   │   ├── services/        # Business logic
│   │   └── middleware/      # Auth & rate limiting
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── stores/          # Zustand stores
│   │   ├── styles/          # CSS & theme
│   │   └── types/           # TypeScript types
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## Need Help?

- Check the `README.md` for project overview
- Check `backend/BACKEND.md` for backend details
- Check `frontend/FRONTEND.md` for frontend details
- Check `docs/INTEGRATION.md` for API integration guide
