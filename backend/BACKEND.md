# Axis Council - Backend Implementation Guide

## Overview

The backend is a Python FastAPI application that orchestrates the Axis Council process, handling LLM calls, voting, and streaming responses via Server-Sent Events (SSE).

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app entry point
│   ├── config.py                  # LLM configuration, settings
│   ├── routers/
│   │   ├── __init__.py
│   │   └── council.py             # /api/council/* endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── llm_service.py         # Provider-agnostic LLM client (OpenAI-compatible)
│   │   ├── council.py             # Council orchestration logic
│   │   └── voting.py              # Blind voting logic
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py             # Pydantic request/response models
│   └── middleware/
│       ├── __init__.py
│       ├── auth.py                # JWT validation
│       └── rate_limit.py          # Pluggable rate limiting (in-memory, database-ready)
├── requirements.txt
├── Dockerfile
└── .env.example
```

---

## Dependencies

```
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
openai==1.12.0
pydantic==2.6.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
python-dotenv==1.0.0
sse-starlette==1.8.2
```

---

## Configuration Module (config.py)

### Environment Variables

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # LLM Provider (OpenAI-compatible API)
    llm_base_url: str = "http://localhost:1234/v1"
    llm_api_key: str = "not-needed"
    
    # For Azure OpenAI only (optional)
    azure_api_version: str = "2024-02-15-preview"
    
    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    
    # Rate Limiting
    rate_limit_per_day: int = 20
    
    # CORS
    frontend_url: str = "http://localhost:5173"
    
    class Config:
        env_file = ".env"
```

### Council Member Configuration

```python
COUNCIL_MEMBERS = [
    {
        "id": "alpha",
        "name": "Axis Alpha",
        # model: The model name to use
        # - For OpenAI: "gpt-4o-mini", "gpt-4o", etc.
        # - For Azure OpenAI: The deployment name (nickname given to the model)
        "model": "gpt-4o-mini",
        "temperature": 0.3,
        "persona": """You are Axis Alpha, a precise and analytical council member of the Axis Council.
Your approach:
- Focus on accuracy and factual correctness
- Be concise and structured in your responses
- Prioritize clarity over creativity
- Keep responses under 10 lines

Always maintain a respectful, family-friendly tone. No profanity or inappropriate content."""
    },
    {
        "id": "beta",
        "name": "Axis Beta",
        "model": "gpt-4o-mini",
        "temperature": 0.7,
        "persona": """You are Axis Beta, a creative and insightful council member of the Axis Council.
Your approach:
- Offer unique perspectives and engaging explanations
- Balance creativity with accuracy
- Make complex topics accessible
- Keep responses under 10 lines

Always maintain a respectful, family-friendly tone. No profanity or inappropriate content."""
    },
    {
        "id": "gamma",
        "name": "Axis Gamma",
        "model": "gpt-4o-mini",
        "temperature": 0.5,
        "persona": """You are Axis Gamma, a practical and user-focused council member of the Axis Council.
Your approach:
- Provide clear, actionable answers
- Prioritize helpfulness and accessibility
- Consider real-world applications
- Keep responses under 10 lines

Always maintain a respectful, family-friendly tone. No profanity or inappropriate content."""
    },
    # ---------- RESERVED FOR FUTURE USE ----------
    # Uncomment and configure model when ready to expand the council
    #
    # {
    #     "id": "delta",
    #     "name": "Axis Delta",
    #     "model": "gpt-4o-mini",
    #     "temperature": 0.6,
    #     "persona": """You are Axis Delta, a thorough and methodical council member of the Axis Council.
    # Your approach:
    # - Consider multiple angles before responding
    # - Provide comprehensive yet concise answers
    # - Highlight important nuances
    # - Keep responses under 10 lines
    #
    # Always maintain a respectful, family-friendly tone. No profanity or inappropriate content."""
    # },
    # {
    #     "id": "epsilon",
    #     "name": "Axis Epsilon",
    #     "model": "gpt-4o-mini",
    #     "temperature": 0.4,
    #     "persona": """You are Axis Epsilon, a skeptical and critical council member of the Axis Council.
    # Your approach:
    # - Question assumptions when appropriate
    # - Highlight potential issues or alternatives
    # - Provide balanced counterpoints
    # - Keep responses under 10 lines
    #
    # Always maintain a respectful, family-friendly tone. No profanity or inappropriate content."""
    # },
]

SENATOR = {
    "id": "senator",
    "name": "Senator Axis",
    # Using a stronger model for better judgment quality (if available)
    "model": "gpt-4o",
    "temperature": 0.4,
    "persona": """You are Senator Axis, the chief arbiter of the Axis Council.

Your role is to review all council responses and their peer ratings, then deliver a final verdict.

IMPORTANT RULES:
1. Never say "winner" - use "highest rated" or "most favorably evaluated"
2. Never reference "as stated above" or "as mentioned" - your response must be STANDALONE
3. The user should be able to read ONLY your response and get a complete answer
4. Be articulate and well-structured
5. Provide justification for why the top-rated response excelled
6. Synthesize the best insights into your final answer
7. You may briefly acknowledge good points from other responses

Your response format:
1. Acknowledge which council member's response received the highest ratings and why
2. Provide a COMPLETE, POLISHED final answer that fully addresses the user's question
3. Your answer should feel like a thoughtful expert delivering an authoritative response

Do NOT be verbose about the process - focus on delivering value to the user."""
}
```

### Voting Configuration

```python
VOTING_CRITERIA = [
    {
        "id": "accuracy",
        "name": "Accuracy",
        "description": "How factually correct is the response?"
    },
    {
        "id": "relevance", 
        "name": "Relevance",
        "description": "How well does it answer the user's question?"
    },
    {
        "id": "clarity",
        "name": "Clarity",
        "description": "How easy is it to understand?"
    },
    {
        "id": "completeness",
        "name": "Completeness",
        "description": "Is it thorough enough without being excessive?"
    }
]

VOTING_PROMPT_TEMPLATE = """You are evaluating responses from the Axis Council.

User's original question: {query}

You must rate EACH response on the following criteria (1-10 scale):
- Accuracy: How factually correct is the response?
- Relevance: How well does it answer the user's question?
- Clarity: How easy is it to understand?
- Completeness: Is it thorough enough without being excessive?

Responses to evaluate:

{responses}

Provide your ratings in the following JSON format:
{{
    "ratings": {{
        "Response A": {{"accuracy": X, "relevance": X, "clarity": X, "completeness": X}},
        "Response B": {{"accuracy": X, "relevance": X, "clarity": X, "completeness": X}},
        "Response C": {{"accuracy": X, "relevance": X, "clarity": X, "completeness": X}}
    }}
}}

Only respond with the JSON, no additional text."""
```

---

## Pydantic Schemas (models/schemas.py)

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    member_name: Optional[str] = None  # For assistant messages

class QueryRequest(BaseModel):
    query: str
    session_history: list[Message] = []  # Previous messages in session

class CouncilMemberResponse(BaseModel):
    member_id: str
    member_name: str
    response: str

class VotingResult(BaseModel):
    response_label: str  # "Response A", "Response B", etc.
    member_id: str  # Actual member who gave this response
    member_name: str
    ratings: dict[str, dict[str, int]]  # voter_id -> {criterion: score}
    average_scores: dict[str, float]  # criterion -> avg score
    overall_average: float

class SenatorVerdict(BaseModel):
    verdict: str
    winner_id: str
    winner_name: str

class ErrorResponse(BaseModel):
    error: str
    code: str
```

---

## LLM Service - Provider Agnostic (services/llm_service.py)

```python
from openai import OpenAI
from typing import AsyncGenerator
from app.config import settings

class LLMService:
    """
    Provider-agnostic LLM service that works with any OpenAI-compatible API:
    - OpenAI
    - Azure OpenAI
    - LM Studio (local)
    - Ollama (local)
    - Together.ai
    - Groq
    - Any OpenAI-compatible endpoint
    """
    
    def __init__(self):
        # Initialize with configurable base URL and API key
        self.client = OpenAI(
            base_url=settings.llm_base_url,
            api_key=settings.llm_api_key,
        )
    
    async def generate_response(
        self,
        model: str,
        system_prompt: str,
        messages: list[dict],
        temperature: float = 0.7
    ) -> str:
        """Generate a complete response (non-streaming)"""
        response = self.client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                *messages
            ],
            temperature=temperature
        )
        return response.choices[0].message.content
    
    async def generate_response_stream(
        self,
        model: str,
        system_prompt: str,
        messages: list[dict],
        temperature: float = 0.7
    ) -> AsyncGenerator[str, None]:
        """Generate a streaming response"""
        response = self.client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                *messages
            ],
            temperature=temperature,
            stream=True
        )
        
        for chunk in response:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
```

### Switching Providers

To switch between providers, simply update your `.env` file:

```bash
# For LM Studio (local testing)
LLM_BASE_URL=http://localhost:1234/v1
LLM_API_KEY=not-needed

# For OpenAI
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-your-openai-key

# For Azure OpenAI
LLM_BASE_URL=https://your-resource.openai.azure.com/v1
LLM_API_KEY=your-azure-key

# For Ollama
LLM_BASE_URL=http://localhost:11434/v1
LLM_API_KEY=not-needed

# For Together.ai
LLM_BASE_URL=https://api.together.xyz/v1
LLM_API_KEY=your-together-key
```

No code changes required - just update the environment variables.

---

## Voting Service (services/voting.py)

### Blind Voting Implementation

```python
import random
import json
from app.config import COUNCIL_MEMBERS, VOTING_PROMPT_TEMPLATE
from app.services.llm_service import LLMService

class VotingService:
    def __init__(self, llm_service: LLMService):
        self.llm = llm_service
    
    def shuffle_responses(
        self, 
        responses: list[dict]  # [{"member_id": "alpha", "response": "..."}]
    ) -> tuple[list[dict], dict]:
        """
        Shuffle responses and assign anonymous labels.
        Returns (shuffled_responses, mapping)
        """
        shuffled = responses.copy()
        random.shuffle(shuffled)
        
        labels = ["Response A", "Response B", "Response C", "Response D", "Response E"]
        mapping = {}  # label -> member_id
        labeled_responses = []
        
        for i, resp in enumerate(shuffled):
            label = labels[i]
            mapping[label] = resp["member_id"]
            labeled_responses.append({
                "label": label,
                "content": resp["response"]
            })
        
        return labeled_responses, mapping
    
    def format_responses_for_voting(self, labeled_responses: list[dict]) -> str:
        """Format responses for the voting prompt"""
        formatted = []
        for resp in labeled_responses:
            formatted.append(f"{resp['label']}:\n{resp['content']}\n")
        return "\n---\n".join(formatted)
    
    async def collect_votes(
        self,
        query: str,
        labeled_responses: list[dict],
        voters: list[dict]  # Council members who will vote
    ) -> dict:
        """
        Have each council member rate all responses.
        Returns: {voter_id: {response_label: {criterion: score}}}
        """
        formatted_responses = self.format_responses_for_voting(labeled_responses)
        prompt = VOTING_PROMPT_TEMPLATE.format(
            query=query,
            responses=formatted_responses
        )
        
        all_votes = {}
        
        # Parallel voting calls (for speed)
        for voter in voters:
            response = await self.llm.generate_response(
                model=voter["model"],
                system_prompt="You are an impartial evaluator. Rate responses objectively.",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3  # Low temperature for consistent ratings
            )
            
            # Parse JSON response
            try:
                parsed = json.loads(response)
                all_votes[voter["id"]] = parsed["ratings"]
            except json.JSONDecodeError:
                # Fallback: extract JSON from response
                import re
                json_match = re.search(r'\{.*\}', response, re.DOTALL)
                if json_match:
                    parsed = json.loads(json_match.group())
                    all_votes[voter["id"]] = parsed["ratings"]
        
        return all_votes
    
    def aggregate_scores(
        self,
        votes: dict,
        mapping: dict  # label -> member_id
    ) -> list[dict]:
        """
        Aggregate all votes into final scores per response.
        """
        results = []
        
        for label, member_id in mapping.items():
            criterion_totals = {}
            criterion_counts = {}
            
            for voter_id, voter_ratings in votes.items():
                if label in voter_ratings:
                    for criterion, score in voter_ratings[label].items():
                        criterion_totals[criterion] = criterion_totals.get(criterion, 0) + score
                        criterion_counts[criterion] = criterion_counts.get(criterion, 0) + 1
            
            avg_scores = {
                criterion: total / criterion_counts[criterion]
                for criterion, total in criterion_totals.items()
            }
            
            overall_avg = sum(avg_scores.values()) / len(avg_scores) if avg_scores else 0
            
            # Get member name from config
            member_name = next(
                (m["name"] for m in COUNCIL_MEMBERS if m["id"] == member_id),
                member_id
            )
            
            results.append({
                "response_label": label,
                "member_id": member_id,
                "member_name": member_name,
                "average_scores": avg_scores,
                "overall_average": overall_avg,
                "all_ratings": {
                    voter_id: voter_ratings.get(label, {})
                    for voter_id, voter_ratings in votes.items()
                }
            })
        
        # Sort by overall average (highest first)
        results.sort(key=lambda x: x["overall_average"], reverse=True)
        
        return results
```

---

## Council Orchestration Service (services/council.py)

```python
import json
from typing import AsyncGenerator
from app.config import COUNCIL_MEMBERS, SENATOR
from app.services.llm_service import LLMService
from app.services.voting import VotingService

class CouncilService:
    def __init__(self):
        self.llm = LLMService()
        self.voting = VotingService(self.llm)
    
    def compact_history(self, history: list[dict]) -> list[dict]:
        """
        Compact conversation history to reduce token usage.
        Keep essential context without full verbosity.
        """
        compacted = []
        for msg in history[-6:]:  # Keep last 6 messages max
            if msg["role"] == "user":
                compacted.append({"role": "user", "content": msg["content"]})
            else:
                # Summarize assistant messages
                content = msg["content"]
                if len(content) > 200:
                    content = content[:200] + "..."
                compacted.append({"role": "assistant", "content": content})
        return compacted
    
    async def run_council(
        self,
        query: str,
        session_history: list[dict]
    ) -> AsyncGenerator[dict, None]:
        """
        Run the complete council process, yielding SSE events.
        """
        # Compact history for context
        history = self.compact_history(session_history)
        messages = history + [{"role": "user", "content": query}]
        
        # ============ PHASE 1: Answer Generation ============
        yield {"event": "council_start", "data": {"phase": "answering"}}
        
        responses = []
        
        for member in COUNCIL_MEMBERS:
            # Signal thinking
            yield {
                "event": "thinking",
                "data": {"member": member["name"], "member_id": member["id"]}
            }
            
            # Stream the response
            full_response = ""
            async for chunk in self.llm.generate_response_stream(
                model=member["model"],
                system_prompt=member["persona"],
                messages=messages,
                temperature=member["temperature"]
            ):
                full_response += chunk
                yield {
                    "event": "answer_chunk",
                    "data": {
                        "member": member["name"],
                        "member_id": member["id"],
                        "chunk": chunk
                    }
                }
            
            # Signal completion
            yield {
                "event": "answer_complete",
                "data": {
                    "member": member["name"],
                    "member_id": member["id"],
                    "full_answer": full_response
                }
            }
            
            responses.append({
                "member_id": member["id"],
                "response": full_response
            })
        
        # ============ PHASE 2: Blind Voting ============
        yield {"event": "voting_start", "data": {"phase": "voting"}}
        
        # Shuffle and anonymize responses
        labeled_responses, mapping = self.voting.shuffle_responses(responses)
        
        # Collect votes from all council members
        votes = await self.voting.collect_votes(
            query=query,
            labeled_responses=labeled_responses,
            voters=COUNCIL_MEMBERS
        )
        
        # Aggregate scores
        aggregated = self.voting.aggregate_scores(votes, mapping)
        
        yield {
            "event": "voting_complete",
            "data": {
                "results": aggregated,
                "mapping": {
                    label: next(
                        m["name"] for m in COUNCIL_MEMBERS if m["id"] == member_id
                    )
                    for label, member_id in mapping.items()
                }
            }
        }
        
        # ============ PHASE 3: Senator Verdict ============
        yield {
            "event": "senator_start",
            "data": {"phase": "verdict", "member": SENATOR["name"]}
        }
        
        # Prepare senator prompt
        senator_context = self._format_senator_context(
            query=query,
            responses=responses,
            aggregated=aggregated,
            mapping=mapping
        )
        
        # Stream senator verdict
        full_verdict = ""
        async for chunk in self.llm.generate_response_stream(
            model=SENATOR["model"],
            system_prompt=SENATOR["persona"],
            messages=[{"role": "user", "content": senator_context}],
            temperature=SENATOR["temperature"]
        ):
            full_verdict += chunk
            yield {
                "event": "verdict_chunk",
                "data": {"chunk": chunk}
            }
        
        # Determine winner
        winner = aggregated[0] if aggregated else None
        
        yield {
            "event": "verdict_complete",
            "data": {
                "verdict": full_verdict,
                "winner_id": winner["member_id"] if winner else None,
                "winner_name": winner["member_name"] if winner else None
            }
        }
        
        yield {"event": "council_complete", "data": {"status": "complete"}}
    
    def _format_senator_context(
        self,
        query: str,
        responses: list[dict],
        aggregated: list[dict],
        mapping: dict
    ) -> str:
        """Format all information for the Senator's verdict"""
        
        # Format responses with their scores
        response_details = []
        for result in aggregated:
            member_id = result["member_id"]
            response_text = next(
                r["response"] for r in responses if r["member_id"] == member_id
            )
            member_name = result["member_name"]
            scores = result["average_scores"]
            overall = result["overall_average"]
            
            response_details.append(f"""
{member_name}'s Response:
"{response_text}"

Peer Ratings (average scores from all council members):
- Accuracy: {scores.get('accuracy', 'N/A'):.1f}/10
- Relevance: {scores.get('relevance', 'N/A'):.1f}/10
- Clarity: {scores.get('clarity', 'N/A'):.1f}/10
- Completeness: {scores.get('completeness', 'N/A'):.1f}/10
- Overall Average: {overall:.1f}/10
""")
        
        return f"""User's Question: {query}

The Axis Council has deliberated. Below are all responses with their peer ratings (sorted by overall score):

{"---".join(response_details)}

As Senator Axis, deliver your final verdict:
1. Acknowledge which response received the highest ratings and briefly explain why it excelled
2. Provide a COMPLETE, STANDALONE answer that fully addresses the user's question
3. Your response should be polished and authoritative - the user should get full value from reading only your verdict

Remember: Do not say "winner" or reference "above". Your answer must be self-contained."""
```

---

## API Router (routers/council.py)

```python
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
import json

from app.models.schemas import QueryRequest
from app.services.council import CouncilService
from app.middleware.auth import get_current_user
from app.middleware.rate_limit import check_rate_limit

router = APIRouter(prefix="/api/council", tags=["council"])

@router.post("/query")
async def query_council(
    request: QueryRequest,
    user_id: str = Depends(get_current_user),
    rate_limit_ok: bool = Depends(check_rate_limit)
):
    """
    Submit a query to the Axis Council.
    Returns a Server-Sent Events stream of the council process.
    """
    council = CouncilService()
    
    async def event_generator():
        try:
            async for event in council.run_council(
                query=request.query,
                session_history=[msg.model_dump() for msg in request.session_history]
            ):
                yield {
                    "event": event["event"],
                    "data": json.dumps(event["data"])
                }
        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({
                    "error": "Council is temporarily unavailable",
                    "code": "COUNCIL_ERROR"
                })
            }
    
    return EventSourceResponse(event_generator())
```

---

## Authentication Middleware (middleware/auth.py)

```python
from fastapi import HTTPException, Header
from jose import jwt, JWTError
from app.config import settings

async def get_current_user(authorization: str = Header(None)) -> str:
    """
    Validate JWT token and extract user ID.
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "Please login first to use Axis Council",
                "code": "AUTH_REQUIRED"
            }
        )
    
    try:
        # Extract token from "Bearer <token>" format
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid auth scheme")
        
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm]
        )
        user_id = payload.get("sub") or payload.get("user_id")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        return user_id
        
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "Please login first to use Axis Council",
                "code": "AUTH_REQUIRED"
            }
        )
```

---

## Rate Limiting Middleware (middleware/rate_limit.py)

### Pluggable Rate Limiter Interface

The rate limiter is designed to be easily swappable between in-memory (MVP) and database (production).

```python
from abc import ABC, abstractmethod
from fastapi import HTTPException, Depends
from datetime import date
from typing import Dict
from app.config import settings
from app.middleware.auth import get_current_user

# =============================================================================
# ABSTRACT INTERFACE - Implement this for different storage backends
# =============================================================================

class RateLimiter(ABC):
    """Abstract base class for rate limiting implementations"""
    
    @abstractmethod
    def check_and_increment(self, user_id: str) -> bool:
        """Check if user has remaining quota and increment if so. Returns True if allowed."""
        pass
    
    @abstractmethod
    def get_remaining(self, user_id: str) -> int:
        """Get remaining queries for user today"""
        pass
    
    @abstractmethod
    def reset(self, user_id: str) -> None:
        """Reset user's quota (for admin use)"""
        pass

# =============================================================================
# IN-MEMORY IMPLEMENTATION (Current - for MVP/testing)
# =============================================================================

class InMemoryRateLimiter(RateLimiter):
    """
    Simple in-memory rate limiter.
    Note: Resets on server restart. Good for MVP/testing.
    """
    
    def __init__(self):
        # Structure: {user_id: {"date": "2024-01-15", "count": 5}}
        self._store: Dict[str, dict] = {}
    
    def check_and_increment(self, user_id: str) -> bool:
        today = date.today().isoformat()
        
        if user_id not in self._store:
            self._store[user_id] = {"date": today, "count": 0}
        
        user_limit = self._store[user_id]
        
        # Reset if new day
        if user_limit["date"] != today:
            user_limit["date"] = today
            user_limit["count"] = 0
        
        # Check limit
        if user_limit["count"] >= settings.rate_limit_per_day:
            return False
        
        # Increment count
        user_limit["count"] += 1
        return True
    
    def get_remaining(self, user_id: str) -> int:
        today = date.today().isoformat()
        
        if user_id not in self._store:
            return settings.rate_limit_per_day
        
        user_limit = self._store[user_id]
        
        if user_limit["date"] != today:
            return settings.rate_limit_per_day
        
        return max(0, settings.rate_limit_per_day - user_limit["count"])
    
    def reset(self, user_id: str) -> None:
        if user_id in self._store:
            del self._store[user_id]

# =============================================================================
# DATABASE IMPLEMENTATION (Future - uncomment and configure when ready)
# =============================================================================

# class DatabaseRateLimiter(RateLimiter):
#     """
#     Database-backed rate limiter for production.
#     Persists across server restarts and works across multiple instances.
#     """
#     
#     def __init__(self, db_session):
#         self.db = db_session
#     
#     def check_and_increment(self, user_id: str) -> bool:
#         today = date.today().isoformat()
#         
#         # Query database for user's usage today
#         # INSERT or UPDATE as needed
#         # Return True if under limit, False otherwise
#         pass
#     
#     def get_remaining(self, user_id: str) -> int:
#         # Query database for user's current count
#         pass
#     
#     def reset(self, user_id: str) -> None:
#         # Delete user's rate limit record
#         pass

# =============================================================================
# ACTIVE RATE LIMITER - Change this to switch implementations
# =============================================================================

# Current: In-memory for MVP
rate_limiter = InMemoryRateLimiter()

# Future: Database-backed (uncomment when database is available)
# rate_limiter = DatabaseRateLimiter(db_session)

# =============================================================================
# FASTAPI DEPENDENCY
# =============================================================================

async def check_rate_limit(user_id: str = Depends(get_current_user)) -> bool:
    """
    FastAPI dependency to check rate limit.
    Raises HTTPException if limit exceeded.
    """
    if not rate_limiter.check_and_increment(user_id):
        raise HTTPException(
            status_code=429,
            detail={
                "error": "You have reached your daily freemium limit",
                "code": "RATE_LIMIT_EXCEEDED"
            }
        )
    return True

def get_remaining_queries(user_id: str) -> int:
    """Get remaining queries for user today"""
    return rate_limiter.get_remaining(user_id)
```

### Switching to Database Storage

When the main team provides database access:

1. Uncomment `DatabaseRateLimiter` class
2. Implement the three methods using your database ORM
3. Change `rate_limiter = InMemoryRateLimiter()` to `rate_limiter = DatabaseRateLimiter(db_session)`
4. No other code changes needed

---

## Main Application (main.py)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import council

app = FastAPI(
    title="Axis Council API",
    description="LLM Council deliberation service",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(council.router)

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "axis-council"}
```

---

## Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/

# Expose port
EXPOSE 8001

# Run with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

---

## Environment Variables (.env.example)

```bash
# =============================================================================
# LLM PROVIDER CONFIGURATION (Provider-Agnostic)
# =============================================================================
# Works with any OpenAI-compatible API:
# - OpenAI, Azure OpenAI, LM Studio, Ollama, Together.ai, Groq, etc.

# Base URL for the LLM API
# Examples:
#   OpenAI:     https://api.openai.com/v1
#   Azure:      https://your-resource.openai.azure.com/v1
#   LM Studio:  http://localhost:1234/v1
#   Ollama:     http://localhost:11434/v1
LLM_BASE_URL=http://localhost:1234/v1

# API Key (use "not-needed" for local LLMs like LM Studio/Ollama)
LLM_API_KEY=not-needed

# For Azure OpenAI only (optional)
AZURE_API_VERSION=2024-02-15-preview

# =============================================================================
# JWT AUTHENTICATION
# =============================================================================
# Must match the secret used by the main site's authentication system
JWT_SECRET=your-jwt-secret-here
JWT_ALGORITHM=HS256

# =============================================================================
# RATE LIMITING
# =============================================================================
# Number of queries allowed per user per day
RATE_LIMIT_PER_DAY=20

# =============================================================================
# CORS - Frontend URL
# =============================================================================
# Update this to match your frontend deployment URL
FRONTEND_URL=http://localhost:5173
```

---

## Implementation Checklist

- [ ] Project structure created
- [ ] Dependencies installed (requirements.txt)
- [ ] Configuration module with council members and personas
- [ ] Pydantic schemas for requests/responses
- [ ] Provider-agnostic LLM service (works with OpenAI, Azure, LM Studio, Ollama, etc.)
- [ ] Voting service with blind voting and score aggregation
- [ ] Council orchestration service with SSE event generation
- [ ] Improved Senator prompt (no "winner" language, standalone response)
- [ ] API router with /api/council/query endpoint
- [ ] JWT authentication middleware
- [ ] Pluggable rate limiting middleware (in-memory now, database-ready)
- [ ] Health check endpoint
- [ ] CORS configuration
- [ ] Dockerfile for containerization (create at end of project)
- [ ] .env.example with documentation
- [ ] Error handling for all edge cases
- [ ] Content moderation in system prompts

---

## Testing Locally

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your Azure OpenAI credentials

# Run the server
uvicorn app.main:app --reload --port 8001

# Test health endpoint
curl http://localhost:8001/api/health
```
