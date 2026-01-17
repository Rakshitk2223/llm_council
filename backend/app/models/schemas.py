from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel


class Message(BaseModel):
    role: str
    content: str
    member_name: Optional[str] = None


class QueryRequest(BaseModel):
    query: str
    session_history: list[Message] = []
    mode: Literal["fast", "comprehensive"] = "comprehensive"


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
