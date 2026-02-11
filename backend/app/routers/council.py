import json
import traceback

from sse_starlette.sse import EventSourceResponse
from fastapi import APIRouter, Depends

from app.config import (
    COUNCIL_MODELS,
    SENATOR_MODELS,
    PERSONAS,
    NEUTRAL_SENATOR,
    SENATOR_PERSONA_IDS,
)
from app.middleware.auth import get_current_user
from app.middleware.rate_limit import check_rate_limit, get_remaining_queries
from app.models.schemas import QueryRequest
from app.services.council import CouncilService

router = APIRouter(prefix="/api/council", tags=["council"])


@router.post("/query")
async def query_council(
    request: QueryRequest,
    user_id: str = Depends(get_current_user),
    rate_limit_ok: bool = Depends(check_rate_limit),
):
    _ = rate_limit_ok
    _ = user_id
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
        except Exception as e:
            print(f"Council error: {e}")
            traceback.print_exc()
            yield {
                "event": "error",
                "data": json.dumps(
                    {
                        "error": f"Council error: {str(e)[:200]}",
                        "code": "COUNCIL_ERROR",
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
