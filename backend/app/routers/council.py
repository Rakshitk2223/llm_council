import json
import logging
import traceback

from sse_starlette.sse import EventSourceResponse

logger = logging.getLogger("council")
from fastapi import APIRouter, Depends

from app.config import (
    COUNCIL_MODELS,
    SENATOR_MODELS,
    PERSONAS,
    NEUTRAL_SENATOR,
    SENATOR_PERSONA_IDS,
    MAX_QUERY_WORDS,
)
from app.middleware.auth import get_current_user
from app.middleware.rate_limit import check_rate_limit, get_remaining_queries
from app.models.schemas import QueryRequest
from app.services.council import CouncilService
from app.services.llm_service import ModelNotAvailableError

router = APIRouter(prefix="/api/council", tags=["council"])


def count_words(text: str) -> int:
    """Count words in text."""
    return len(text.split())


@router.post("/query")
async def query_council(
    request: QueryRequest,
    user_id: str = Depends(get_current_user),
    rate_limit_ok: bool = Depends(check_rate_limit),
):
    _ = rate_limit_ok
    _ = user_id

    # Validate query length
    word_count = count_words(request.query)
    if word_count > MAX_QUERY_WORDS:

        async def error_generator():
            yield {
                "event": "error",
                "data": json.dumps(
                    {
                        "error": f"Your question is too long ({word_count} words). Please keep it under {MAX_QUERY_WORDS} words.",
                        "code": "QUERY_TOO_LONG",
                        "current_words": word_count,
                        "max_words": MAX_QUERY_WORDS,
                    }
                ),
            }

        return EventSourceResponse(error_generator())

    if not request.query.strip():

        async def error_generator():
            yield {
                "event": "error",
                "data": json.dumps(
                    {
                        "error": "Please enter a question first.",
                        "code": "EMPTY_QUERY",
                    }
                ),
            }

        return EventSourceResponse(error_generator())

    council = CouncilService()

    async def event_generator():
        try:
            async for event in council.run_council(
                query=request.query,
                session_history=[
                    message.model_dump() for message in request.session_history
                ],
                mode=request.mode,
                council_config=request.council_config,
            ):
                yield {
                    "event": event["event"],
                    "data": json.dumps(event["data"]),
                }
            remaining = get_remaining_queries(user_id)
            yield {
                "event": "council_complete",
                "data": json.dumps(
                    {"status": "complete", "queries_remaining": remaining}
                ),
            }
        except ModelNotAvailableError as e:
            # User-friendly error for model not available
            logger.error(f"Model not available: {e.model_name}")
            yield {
                "event": "error",
                "data": json.dumps(
                    {
                        "error": e.user_message,
                        "code": "MODEL_NOT_AVAILABLE",
                        "model": e.model_name,
                    }
                ),
            }
        except Exception as e:
            print(f"Council error: {e}")
            traceback.print_exc()
            error_msg = str(e)
            # Check for common errors and provide user-friendly messages
            if "rate limit" in error_msg.lower():
                user_message = (
                    "You've reached the daily query limit. Please try again tomorrow."
                )
                code = "RATE_LIMIT_EXCEEDED"
            elif "timeout" in error_msg.lower() or "time out" in error_msg.lower():
                user_message = (
                    "Request is taking too long. Please try a shorter question."
                )
                code = "TIMEOUT_ERROR"
            elif "connection" in error_msg.lower():
                user_message = (
                    "Connection issue. Please check your internet and try again."
                )
                code = "CONNECTION_ERROR"
            else:
                user_message = "Something went wrong. Please try again."
                code = "COUNCIL_ERROR"

            yield {
                "event": "error",
                "data": json.dumps(
                    {
                        "error": user_message,
                        "code": code,
                    }
                ),
            }

    return EventSourceResponse(event_generator())


@router.get("/config/models")
async def get_available_models():
    return {"council_models": COUNCIL_MODELS, "senator_models": SENATOR_MODELS}


@router.get("/config/personas")
async def get_personas():
    all_personas = [
        {
            "id": p["id"],
            "name": p["name"],
            "description": p["description"],
            "temperature": p["temperature"],
        }
        for p in PERSONAS
    ]
    senator_personas = [
        {
            "id": p["id"],
            "name": p["name"],
            "description": p["description"],
            "temperature": p["temperature"],
        }
        for p in PERSONAS
        if p["id"] in SENATOR_PERSONA_IDS
    ]
    senator_personas.insert(
        0,
        {
            "id": NEUTRAL_SENATOR["id"],
            "name": NEUTRAL_SENATOR["name"],
            "description": NEUTRAL_SENATOR["description"],
            "temperature": NEUTRAL_SENATOR["temperature"],
        },
    )
    return {
        "personas": all_personas,
        "senator_personas": senator_personas,
    }
