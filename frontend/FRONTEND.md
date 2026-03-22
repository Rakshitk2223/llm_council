# LLM Council - Frontend Documentation

## Overview

React + TypeScript + Vite frontend for the LLM Council deliberation system. Features real-time streaming via Server-Sent Events (SSE), theme support, and session management.

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Chat/           # Chat display components
│   │   ├── Input/          # Input components
│   │   ├── Layout/         # Layout components
│   │   ├── Mode/           # Mode selector (comprehensive/fast)
│   │   ├── Settings/       # Settings popup & persona selection
│   │   ├── Sidebar/        # Session sidebar
│   │   └── Error/          # Error displays
│   ├── hooks/              # Custom hooks
│   │   ├── useCouncilStream.ts    # SSE connection
│   │   └── useTheme.ts            # Theme management
│   ├── stores/             # Zustand state stores
│   │   ├── sessionStore.ts        # Session management
│   │   ├── settingsStore.ts       # Settings (persona, models)
│   │   ├── modeStore.ts           # Mode selection
│   │   └── layoutStore.ts         # Layout preferences
│   ├── services/           # API clients
│   │   └── api.ts
│   ├── types/              # TypeScript types
│   ├── styles/             # CSS & Tailwind
│   └── utils/              # Utilities
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Access at: http://localhost:5173

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.5.0"
  }
}
```

## Key Features

### 1. Multi-Persona Support

Personas available (defined in backend `config.py`):
- **No Persona** - Direct query without persona influence
- **The Skeptic** - Questions everything, demands evidence
- **The Explainer** - Makes complex topics simple
- **The Contrarian** - Argues opposite views
- **The Maximalist** - Comprehensive coverage
- **The Minimalist** - Shortest correct answer
- **The Historian** - Provides context and origins
- **The Futurist** - Forward-looking perspective
- **The Pragmatist** - Actionable advice
- **The Analyst** - Data-driven reasoning
- **The Empath** - Human-centered perspective

Users select persona in Settings popup. Default for new members is "No Persona".

### 2. Model Selection

Models are divided into two roles:

**Council Members** (cost-effective):
- Claude Haiku 3.5
- Grok 4.1 Fast
- GPT-4o Mini
- GPT-4o

**Senator** (premium):
- GPT-4.1
- Claude Sonnet 3.5
- Grok 4
- GPT-4o

Models are randomly assigned by default. Users can override in Settings.

### 3. Settings Popup

Access via ⚙️ button in sidebar. Allows configuration of:
- Persona for each council member
- LLM model for each council member
- Persona for senator
- LLM model for senator

### 4. Session Management

- Sessions stored in localStorage
- Create new sessions
- Rename sessions
- Delete sessions
- Auto-title from first user message

### 5. Theme System

CSS variables in `src/styles/theme.css`:
- Light/Dark mode support
- Customizable colors
- Consistent design tokens

## API Integration

### SSE Events

Frontend receives these events from backend:
- `council_start` - Begin answering phase
- `thinking` - Member generating response
- `answer_chunk` - Streaming response chunk
- `answer_complete` - Member finished
- `voting_start` - Begin voting
- `voting_complete` - Voting done
- `senator_start` - Begin verdict
- `verdict_chunk` - Streaming verdict
- `verdict_complete` - Final verdict

### API Endpoints

- `POST /api/council/query` - Submit query (SSE stream)
- `GET /api/council/config/models` - Get available models
- `GET /api/council/config/personas` - Get available personas
- `GET /api/health` - Health check

## Configuration

### Environment Variables

Create `frontend/.env`:

```bash
VITE_API_URL=http://localhost:8001
```

For production:
```bash
VITE_API_URL=https://your-backend-domain.com
```

### Vite Config

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
});
```

## State Management

### Session Store (Zustand)

```typescript
interface SessionStore {
  sessions: Session[];
  currentSessionId: string | null;
  councilState: CouncilState;
  
  // Actions
  createSession: () => string;
  selectSession: (id: string) => void;
  addMessage: (message: Message) => void;
  setCouncilPhase: (phase: string) => void;
  // ... more
}
```

### Settings Store

```typescript
interface SettingsStore {
  councilMembers: CouncilMemberConfig[];
  senatorPersona: string;
  senatorModel: string;
  
  // Actions
  updateCouncilMember: (index: number, config: Partial<CouncilMemberConfig>) => void;
  fetchConfig: () => Promise<void>;
  resetToDefaults: () => void;
}
```

## Building for Production

```bash
cd frontend
npm run build
```

Output goes to `frontend/dist/`.

### Deployment Options

**Option 1: Serve from Backend**
```python
# In backend/main.py
from fastapi.staticfiles import StaticFiles
app.mount("/", StaticFiles(directory="../frontend/dist"), name="static")
```

**Option 2: Separate Static Hosting**
- Deploy `dist/` folder to Netlify, Vercel, or similar
- Configure `VITE_API_URL` to point to backend

**Option 3: Nginx Reverse Proxy**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8001;
    }
}
```

## Customization

### Adding New Components

1. Create component in `src/components/Category/ComponentName.tsx`
2. Export from index if needed
3. Import and use in parent component

### Styling

Use Tailwind classes with CSS variables:
```tsx
<div className="bg-surface text-text-primary border-border">
  Content
</div>
```

Update theme colors in `src/styles/theme.css`:
```css
:root {
  --color-primary: #your-color;
  --color-background: #your-bg;
}
```

### Adding Personas to Frontend

Personas are fetched from backend API (`/api/council/config/personas`). 

To add new personas:
1. Add to `PERSONAS` array in `backend/app/config.py`
2. Restart backend
3. Frontend will auto-fetch new personas

## Troubleshooting

**CORS errors**
- Update `FRONTEND_URL` in backend `.env`
- Ensure backend allows your frontend origin

**SSE connection fails**
- Check backend is running on correct port
- Verify `VITE_API_URL` is correct
- Check browser console for errors

**Build fails**
- Ensure all dependencies installed: `npm install`
- Check for TypeScript errors: `npx tsc --noEmit`

**Styling issues**
- Verify Tailwind is processing: check `postcss.config.js`
- Ensure CSS imports in `main.tsx`

## Development Tips

### Hot Reload
Vite provides instant HMR. Changes to React components update without page refresh.

### API Proxy
During development, API calls are proxied to backend (configured in `vite.config.ts`).

### State Persistence
Sessions persist to localStorage automatically. Clear browser storage to reset.

### Testing Different Modes
Toggle between "comprehensive" and "fast" modes in the Mode selector to test different behaviors.

## Authentication

Authentication is disabled by default in backend (`AUTH_DISABLED=true`).

If enabled:
- Frontend should obtain JWT token from auth provider
- Pass token in Authorization header
- Handle 401 errors by redirecting to login

## Performance

- Virtual scrolling for long chat histories (if implemented)
- Lazy load heavy components
- Debounce user input
- Optimize re-renders with React.memo where appropriate
