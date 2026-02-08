import re
from dataclasses import dataclass


@dataclass
class QueryClassification:
    query_type: str
    temperature: float
    use_emojis: bool


CREATIVE_PATTERNS = [
    r"\b(joke|jokes|funny|humor|humour)\b",
    r"\b(poem|poetry|rhyme|verse)\b",
    r"\b(story|stories|tale|narrative)\b",
    r"\b(write|create|compose|make up|invent)\b",
    r"\b(fun fact|interesting fact|cool fact)\b",
    r"\b(animal|animals|pet|pets|dog|cat|bird)\b",
    r"\b(game|games|play|riddle|puzzle)\b",
    r"\b(imagine|creative|fantasy|fiction)\b",
    r"\b(song|lyrics|music)\b",
    r"\b(dream|wish|magic)\b",
    r"\b(best|worst|favorite|favourite)\b.*\b(movie|book|food|song|game)\b",
]

FACTUAL_PATTERNS = [
    r"\b(constitution|law|laws|legal|legislation|act|amendment)\b",
    r"\b(history|historical|ancient|medieval)\b",
    r"\b(science|scientific|physics|chemistry|biology)\b",
    r"\b(mathematics|math|equation|formula|calculate)\b",
    r"\b(definition|define|meaning|means)\b",
    r"\b(when was|when did|when is|what year|what date)\b",
    r"\b(who was|who is|who invented|who discovered|who founded)\b",
    r"\b(where is|where was|located|capital of)\b",
    r"\b(how many|how much|number of|count|total)\b",
    r"\b(explain|describe|what is|what are|what does)\b",
    r"\b(government|president|minister|parliament|congress)\b",
    r"\b(economy|economic|gdp|inflation|market)\b",
    r"\b(war|battle|treaty|independence)\b",
    r"\b(planet|solar|galaxy|universe|space)\b",
    r"\b(medical|medicine|disease|symptom|treatment)\b",
]


def classify_query(query: str) -> QueryClassification:
    query_lower = query.lower()

    creative_score = 0
    for pattern in CREATIVE_PATTERNS:
        if re.search(pattern, query_lower):
            creative_score += 1

    factual_score = 0
    for pattern in FACTUAL_PATTERNS:
        if re.search(pattern, query_lower):
            factual_score += 1

    if creative_score > factual_score and creative_score >= 1:
        return QueryClassification(
            query_type="creative",
            temperature=0.7,
            use_emojis=True,
        )
    elif factual_score > creative_score and factual_score >= 1:
        return QueryClassification(
            query_type="factual",
            temperature=0.25,
            use_emojis=False,
        )
    else:
        return QueryClassification(
            query_type="balanced",
            temperature=0.4,
            use_emojis=False,
        )
