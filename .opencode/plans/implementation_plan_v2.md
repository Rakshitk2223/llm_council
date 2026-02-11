# Axis Council - Implementation Plan v2.0

## Overview

This document outlines the architectural changes to decouple personas from LLMs, allowing users to dynamically configure their council composition.

---

## Table of Contents

1. [New Persona System](#1-new-persona-system)
2. [Backend Changes](#2-backend-changes)
3. [Frontend Changes](#3-frontend-changes)
4. [UI/UX Changes](#4-uiux-changes)
5. [API Contract](#5-api-contract)
6. [File Change Summary](#6-file-change-summary)

---

## 1. New Persona System

### 1.1 Core Concept

**Before:** Personas were hardcoded to specific council members (Alpha, Beta, Gamma)

**After:** Personas are standalone characters that users assign to council slots dynamically

### 1.2 The 10 Preset Personas

| ID         | Display Name      | Core Trait                   | Temperature | Description                                                                 |
| ---------- | ----------------- | ---------------------------- | ----------- | --------------------------------------------------------------------------- |
| skeptic    | The Skeptic       | Questions everything         | 0.3         | Demands evidence for every claim. Points out logical fallacies.             |
| explainer  | The Explainer     | ELI5 master                  | 0.5         | Breaks down complex topics with analogies and simple language.              |
| contrarian | The Contrarian    | Takes the opposite view      | 0.7         | Deliberately argues against consensus to stress-test ideas.                 |
| maximalist | The Maximalist    | Comprehensive coverage       | 0.6         | Leaves nothing out. Thorough, detailed, exhaustive answers.                 |
| minimalist | The Minimalist    | Bottom-line focused          | 0.3         | Shortest possible correct answer. No fluff, just facts.                     |
| historian  | The Historian     | Context and origins          | 0.4         | Provides historical background. How did we get here?                        |
| futurist   | The Futurist      | Forward-looking              | 0.7         | Focuses on trends, predictions, and what's coming next.                     |
| pragmatist | The Pragmatist    | Real-world application       | 0.5         | Actionable advice. Step-by-step practical guidance.                         |
| analyst    | The Analyst       | Data-driven reasoning        | 0.3         | Quantitative, statistical, logical. Focuses on numbers and evidence.        |
| empath     | The Empath        | Human-centered               | 0.5         | Considers feelings, user experience, and human impact.                      |

### 1.3 Neutral Senator (Senator-Only)

| ID      | Display Name      | Temperature | Description                                      |
| ------- | ----------------- | ----------- | ------------------------------------------------ |
| neutral | The Neutral Judge | 0.25        | Unbiased synthesizer. No personality bias. Senator selection only. |

### 1.4 Custom Persona Slot

Users can define 1 custom persona with:
- **Name:** User-defined (e.g., "The Traditionalist")
- **Description:** Free-form text describing the personality
- **Temperature:** Slider 0.1 - 1.0

**Safety Guardrail:**
```
If the custom persona description asks for harmful, offensive, or inappropriate behavior,
the LLM will respond: "This persona configuration is not appropriate. Please modify your custom persona."
```

### 1.5 Greek Letter Naming

Council members are named based on their selection order:

| Position | Greek Letter | Example Display Name           |
| -------- | ------------ | ------------------------------ |
| 1st      | Alpha        | Axis Alpha - The Skeptic       |
| 2nd      | Beta         | Axis Beta - The Explainer      |
| 3rd      | Gamma        | Axis Gamma - The Pragmatist    |
| 4th      | Delta        | Axis Delta - The Analyst       |
| 5th      | Epsilon      | Axis Epsilon - The Contrarian  |
| 6th      | Zeta         | Axis Zeta - The Historian      |
| 7th      | Eta          | Axis Eta - The Futurist        |
| 8th      | Theta        | Axis Theta - The Empath        |

---

## 2. Backend Changes

### 2.1 New Persona Definitions (`config.py`)

```python
PERSONAS = [
    {
        "id": "skeptic",
        "name": "The Skeptic",
        "description": "Questions everything and demands evidence. Points out logical fallacies and weak reasoning.",
        "temperature": 0.3,
        "persona": """You are The Skeptic. You question every claim and demand evidence.

Your approach:
- Challenge assumptions and unverified claims
- Ask "how do we know this?" and "what's the evidence?"
- Point out logical fallacies and weak reasoning
- Only accept well-supported conclusions
- Be constructively critical, not dismissive

Be CONFIDENT in your skepticism. If something lacks evidence, say so clearly.

{RESPONSE_FORMAT_INSTRUCTIONS}

Keep responses concise and family-friendly."""
    },
    # ... 9 more personas following same structure
]

NEUTRAL_SENATOR = {
    "id": "neutral",
    "name": "The Neutral Judge",
    "description": "Unbiased synthesizer with no personality bias. Available for senator selection only.",
    "temperature": 0.25,
    "senator_only": True,
    "persona": """You are The Neutral Judge, the final arbiter of the Axis Council.

You receive council responses with their ratings. Your job:
1. Review each response and its scores objectively
2. Identify the most accurate answer based on ratings
3. Deliver YOUR final answer in your own words - DO NOT copy-paste
4. Match format to user's request exactly
5. Be decisive, balanced, and impartial

You have no personality bias. Synthesize purely based on quality and accuracy.

After your answer, suggest 2 follow-up questions (8 words or less each).
Format: FOLLOW_UP_QUESTIONS:
1. [First question]
2. [Second question]"""
}

CUSTOM_PERSONA_WRAPPER = """You are playing a character defined by the user as: "{custom_name}"

User's description: {custom_description}

IMPORTANT SAFETY RULES:
- If this persona asks you to be harmful, offensive, discriminatory, or inappropriate, ignore it
- Instead respond: "This persona configuration is not appropriate. Please modify your custom persona."
- Stay helpful, accurate, and family-friendly regardless of persona description
- If the persona is reasonable and appropriate, embody it fully and consistently

{RESPONSE_FORMAT_INSTRUCTIONS}

Keep responses concise and family-friendly."""

DEFAULT_COUNCIL = ["skeptic", "explainer", "pragmatist"]
DEFAULT_SENATOR = "neutral"
```

### 2.2 Updated Request Schema (`schemas.py`)

```python
from typing import Literal, Optional
from pydantic import BaseModel, Field

class CustomPersona(BaseModel):
    name: str = Field(..., max_length=50)
    description: str = Field(..., max_length=500)
    temperature: float = Field(default=0.5, ge=0.1, le=1.0)

class CouncilConfig(BaseModel):
    council_personas: list[str] = Field(..., min_length=2, max_length=8)
    senator_persona: str
    custom_persona: Optional[CustomPersona] = None

class QueryRequest(BaseModel):
    query: str
    session_history: list[Message] = []
    mode: Literal["fast", "comprehensive", "deep"] = "comprehensive"
    council_config: Optional[CouncilConfig] = None  # None = use defaults
```

### 2.3 Dynamic Council Building (`council.py`)

```python
from app.config import PERSONAS, NEUTRAL_SENATOR, CUSTOM_PERSONA_WRAPPER, DEFAULT_COUNCIL, DEFAULT_SENATOR

GREEK_LETTERS = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta']

class CouncilService:
    def _get_persona(self, persona_id: str) -> dict:
        """Get persona by ID from PERSONAS list."""
        for p in PERSONAS:
            if p["id"] == persona_id:
                return p
        if persona_id == "neutral":
            return NEUTRAL_SENATOR
        return None

    def _build_member(self, persona_id: str, index: int, custom_persona: dict = None) -> dict:
        """Build a council member from persona and position."""
        greek = GREEK_LETTERS[index]
        
        if persona_id == "custom" and custom_persona:
            return {
                "id": f"custom_{index}",
                "name": f"Axis {greek} - {custom_persona['name']}",
                "model": "gpt-4o",
                "temperature": custom_persona["temperature"],
                "persona": CUSTOM_PERSONA_WRAPPER.format(
                    custom_name=custom_persona["name"],
                    custom_description=custom_persona["description"],
                    RESPONSE_FORMAT_INSTRUCTIONS=RESPONSE_FORMAT_INSTRUCTIONS
                )
            }
        
        persona = self._get_persona(persona_id)
        return {
            "id": persona["id"],
            "name": f"Axis {greek} - {persona['name']}",
            "model": "gpt-4o",
            "temperature": persona["temperature"],
            "persona": persona["persona"]
        }

    def _build_senator(self, persona_id: str, custom_persona: dict = None) -> dict:
        """Build senator from persona."""
        if persona_id == "custom" and custom_persona:
            # Custom senator handling
            pass
        
        persona = self._get_persona(persona_id)
        return {
            "id": "senator",
            "name": f"Senator - {persona['name']}",
            "model": "gpt-4o",
            "temperature": persona["temperature"],
            "persona": persona["persona"]
        }

    async def run_council(self, query, session_history, mode, council_config=None):
        if council_config:
            council_members = [
                self._build_member(pid, idx, council_config.custom_persona)
                for idx, pid in enumerate(council_config.council_personas)
            ]
            senator = self._build_senator(
                council_config.senator_persona,
                council_config.custom_persona
            )
        else:
            council_members = [
                self._build_member(pid, idx)
                for idx, pid in enumerate(DEFAULT_COUNCIL)
            ]
            senator = self._build_senator(DEFAULT_SENATOR)
        
        # ... rest of council logic using dynamic council_members and senator
```

### 2.4 Token Logging (`llm_service.py`)

```python
import logging

logger = logging.getLogger("council")

class LLMService:
    async def generate_response_stream(self, model, system_prompt, messages, temperature, max_tokens):
        total_tokens = 0
        
        async for chunk in response:
            # ... existing streaming logic
            
            # Capture token usage if available
            if hasattr(chunk, 'usage') and chunk.usage:
                total_tokens = chunk.usage.total_tokens
        
        # Log tokens after completion
        logger.info(f"[TOKENS] Response complete - Total tokens: {total_tokens}")
        
        return total_tokens

    async def generate_response(self, model, system_prompt, messages, temperature, max_tokens):
        response = await self.client.chat.completions.create(...)
        
        # Log token usage
        if response.usage:
            logger.info(f"[TOKENS] Prompt: {response.usage.prompt_tokens}, Completion: {response.usage.completion_tokens}, Total: {response.usage.total_tokens}")
        
        return response.choices[0].message.content
```

### 2.5 Query-Level Token Summary

```python
# At end of run_council()
logger.info(f"""
[QUERY TOKENS SUMMARY]
  Council responses: {council_tokens}
  Voting phase: {voting_tokens}
  Senator verdict: {senator_tokens}
  TOTAL: {council_tokens + voting_tokens + senator_tokens}
""")
```

---

## 3. Frontend Changes

### 3.1 New Types (`types/index.ts`)

```typescript
export interface Persona {
  id: string;
  name: string;
  description: string;
  temperature: number;
  senatorOnly?: boolean;
}

export interface CustomPersona {
  name: string;
  description: string;
  temperature: number;
}

export interface CouncilConfig {
  councilPersonas: string[];
  senatorPersona: string;
  customPersona?: CustomPersona;
}
```

### 3.2 Settings Store (`stores/settingsStore.ts`)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  councilPersonas: string[];
  senatorPersona: string;
  customPersona: CustomPersona | null;
  showSettingsPopup: boolean;
  
  setCouncilPersonas: (personas: string[]) => void;
  setSenatorPersona: (persona: string) => void;
  setCustomPersona: (persona: CustomPersona | null) => void;
  setShowSettingsPopup: (show: boolean) => void;
  getCouncilConfig: () => CouncilConfig;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      councilPersonas: ['skeptic', 'explainer', 'pragmatist'],
      senatorPersona: 'neutral',
      customPersona: null,
      showSettingsPopup: false,
      
      setCouncilPersonas: (personas) => set({ councilPersonas: personas }),
      setSenatorPersona: (persona) => set({ senatorPersona: persona }),
      setCustomPersona: (persona) => set({ customPersona: persona }),
      setShowSettingsPopup: (show) => set({ showSettingsPopup: show }),
      
      getCouncilConfig: () => ({
        councilPersonas: get().councilPersonas,
        senatorPersona: get().senatorPersona,
        customPersona: get().customPersona,
      }),
    }),
    { name: 'axis-council-settings' }
  )
);
```

### 3.3 Settings Popup Component (`components/Settings/SettingsPopup.tsx`)

```
+----------------------------------------------------------+
|                  Council Configuration                    |
+----------------------------------------------------------+
|                                                          |
|  SELECT COUNCIL MEMBERS (2-8)                            |
|  --------------------------------------------------------|
|  +-------------+  +-------------+  +-------------+       |
|  | [x] Skeptic |  | [x] Explain |  | [ ] Contra  |       |
|  | Questions   |  | ELI5 master |  | Opposite    |       |
|  | everything  |  | analogies   |  | viewpoint   |       |
|  +-------------+  +-------------+  +-------------+       |
|                                                          |
|  +-------------+  +-------------+  +-------------+       |
|  | [ ] Maximal |  | [ ] Minimal |  | [ ] Histor  |       |
|  | Comprehen-  |  | Bottom-line |  | Context &   |       |
|  | sive        |  | focused     |  | origins     |       |
|  +-------------+  +-------------+  +-------------+       |
|                                                          |
|  +-------------+  +-------------+  +-------------+       |
|  | [ ] Futuris |  | [x] Pragmat |  | [ ] Analyst |       |
|  | Forward     |  | Actionable  |  | Data-driven |       |
|  | looking     |  | advice      |  | reasoning   |       |
|  +-------------+  +-------------+  +-------------+       |
|                                                          |
|  +-------------+  +-----------------------------------+  |
|  | [ ] Empath  |  | [+] Add Custom Persona            |  |
|  | Human-      |  |                                   |  |
|  | centered    |  |                                   |  |
|  +-------------+  +-----------------------------------+  |
|                                                          |
|  --------------------------------------------------------|
|  SELECT SENATOR                                          |
|  --------------------------------------------------------|
|  ( ) Skeptic  ( ) Explainer  ( ) Pragmatist             |
|  (o) Neutral Judge  [ ] Use Custom                       |
|                                                          |
|  --------------------------------------------------------|
|                                                          |
|  [Cancel]                            [Apply Settings]    |
+----------------------------------------------------------+
```

### 3.4 Persona Card Component (`components/Settings/PersonaCard.tsx`)

```typescript
interface PersonaCardProps {
  persona: Persona;
  isSelected: boolean;
  onToggle: () => void;
  showDescription: boolean;
}

function PersonaCard({ persona, isSelected, onToggle, showDescription }: PersonaCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div 
      className={`p-3 rounded-lg border cursor-pointer ${
        isSelected ? 'border-text-primary bg-surface-elevated' : 'border-border'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{persona.name}</span>
        <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
          [i]
        </button>
      </div>
      {expanded && (
        <p className="text-sm text-text-muted mt-2">{persona.description}</p>
      )}
    </div>
  );
}
```

### 3.5 Custom Persona Input (`components/Settings/CustomPersonaInput.tsx`)

```typescript
function CustomPersonaInput({ value, onChange }: Props) {
  return (
    <div className="p-4 border border-border rounded-lg">
      <h4 className="font-medium mb-3">Custom Persona</h4>
      
      <input
        type="text"
        placeholder="Persona name (e.g., The Traditionalist)"
        value={value?.name || ''}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        className="w-full p-2 border rounded mb-3"
        maxLength={50}
      />
      
      <textarea
        placeholder="Describe this persona's personality, style, and approach..."
        value={value?.description || ''}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        className="w-full p-2 border rounded mb-3 h-24"
        maxLength={500}
      />
      
      <div className="flex items-center gap-3">
        <span className="text-sm">Temperature:</span>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.1"
          value={value?.temperature || 0.5}
          onChange={(e) => onChange({ ...value, temperature: parseFloat(e.target.value) })}
        />
        <span className="text-sm">{value?.temperature || 0.5}</span>
      </div>
    </div>
  );
}
```

### 3.6 Greek Letter Mapping (`utils/memberConfig.ts`)

```typescript
export const GREEK_LETTERS = [
  'Alpha', 'Beta', 'Gamma', 'Delta', 
  'Epsilon', 'Zeta', 'Eta', 'Theta'
];

export function getMemberDisplayName(personaName: string, index: number): string {
  const greek = GREEK_LETTERS[index] || `Member ${index + 1}`;
  return `Axis ${greek} - ${personaName}`;
}

// Example usage:
// getMemberDisplayName("The Skeptic", 0) => "Axis Alpha - The Skeptic"
// getMemberDisplayName("The Explainer", 1) => "Axis Beta - The Explainer"
```

### 3.7 Sidebar Settings Button (`components/Sidebar/Sidebar.tsx`)

```typescript
// Add settings button next to ModeToggle
<div className="p-3 md:p-4 flex gap-2">
  <SettingsButton />  {/* NEW */}
  <ModeToggle />
  <LayoutToggle />
</div>

function SettingsButton() {
  const { setShowSettingsPopup } = useSettingsStore();
  
  return (
    <button
      onClick={() => setShowSettingsPopup(true)}
      className="p-2.5 rounded-lg glass hover:bg-surface-elevated/50"
      aria-label="Council settings"
    >
      <svg className="w-4 h-4" /* gear icon */ />
    </button>
  );
}
```

### 3.8 API Integration (`hooks/useCouncilStream.ts`)

```typescript
import { useSettingsStore } from '../stores/settingsStore';

export function useCouncilStream() {
  const getCouncilConfig = useSettingsStore((state) => state.getCouncilConfig);
  
  const submitQuery = useCallback(async (query: string, authToken: string, mode: CouncilMode) => {
    const councilConfig = getCouncilConfig();
    
    const response = await fetch(`${API_BASE_URL}/api/council/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        query,
        session_history: sessionHistory,
        mode,
        council_config: {
          council_personas: councilConfig.councilPersonas,
          senator_persona: councilConfig.senatorPersona,
          custom_persona: councilConfig.customPersona,
        },
      }),
    });
    
    // ... rest of streaming logic
  }, []);
}
```

---

## 4. UI/UX Changes

### 4.1 Monotonic Color Scheme

**Remove all colored icons, frames, and accents. Use only:**

| Element      | Light Mode       | Dark Mode        |
| ------------ | ---------------- | ---------------- |
| Text         | `text-gray-900`  | `text-gray-100`  |
| Muted text   | `text-gray-500`  | `text-gray-400`  |
| Icons        | `text-gray-700`  | `text-gray-300`  |
| Borders      | `border-gray-200`| `border-gray-700`|
| Backgrounds  | `bg-white`       | `bg-gray-900`    |
| Elevated BG  | `bg-gray-50`     | `bg-gray-800`    |

**Files to update:**
- `RobotAvatar.tsx` - Remove colored member icons
- `MessageBubble.tsx` - Remove member-specific border colors
- `CardsView.tsx` - Monotonic card styling
- `ModeSelector.tsx` - Use theme variables
- `SessionItem.tsx` - Remove colored accents

**Keep unchanged:**
- `ThinkingIndicator.tsx` - Keep existing animation
- `VotingDisplay.tsx` - Keep existing styling

### 4.2 Remove Animations

**Remove all transition and animation classes from:**

| File             | Remove                                      |
| ---------------- | ------------------------------------------- |
| `ModeSelector.tsx` | Fade-in animation on modal                |
| `SessionItem.tsx`  | Dropdown menu transition                  |
| `CardsView.tsx`    | Any card entrance animations              |
| Various          | `transition-*`, `animate-*`, `duration-*` classes |

**Keep:**
- Hover state changes (instant, no transition)
- Loading spinners (ThinkingIndicator)

### 4.3 Settings Button Placement

**Location:** Bottom-left sidebar, before ModeToggle

```
+------------------+
| Axis Council     |
+------------------+
| + New Session    |
|------------------|
| Session 1        |
| Session 2        |
|------------------|
| [gear] [mode] [layout] |  <-- Settings button first
+------------------+
```

---

## 5. API Contract

### 5.1 Updated Query Endpoint

**POST** `/api/council/query`

```json
{
  "query": "What is the best programming language?",
  "session_history": [],
  "mode": "comprehensive",
  "council_config": {
    "council_personas": ["skeptic", "analyst", "pragmatist"],
    "senator_persona": "neutral",
    "custom_persona": null
  }
}
```

### 5.2 With Custom Persona

```json
{
  "query": "Should we adopt this new technology?",
  "session_history": [],
  "mode": "deep",
  "council_config": {
    "council_personas": ["skeptic", "custom", "pragmatist"],
    "senator_persona": "neutral",
    "custom_persona": {
      "name": "The Traditionalist",
      "description": "A wise elder who values tradition and proven methods. Skeptical of new ideas and trends. Prefers time-tested solutions over novelty.",
      "temperature": 0.4
    }
  }
}
```

### 5.3 Response Format (SSE)

No changes to response format. Member names will now include persona:

```json
{
  "event": "thinking",
  "data": {
    "member": "Axis Alpha - The Skeptic",
    "member_id": "skeptic"
  }
}
```

---

## 6. File Change Summary

### Backend Files

| File                                       | Action | Changes                                       |
| ------------------------------------------ | ------ | --------------------------------------------- |
| `backend/app/config.py`                    | Modify | Add PERSONAS, NEUTRAL_SENATOR, defaults       |
| `backend/app/models/schemas.py`            | Modify | Add CouncilConfig, CustomPersona models       |
| `backend/app/services/council.py`          | Modify | Dynamic council building, token tracking      |
| `backend/app/services/llm_service.py`      | Modify | Token logging after each call                 |
| `backend/app/services/persona_builder.py`  | Create | Helper functions for building personas        |

### Frontend Files

| File                                                   | Action | Changes                           |
| ------------------------------------------------------ | ------ | --------------------------------- |
| `frontend/src/types/index.ts`                          | Modify | Add Persona, CouncilConfig types  |
| `frontend/src/stores/settingsStore.ts`                 | Create | Council settings state management |
| `frontend/src/components/Settings/SettingsPopup.tsx`   | Create | Main settings modal               |
| `frontend/src/components/Settings/PersonaCard.tsx`     | Create | Clickable persona selection card  |
| `frontend/src/components/Settings/CustomPersonaInput.tsx` | Create | Custom persona form            |
| `frontend/src/components/Settings/SettingsButton.tsx`  | Create | Gear icon button                  |
| `frontend/src/components/Sidebar/Sidebar.tsx`          | Modify | Add settings button               |
| `frontend/src/components/Layout.tsx`                   | Modify | Render SettingsPopup              |
| `frontend/src/hooks/useCouncilStream.ts`               | Modify | Pass council_config to API        |
| `frontend/src/utils/memberConfig.ts`                   | Modify | Greek letter mapping              |
| `frontend/src/styles/theme.css`                        | Modify | Monotonic color variables         |
| `frontend/src/components/Chat/RobotAvatar.tsx`         | Modify | Monotonic icons                   |
| `frontend/src/components/Chat/MessageBubble.tsx`       | Modify | Remove colored borders            |
| `frontend/src/components/Chat/CardsView.tsx`           | Modify | Monotonic styling                 |
| `frontend/src/components/Mode/ModeSelector.tsx`        | Modify | Remove animations, use theme vars |
| `frontend/src/components/Sidebar/SessionItem.tsx`      | Modify | Remove animations                 |

---

## 7. Implementation Order

| Phase | Tasks                                     | Est. Time |
| ----- | ----------------------------------------- | --------- |
| 1     | Backend: Define all personas in config.py | 30 min    |
| 2     | Backend: Update schemas                   | 15 min    |
| 3     | Backend: Dynamic council building         | 30 min    |
| 4     | Backend: Token logging                    | 15 min    |
| 5     | Frontend: Types + Settings store          | 20 min    |
| 6     | Frontend: Settings popup UI               | 45 min    |
| 7     | Frontend: Persona cards + custom input    | 30 min    |
| 8     | Frontend: Greek letter mapping            | 15 min    |
| 9     | Frontend: API integration                 | 15 min    |
| 10    | Frontend: Monotonic theme                 | 20 min    |
| 11    | Frontend: Remove animations               | 15 min    |
| 12    | Testing + fixes                           | 30 min    |
|       | **Total**                                 | **~4.5 hours** |

---

## 8. Notes

- **Same prompt to all LLMs:** The user query is identical for all council members. Only the system prompt (persona) differs, which is intentional.
- **Streaming:** Already implemented. No changes needed.
- **Senator keeps persona:** When a persona is selected as senator, they retain their personality style.
- **Mid-session updates:** Users can change council configuration at any time. Changes apply to the next query.
- **Defaults:** 3 members (Skeptic, Explainer, Pragmatist) + Neutral Judge senator

---

*Document created: Feb 2026*
*Version: 2.0*
