from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field, ConfigDict


class Message(BaseModel):
    role: str
    content: str
    member_name: Optional[str] = None


class CustomPersona(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    name: str = Field(..., max_length=50)
    description: str = Field(..., max_length=500)
    temperature: float = Field(default=0.5, ge=0.1, le=1.0)
    model_id: Optional[str] = None


class CouncilMemberConfig(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    persona_id: str
    model_id: str


class CouncilConfig(BaseModel):
    council_members: list[CouncilMemberConfig] = Field(..., min_length=2, max_length=8)
    senator_persona: str
    senator_model: str
    custom_persona: Optional[CustomPersona] = None


class QueryRequest(BaseModel):
    query: str
    session_history: list[Message] = []
    mode: Literal["fast", "comprehensive", "deep"] = "comprehensive"
    council_config: Optional[CouncilConfig] = None


class CouncilMemberResponse(BaseModel):
    member_id: str
    member_name: str
    response: str


class VotingResult(BaseModel):
    response_label: str
    member_id: str
    member_name: str
    ratings: dict[str, dict[str, int]]
    average_scores: dict[str, float]
    overall_average: float


class SenatorVerdict(BaseModel):
    verdict: str
    highest_rated_member_id: str | None
    highest_rated_member_name: str | None


class ErrorResponse(BaseModel):
    error: str
    code: str
