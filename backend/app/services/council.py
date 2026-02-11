from __future__ import annotations

import logging
from typing import AsyncGenerator, Optional

from app.config import (
    PERSONAS,
    NEUTRAL_SENATOR,
    GREEK_LETTERS,
    CUSTOM_PERSONA_WRAPPER,
    SENATOR_PERSONA_WRAPPER,
    DEFAULT_COUNCIL,
    DEFAULT_SENATOR,
    DEFAULT_MODEL,
    MAX_TOKENS_COUNCIL,
    MAX_TOKENS_SENATOR,
    BASE_INSTRUCTIONS,
)
from app.models.schemas import CouncilConfig
from app.services.llm_service import LLMService, TokenTracker
from app.services.voting import VotingService
from app.services.query_classifier import classify_query

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("council")


class CouncilService:
    def __init__(self) -> None:
        self.llm = LLMService()
        self.voting = VotingService(self.llm)

    def _get_persona(self, persona_id: str) -> Optional[dict]:
        for p in PERSONAS:
            if p["id"] == persona_id:
                return p
        if persona_id == "neutral":
            return NEUTRAL_SENATOR
        return None

    def _build_member(
        self,
        persona_id: str,
        index: int,
        model_id: str = DEFAULT_MODEL,
        custom_persona: Optional[dict] = None,
    ) -> dict:
        greek = (
            GREEK_LETTERS[index] if index < len(GREEK_LETTERS) else f"Member{index + 1}"
        )

        if persona_id == "custom" and custom_persona:
            return {
                "id": f"custom_{index}",
                "name": f"Axis {greek} - {custom_persona['name']}",
                "model": custom_persona.get("model_id") or model_id,
                "temperature": custom_persona.get("temperature", 0.5),
                "persona": f"{CUSTOM_PERSONA_WRAPPER.format(custom_name=custom_persona['name'], custom_description=custom_persona['description'])}\n\n{BASE_INSTRUCTIONS}",
            }

        persona = self._get_persona(persona_id)
        if not persona:
            persona = PERSONAS[0]

        return {
            "id": persona["id"],
            "name": f"Axis {greek} - {persona['name']}",
            "model": model_id,
            "temperature": persona["temperature"],
            "persona": f"{persona['persona']}\n\n{BASE_INSTRUCTIONS}",
        }

    def _build_senator(
        self,
        persona_id: str,
        model_id: str = DEFAULT_MODEL,
        custom_persona: Optional[dict] = None,
    ) -> dict:
        if persona_id == "custom" and custom_persona:
            base_persona = CUSTOM_PERSONA_WRAPPER.format(
                custom_name=custom_persona["name"],
                custom_description=custom_persona["description"],
            )
            return {
                "id": "senator",
                "name": f"Senator - {custom_persona['name']}",
                "model": custom_persona.get("model_id") or model_id,
                "temperature": custom_persona.get("temperature", 0.5),
                "persona": f"{SENATOR_PERSONA_WRAPPER.format(persona_name=custom_persona['name'], persona_base=base_persona)}\n\n{BASE_INSTRUCTIONS}",
            }

        if persona_id == "neutral":
            return {
                "id": "senator",
                "name": f"Senator - {NEUTRAL_SENATOR['name']}",
                "model": model_id,
                "temperature": NEUTRAL_SENATOR["temperature"],
                "persona": f"{NEUTRAL_SENATOR['persona']}\n\n{BASE_INSTRUCTIONS}",
            }

        persona = self._get_persona(persona_id)
        if not persona:
            persona = NEUTRAL_SENATOR

        return {
            "id": "senator",
            "name": f"Senator - {persona['name']}",
            "model": model_id,
            "temperature": persona["temperature"],
            "persona": f"{SENATOR_PERSONA_WRAPPER.format(persona_name=persona['name'], persona_base=persona['persona'])}\n\n{BASE_INSTRUCTIONS}",
        }

    def _build_council(
        self, council_config: Optional[CouncilConfig] = None
    ) -> tuple[list[dict], dict]:
        if council_config:
            custom_persona_dict = None
            if council_config.custom_persona:
                custom_persona_dict = {
                    "name": council_config.custom_persona.name,
                    "description": council_config.custom_persona.description,
                    "temperature": council_config.custom_persona.temperature,
                    "model_id": council_config.custom_persona.model_id,
                }

            council_members = [
                self._build_member(
                    member.persona_id,
                    idx,
                    member.model_id,
                    custom_persona_dict,
                )
                for idx, member in enumerate(council_config.council_members)
            ]
            senator = self._build_senator(
                council_config.senator_persona,
                council_config.senator_model,
                custom_persona_dict,
            )
        else:
            council_members = [
                self._build_member(pid, idx) for idx, pid in enumerate(DEFAULT_COUNCIL)
            ]
            senator = self._build_senator(DEFAULT_SENATOR)

        return council_members, senator

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
        council_config: Optional[CouncilConfig] = None,
    ) -> AsyncGenerator[dict, None]:
        council_members, senator = self._build_council(council_config)
        token_tracker = TokenTracker()

        logger.info(f"=== COUNCIL START === Mode: {mode}")
        logger.info(f"Query: {query[:100]}...")
        logger.info(f"Council: {[m['name'] for m in council_members]}")
        logger.info(f"Senator: {senator['name']}")

        query_classification = classify_query(query)
        logger.info(
            f"[CLASSIFIER] Type: {query_classification.query_type}, Temp: {query_classification.temperature}, Emojis: {query_classification.use_emojis}"
        )

        history = self.compact_history(session_history)
        messages = history + [{"role": "user", "content": query}]

        yield {"event": "council_start", "data": {"phase": "answering", "mode": mode}}

        responses = []
        for member in council_members:
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
                token_usage=token_tracker.council_responses,
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
                        m["name"] for m in council_members if m["id"] == r["member_id"]
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
                voters=council_members,
                mode=mode,
                token_usage=token_tracker.voting,
            )
            aggregated = self.voting.aggregate_scores(votes, mapping, council_members)
            logger.info(f"[VOTING] Complete. Results: {len(aggregated)} members rated")

            yield {
                "event": "voting_complete",
                "data": {
                    "results": aggregated,
                    "mapping": {
                        label: next(
                            member["name"]
                            for member in council_members
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
            "data": {"phase": "verdict", "member": senator["name"]},
        }

        if mode == "fast":
            senator_context = self._format_senator_context_fast(
                query=query,
                responses=responses,
                council_members=council_members,
            )
        else:
            senator_context = self._format_senator_context(
                query=query,
                responses=responses,
                aggregated=aggregated,
                votes=votes,
            )
        logger.info(f"[SENATOR] Context length: {len(senator_context)} chars")

        senator_persona = senator["persona"]
        if query_classification.use_emojis:
            senator_persona += (
                "\n\nUse relevant emojis to make your response fun and engaging."
            )

        full_verdict = ""
        try:
            async for chunk in self.llm.generate_response_stream(
                model=senator["model"],
                system_prompt=senator_persona,
                messages=[{"role": "user", "content": senator_context}],
                temperature=query_classification.temperature,
                max_tokens=MAX_TOKENS_SENATOR,
                token_usage=token_tracker.senator,
            ):
                full_verdict += chunk
                yield {"event": "verdict_chunk", "data": {"chunk": chunk}}
            logger.info(f"[SENATOR] Done. Verdict length: {len(full_verdict)} chars")
        except Exception as e:
            logger.error(f"[SENATOR] Error: {str(e)}")
            if full_verdict:
                yield {
                    "event": "verdict_chunk",
                    "data": {"chunk": "\n\n[Response interrupted]"},
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

        token_summary = token_tracker.get_summary()
        logger.info(f"=== TOKEN SUMMARY === {token_summary['total']}")
        yield {
            "event": "token_summary",
            "data": token_summary,
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
            scores = result["average_scores"]
            overall = result["overall_average"]
            response_details.append(
                """
Response {idx}:
"{response_text}"

Scores: Accuracy: {accuracy:.1f} | Relevance: {relevance:.1f} | Clarity: {clarity:.1f} | Completeness: {completeness:.1f} | Confidence: {factual_confidence:.1f}
Overall: {overall:.1f}/10
""".format(
                    idx=idx + 1,
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

Council Responses:

{response_details}

Give YOUR final answer. Match the format to what was asked.""".format(
            query=query,
            response_details="\n\n".join(response_details),
        )

    def _format_senator_context_fast(
        self,
        query: str,
        responses: list[dict],
        council_members: list[dict],
    ) -> str:
        response_details = []
        for response in responses:
            member_id = response["member_id"]
            member_name = next(
                m["name"] for m in council_members if m["id"] == member_id
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
