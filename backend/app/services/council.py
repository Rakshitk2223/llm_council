from __future__ import annotations

import logging
from typing import AsyncGenerator

from app.config import COUNCIL_MEMBERS, SENATOR, MAX_TOKENS_COUNCIL, MAX_TOKENS_SENATOR
from app.services.llm_service import LLMService
from app.services.voting import VotingService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("council")


class CouncilService:
    def __init__(self) -> None:
        self.llm = LLMService()
        self.voting = VotingService(self.llm)

    def compact_history(self, history: list[dict]) -> list[dict]:
        compacted = []
        for message in history[-6:]:
            if message["role"] == "user":
                compacted.append({"role": "user", "content": message["content"]})
            else:
                content = message["content"]
                if len(content) > 200:
                    content = content[:200] + "..."
                compacted.append({"role": "assistant", "content": content})
        return compacted

    async def run_council(
        self,
        query: str,
        session_history: list[dict],
        mode: str = "comprehensive",
    ) -> AsyncGenerator[dict, None]:
        logger.info(f"=== COUNCIL START === Mode: {mode}")
        logger.info(f"Query: {query[:100]}...")

        history = self.compact_history(session_history)
        messages = history + [{"role": "user", "content": query}]

        yield {"event": "council_start", "data": {"phase": "answering", "mode": mode}}

        responses = []
        for member in COUNCIL_MEMBERS:
            logger.info(f"[{member['name']}] Starting response...")
            yield {
                "event": "thinking",
                "data": {"member": member["name"], "member_id": member["id"]},
            }

            full_response = ""
            async for chunk in self.llm.generate_response_stream(
                model=member["model"],
                system_prompt=member["persona"],
                messages=messages,
                temperature=member["temperature"],
                max_tokens=MAX_TOKENS_COUNCIL,
            ):
                full_response += chunk
                yield {
                    "event": "answer_chunk",
                    "data": {
                        "member": member["name"],
                        "member_id": member["id"],
                        "chunk": chunk,
                    },
                }

            yield {
                "event": "answer_complete",
                "data": {
                    "member": member["name"],
                    "member_id": member["id"],
                    "full_answer": full_response,
                },
            }
            logger.info(
                f"[{member['name']}] Done. Response length: {len(full_response)} chars"
            )

            responses.append({"member_id": member["id"], "response": full_response})

        if mode == "fast":
            logger.info("[VOTING] Skipped (fast mode)")
            yield {"event": "voting_skipped", "data": {"phase": "skipped"}}
            aggregated = [
                {
                    "member_id": r["member_id"],
                    "member_name": next(
                        m["name"] for m in COUNCIL_MEMBERS if m["id"] == r["member_id"]
                    ),
                    "average_scores": {},
                    "overall_average": 0,
                }
                for r in responses
            ]
            votes = {}
        else:
            logger.info("[VOTING] Starting voting phase...")
            yield {"event": "voting_start", "data": {"phase": "voting"}}

            labeled_responses, mapping = self.voting.shuffle_responses(responses)
            votes = await self.voting.collect_votes(
                query=query,
                labeled_responses=labeled_responses,
                voters=COUNCIL_MEMBERS,
            )
            aggregated = self.voting.aggregate_scores(votes, mapping)
            logger.info(f"[VOTING] Complete. Results: {len(aggregated)} members rated")

            yield {
                "event": "voting_complete",
                "data": {
                    "results": aggregated,
                    "mapping": {
                        label: next(
                            member["name"]
                            for member in COUNCIL_MEMBERS
                            if member["id"] == member_id
                        )
                        for label, member_id in mapping.items()
                    },
                    "votes": votes,
                },
            }

        logger.info("[SENATOR] Starting verdict generation...")
        yield {
            "event": "senator_start",
            "data": {"phase": "verdict", "member": SENATOR["name"]},
        }

        if mode == "fast":
            senator_context = self._format_senator_context_fast(
                query=query,
                responses=responses,
            )
        else:
            senator_context = self._format_senator_context(
                query=query,
                responses=responses,
                aggregated=aggregated,
                votes=votes,
            )
        logger.info(f"[SENATOR] Context length: {len(senator_context)} chars")

        full_verdict = ""
        try:
            async for chunk in self.llm.generate_response_stream(
                model=SENATOR["model"],
                system_prompt=SENATOR["persona"],
                messages=[{"role": "user", "content": senator_context}],
                temperature=SENATOR["temperature"],
                max_tokens=MAX_TOKENS_SENATOR,
            ):
                full_verdict += chunk
                yield {"event": "verdict_chunk", "data": {"chunk": chunk}}
            logger.info(f"[SENATOR] Done. Verdict length: {len(full_verdict)} chars")
        except Exception as e:
            logger.error(f"[SENATOR] Error: {str(e)}")
            error_msg = f"Senator encountered an error: {str(e)}"
            if full_verdict:
                yield {
                    "event": "verdict_chunk",
                    "data": {"chunk": f"\n\n[Response interrupted]"},
                }
            else:
                yield {
                    "event": "verdict_chunk",
                    "data": {"chunk": "Unable to generate verdict. Please try again."},
                }

        highest_rated = aggregated[0] if aggregated else None
        yield {
            "event": "verdict_complete",
            "data": {
                "verdict": full_verdict or "Verdict could not be completed.",
                "highest_rated_member_id": highest_rated["member_id"]
                if highest_rated
                else None,
                "highest_rated_member_name": highest_rated["member_name"]
                if highest_rated
                else None,
            },
        }
        logger.info("=== COUNCIL COMPLETE ===")

    def _format_senator_context(
        self,
        query: str,
        responses: list[dict],
        aggregated: list[dict],
        votes: dict,
    ) -> str:
        response_details = []
        for idx, result in enumerate(aggregated):
            member_id = result["member_id"]
            response_text = next(
                response["response"]
                for response in responses
                if response["member_id"] == member_id
            )
            member_name = result["member_name"]
            scores = result["average_scores"]
            overall = result["overall_average"]
            rank_note = "(HIGHEST RATED)" if idx == 0 else f"(Rank #{idx + 1})"
            response_details.append(
                """
{member_name}'s Response {rank_note}:
"{response_text}"

Scores: Accuracy: {accuracy:.1f} | Relevance: {relevance:.1f} | Clarity: {clarity:.1f} | Completeness: {completeness:.1f} | Confidence: {factual_confidence:.1f}
Overall: {overall:.1f}/10
""".format(
                    member_name=member_name,
                    rank_note=rank_note,
                    response_text=response_text,
                    accuracy=scores.get("accuracy", 0),
                    relevance=scores.get("relevance", 0),
                    clarity=scores.get("clarity", 0),
                    completeness=scores.get("completeness", 0),
                    factual_confidence=scores.get("factual_confidence", 0),
                    overall=overall,
                )
            )
        return """Question: {query}

Council Responses (ranked by score):

{response_details}

Analyze the responses and give YOUR final answer. Match the format to what was asked.""".format(
            query=query,
            response_details="\n\n".join(response_details),
        )

    def _format_senator_context_fast(
        self,
        query: str,
        responses: list[dict],
    ) -> str:
        response_details = []
        for response in responses:
            member_id = response["member_id"]
            member_name = next(
                m["name"] for m in COUNCIL_MEMBERS if m["id"] == member_id
            )
            response_details.append(
                """
{member_name}'s Response:
"{response_text}"
""".format(
                    member_name=member_name,
                    response_text=response["response"],
                )
            )
        return """Question: {query}

Council Responses:

{response_details}

Analyze the responses and give YOUR final answer. Match the format to what was asked.""".format(
            query=query,
            response_details="\n\n".join(response_details),
        )
