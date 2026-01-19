import json
import logging
import random

from app.config import COUNCIL_MEMBERS, VOTING_PROMPT_TEMPLATE
from app.services.llm_service import LLMService

logger = logging.getLogger("council")


class VotingService:
    def __init__(self, llm_service: LLMService) -> None:
        self.llm = llm_service

    def shuffle_responses(self, responses: list[dict]) -> tuple[list[dict], dict]:
        shuffled = responses.copy()
        random.shuffle(shuffled)
        labels = ["Response A", "Response B", "Response C", "Response D", "Response E"]
        mapping = {}
        labeled_responses = []
        for index, response in enumerate(shuffled):
            label = labels[index]
            mapping[label] = response["member_id"]
            labeled_responses.append({"label": label, "content": response["response"]})
        return labeled_responses, mapping

    def format_responses_for_voting(self, labeled_responses: list[dict]) -> str:
        formatted = []
        for response in labeled_responses:
            formatted.append(f"{response['label']}:\n{response['content']}\n")
        return "\n---\n".join(formatted)

    async def collect_votes(
        self,
        query: str,
        labeled_responses: list[dict],
        voters: list[dict],
    ) -> dict:
        formatted_responses = self.format_responses_for_voting(labeled_responses)
        prompt = VOTING_PROMPT_TEMPLATE.format(
            query=query, responses=formatted_responses
        )
        all_votes = {}
        for voter in voters[:1]:
            logger.info(f"[VOTING] Getting vote from {voter['id']}...")
            response = await self.llm.generate_response(
                model=voter["model"],
                system_prompt="You are an impartial evaluator. Rate responses objectively.",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=400,
            )
            logger.info(f"[VOTING] Raw response: {response[:200]}...")
            try:
                parsed = json.loads(response)
                all_votes[voter["id"]] = parsed["ratings"]
                logger.info(
                    f"[VOTING] Parsed successfully: {list(parsed['ratings'].keys())}"
                )
            except json.JSONDecodeError as e:
                logger.warning(f"[VOTING] JSON parse failed: {e}")
                json_match = _extract_json(response)
                if json_match:
                    try:
                        parsed = json.loads(json_match)
                        all_votes[voter["id"]] = parsed["ratings"]
                        logger.info(f"[VOTING] Extracted JSON successfully")
                    except Exception as e2:
                        logger.error(f"[VOTING] Extraction also failed: {e2}")
                else:
                    logger.error(f"[VOTING] No JSON found in response")
        logger.info(f"[VOTING] Total votes collected: {len(all_votes)}")
        return all_votes

    def aggregate_scores(self, votes: dict, mapping: dict) -> list[dict]:
        results = []
        for label, member_id in mapping.items():
            criterion_totals = {}
            criterion_counts = {}
            for voter_ratings in votes.values():
                if label in voter_ratings:
                    for criterion, score in voter_ratings[label].items():
                        criterion_totals[criterion] = (
                            criterion_totals.get(criterion, 0) + score
                        )
                        criterion_counts[criterion] = (
                            criterion_counts.get(criterion, 0) + 1
                        )
            average_scores = {
                criterion: total / criterion_counts[criterion]
                for criterion, total in criterion_totals.items()
            }
            overall_average = (
                sum(average_scores.values()) / len(average_scores)
                if average_scores
                else 0
            )
            member = next(
                (m for m in COUNCIL_MEMBERS if m["id"] == member_id),
                None,
            )
            member_name = member["name"] if member else member_id
            member_temp = member["temperature"] if member else 1.0
            results.append(
                {
                    "response_label": label,
                    "member_id": member_id,
                    "member_name": member_name,
                    "member_temperature": member_temp,
                    "average_scores": average_scores,
                    "overall_average": overall_average,
                    "all_ratings": {
                        voter_id: voter_ratings.get(label, {})
                        for voter_id, voter_ratings in votes.items()
                    },
                }
            )
        results.sort(
            key=lambda r: (r["overall_average"], -r["member_temperature"]),
            reverse=True,
        )
        return results


def _extract_json(text: str) -> str | None:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    return text[start : end + 1]
