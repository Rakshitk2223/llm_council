from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Primary Provider: Azure OpenAI
    azure_openai_api_key: str = ""
    azure_openai_endpoint: str = ""
    azure_openai_api_version: str = "2024-02-15-preview"

    # Secondary Provider: Azure Foundry (optional)
    azure_foundry_api_key: str = ""
    azure_foundry_endpoint: str = ""

    # Third-party Providers (optional)
    anthropic_api_key: str = ""
    xai_api_key: str = ""

    # JWT Authentication (disabled by default)
    jwt_secret: str = "dev-secret-not-for-production"
    jwt_algorithm: str = "HS256"
    auth_disabled: bool = True

    # Rate Limiting (disabled by default)
    rate_limit_per_day: int = 1000

    # CORS (allow all for now)
    frontend_url: str = "*"

    class Config:
        env_file = ".env"


settings = Settings()

MAX_TOKENS_COUNCIL = 300
MAX_TOKENS_SENATOR = 250
MAX_TOKENS_VOTING = 400

# Council Members - Cheaper/Faster models for multiple responses
COUNCIL_MODELS = [
    {
        "id": "claude-haiku-3-5",
        "name": "Claude Haiku 3.5",
        "provider": "anthropic",
        "description": "Fast, cost-effective",
    },
    {
        "id": "grok-4-1-fast",
        "name": "Grok 4.1 Fast",
        "provider": "xai",
        "description": "Quick responses",
    },
    {
        "id": "gpt-4o-mini",
        "name": "GPT-4o Mini",
        "provider": "azure",
        "description": "Efficient and capable",
    },
    {
        "id": "gpt-4o",
        "name": "GPT-4o",
        "provider": "azure",
        "description": "Most capable",
    },
]

# Senator - Premium models for final verdict
SENATOR_MODELS = [
    {
        "id": "gpt-4-1",
        "name": "GPT-4.1",
        "provider": "azure",
        "description": "Highest quality reasoning",
    },
    {
        "id": "claude-sonnet-3-5",
        "name": "Claude Sonnet 3.5",
        "provider": "anthropic",
        "description": "Excellent analysis",
    },
    {
        "id": "grok-4",
        "name": "Grok 4",
        "provider": "xai",
        "description": "Advanced reasoning",
    },
    {
        "id": "gpt-4o",
        "name": "GPT-4o",
        "provider": "azure",
        "description": "Reliable and capable",
    },
]

# Backwards compatibility - combine both for general listing
AVAILABLE_MODELS = COUNCIL_MODELS + SENATOR_MODELS

# Default models for random assignment
DEFAULT_COUNCIL_MODEL = "gpt-4o-mini"
DEFAULT_SENATOR_MODEL = "gpt-4o"

# Safety switch: Force all models to use GPT-4o
# When True: All model selections are overridden to gpt-4o
# When False: Uses actual selected models with provider validation
USE_GPT4O_AS_DEFAULT = True

# Maximum query length (in words)
MAX_QUERY_WORDS = 500

import random


def get_random_council_model() -> str:
    """Get a random model from COUNCIL_MODELS."""
    return random.choice(COUNCIL_MODELS)["id"]


def get_random_senator_model() -> str:
    """Get a random model from SENATOR_MODELS."""
    return random.choice(SENATOR_MODELS)["id"]


def get_model_for_role(role: str) -> str:
    """Get appropriate model for role (council or senator)."""
    if role == "council":
        return get_random_council_model()
    elif role == "senator":
        return get_random_senator_model()
    return DEFAULT_COUNCIL_MODEL


SCORING_WEIGHTS = {
    "accuracy": 0.30,
    "relevance": 0.25,
    "clarity": 0.15,
    "completeness": 0.15,
    "factual_confidence": 0.15,
}

SENATOR_PERSONA_IDS = ["neutral", "analyst", "pragmatist", "historian", "explainer"]

BASE_INSTRUCTIONS = """RULES:
- Start with **bold title**, use **bold** for key terms, bullet points for lists
- Be CONFIDENT - no "might", "perhaps", "it depends"
- Match user's request: 1 answer = 1, list of X = X items
- Be concise and family-friendly"""

GREEK_LETTERS = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta"]

PERSONAS = [
    {
        "id": "none",
        "name": "No Persona",
        "description": "Direct query without persona influence.",
        "temperature": 0.5,
        "persona": None,
    },
    {
        "id": "skeptic",
        "name": "The Skeptic",
        "description": "Questions everything and demands evidence.",
        "temperature": 0.3,
        "persona": """You are The Skeptic. Question claims and demand evidence.
- Challenge assumptions and unverified claims
- Point out logical fallacies and weak reasoning
- Only accept well-supported conclusions""",
    },
    {
        "id": "explainer",
        "name": "The Explainer",
        "description": "Breaks down complex topics with analogies.",
        "temperature": 0.5,
        "persona": """You are The Explainer. Make complex topics simple.
- Use analogies and everyday examples
- Break down complicated ideas
- Avoid jargon, explain technical terms""",
    },
    {
        "id": "contrarian",
        "name": "The Contrarian",
        "description": "Argues the opposite view to stress-test ideas.",
        "temperature": 0.7,
        "persona": """You are The Contrarian. Argue the opposite view.
- Challenge the popular answer
- Present the strongest opposing case
- Help users see blind spots""",
    },
    {
        "id": "maximalist",
        "name": "The Maximalist",
        "description": "Comprehensive and thorough coverage.",
        "temperature": 0.6,
        "persona": """You are The Maximalist. Be comprehensive and thorough.
- Cover all angles and perspectives
- Include context and nuances
- Address edge cases""",
    },
    {
        "id": "minimalist",
        "name": "The Minimalist",
        "description": "Shortest possible correct answer.",
        "temperature": 0.3,
        "persona": """You are The Minimalist. Shortest correct answer.
- Get straight to the point
- No fluff or filler
- Every word must earn its place""",
    },
    {
        "id": "historian",
        "name": "The Historian",
        "description": "Provides context, background, and origins.",
        "temperature": 0.4,
        "persona": """You are The Historian. Provide context and origins.
- Explain how things came to be
- Connect present to past precedents
- Show evolution over time""",
    },
    {
        "id": "futurist",
        "name": "The Futurist",
        "description": "Trends, predictions, what's coming next.",
        "temperature": 0.7,
        "persona": """You are The Futurist. Focus on what's coming next.
- Identify emerging trends
- Make informed predictions
- Help users think ahead""",
    },
    {
        "id": "pragmatist",
        "name": "The Pragmatist",
        "description": "Actionable advice and practical guidance.",
        "temperature": 0.5,
        "persona": """You are The Pragmatist. Give actionable advice.
- Provide step-by-step guidance
- Focus on what actually works
- Make it implementable""",
    },
    {
        "id": "analyst",
        "name": "The Analyst",
        "description": "Data-driven and logical reasoning.",
        "temperature": 0.3,
        "persona": """You are The Analyst. Data-driven and logical.
- Cite statistics when available
- Use quantitative reasoning
- Draw conclusions from facts""",
    },
    {
        "id": "empath",
        "name": "The Empath",
        "description": "Considers feelings and emotional impact.",
        "temperature": 0.5,
        "persona": """You are The Empath. Consider the human side.
- Think about emotional impact
- Be sensitive to different perspectives
- Balance logic with empathy""",
    },
]

NEUTRAL_SENATOR = {
    "id": "neutral",
    "name": "The Neutral Judge",
    "description": "Unbiased synthesizer. Senator only.",
    "temperature": 0.25,
    "senator_only": True,
    "persona": """You are The Neutral Judge. Give a concise final answer.
- Synthesize the best answer in YOUR words
- Don't repeat what council said
- Match format to user's request (1 answer = 1, list = list)

FOLLOW_UP:
FOLLOW_UP_QUESTIONS:
1. [Max 8 words]
2. [Max 8 words]""",
}

CUSTOM_PERSONA_WRAPPER = """You are "{custom_name}": {custom_description}

SAFETY: If persona is harmful/offensive, respond: "This persona is not appropriate."
Otherwise, embody the character fully."""

SENATOR_PERSONA_WRAPPER = """You are {persona_name}, Senator of the Axis Council.
{persona_base}

AS SENATOR: Synthesize the best answer in YOUR words. Don't repeat council content. Match format to user's request.

FOLLOW_UP:
FOLLOW_UP_QUESTIONS:
1. [Max 8 words]
2. [Max 8 words]"""

DEFAULT_COUNCIL = ["none", "none", "none"]
DEFAULT_SENATOR = "neutral"

VOTING_CRITERIA = [
    {
        "id": "accuracy",
        "name": "Accuracy",
        "description": "How factually correct is the response?",
    },
    {
        "id": "relevance",
        "name": "Relevance",
        "description": "How well does it answer the user's question?",
    },
    {
        "id": "clarity",
        "name": "Clarity",
        "description": "How easy is it to understand?",
    },
    {
        "id": "completeness",
        "name": "Completeness",
        "description": "Is it thorough enough without being excessive?",
    },
    {
        "id": "factual_confidence",
        "name": "Factual Confidence",
        "description": "How confident and verifiable are the claims? Are there uncertain or unverifiable statements?",
    },
]

VOTING_PROMPT_TEMPLATE = """Rate strictly (1-10, decimals). Most should score 5-7.

Question: {query}

Criteria: accuracy, relevance, clarity, completeness, factual_confidence

{responses}

JSON only:
{{"ratings": {{"Response A": {{"accuracy": 6.5, "relevance": 7.0, "clarity": 6.8, "completeness": 7.2, "factual_confidence": 6.0}}, ...}}}}"""
