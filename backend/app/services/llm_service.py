import logging
from dataclasses import dataclass, field
from typing import AsyncGenerator, Optional

from openai import AsyncAzureOpenAI, AsyncOpenAI

from app.config import (
    settings,
    COUNCIL_MODELS,
    SENATOR_MODELS,
    AVAILABLE_MODELS,
)

logger = logging.getLogger("council")


@dataclass
class TokenUsage:
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    total_words: int = 0

    def add(self, prompt: int, completion: int, total: int, words: int = 0) -> None:
        self.prompt_tokens += prompt
        self.completion_tokens += completion
        self.total_tokens += total
        self.total_words += words


@dataclass
class TokenTracker:
    council_responses: TokenUsage = field(default_factory=TokenUsage)
    voting: TokenUsage = field(default_factory=TokenUsage)
    senator: TokenUsage = field(default_factory=TokenUsage)

    def get_summary(self) -> dict:
        return {
            "council_responses": {
                "prompt_tokens": self.council_responses.prompt_tokens,
                "completion_tokens": self.council_responses.completion_tokens,
                "total_tokens": self.council_responses.total_tokens,
                "total_words": self.council_responses.total_words,
            },
            "voting": {
                "prompt_tokens": self.voting.prompt_tokens,
                "completion_tokens": self.voting.completion_tokens,
                "total_tokens": self.voting.total_tokens,
                "total_words": self.voting.total_words,
            },
            "senator": {
                "prompt_tokens": self.senator.prompt_tokens,
                "completion_tokens": self.senator.completion_tokens,
                "total_tokens": self.senator.total_tokens,
                "total_words": self.senator.total_words,
            },
            "total": {
                "prompt_tokens": (
                    self.council_responses.prompt_tokens
                    + self.voting.prompt_tokens
                    + self.senator.prompt_tokens
                ),
                "completion_tokens": (
                    self.council_responses.completion_tokens
                    + self.voting.completion_tokens
                    + self.senator.completion_tokens
                ),
                "total_tokens": (
                    self.council_responses.total_tokens
                    + self.voting.total_tokens
                    + self.senator.total_tokens
                ),
                "total_words": (
                    self.council_responses.total_words
                    + self.voting.total_words
                    + self.senator.total_words
                ),
            },
        }


class LLMService:
    def __init__(self) -> None:
        self.clients = self._create_clients()
        self.model_map = self._build_model_map()

    def _create_clients(self) -> dict:
        """Create clients for all configured providers."""
        clients = {}

        # Primary: Azure OpenAI
        if settings.azure_openai_endpoint and settings.azure_openai_api_key:
            azure_endpoint = settings.azure_openai_endpoint
            if azure_endpoint.endswith("/"):
                azure_endpoint = azure_endpoint[:-1]
            clients["azure"] = AsyncAzureOpenAI(
                azure_endpoint=azure_endpoint,
                api_key=settings.azure_openai_api_key,
                api_version=settings.azure_openai_api_version,
            )
            logger.info("[LLM] Azure OpenAI client initialized")

        # Secondary: Azure Foundry (becomes primary if Azure OpenAI not configured)
        if settings.azure_foundry_endpoint and settings.azure_foundry_api_key:
            foundry_endpoint = settings.azure_foundry_endpoint
            if foundry_endpoint.endswith("/"):
                foundry_endpoint = foundry_endpoint[:-1]
            clients["azure_foundry"] = AsyncAzureOpenAI(
                azure_endpoint=foundry_endpoint,
                api_key=settings.azure_foundry_api_key,
                api_version=settings.azure_openai_api_version,
            )
            logger.info("[LLM] Azure Foundry client initialized")

        # Third-party: Anthropic (for Claude models)
        if settings.anthropic_api_key:
            # Anthropic uses its own client, but we'll use OpenAI-compatible endpoint if available
            # For now, we'll need to implement this separately
            logger.info("[LLM] Anthropic API key configured (Claude models)")

        # Third-party: xAI (for Grok models)
        if settings.xai_api_key:
            # xAI uses OpenAI-compatible API
            clients["xai"] = AsyncOpenAI(
                base_url="https://api.x.ai/v1",
                api_key=settings.xai_api_key,
            )
            logger.info("[LLM] xAI client initialized (Grok models)")

        if not clients:
            raise RuntimeError(
                "No LLM providers configured. Please set at least one of: "
                "AZURE_OPENAI_ENDPOINT + AZURE_OPENAI_API_KEY, or "
                "AZURE_FOUNDRY_ENDPOINT + AZURE_FOUNDRY_API_KEY"
            )

        return clients

    def _build_model_map(self) -> dict:
        """Build a map of model_id -> provider."""
        model_map = {}
        for model in AVAILABLE_MODELS:
            model_map[model["id"]] = model["provider"]
        return model_map

    def _get_client_for_model(self, model: str):
        """Get the appropriate client for a model."""
        provider = self.model_map.get(model, "azure")

        # Route to appropriate client
        if provider == "azure":
            if "azure" in self.clients:
                return self.clients["azure"], model
            elif "azure_foundry" in self.clients:
                return self.clients["azure_foundry"], model
            else:
                raise RuntimeError(f"Azure provider not configured for model {model}")

        elif provider == "xai":
            if "xai" in self.clients:
                return self.clients["xai"], model
            else:
                raise RuntimeError(
                    f"xAI provider not configured for model {model}. "
                    f"Please add XAI_API_KEY to your .env file"
                )

        elif provider == "anthropic":
            # For now, Claude models need Anthropic client
            if settings.anthropic_api_key:
                # We'll need to implement Anthropic-specific handling
                # For now, raise an error with instructions
                raise RuntimeError(
                    f"Claude model {model} requires Anthropic provider. "
                    f"Anthropic support will be implemented soon. "
                    f"Please use Azure or xAI models for now."
                )
            else:
                raise RuntimeError(
                    f"Anthropic API key not configured for model {model}"
                )

        # Default fallback
        if "azure" in self.clients:
            return self.clients["azure"], model
        elif "azure_foundry" in self.clients:
            return self.clients["azure_foundry"], model
        else:
            raise RuntimeError(f"No suitable provider found for model {model}")

    async def generate_response(
        self,
        model: str,
        system_prompt: str,
        messages: list[dict],
        temperature: float,
        max_tokens: int = 512,
        token_usage: TokenUsage | None = None,
    ) -> str:
        client, actual_model = self._get_client_for_model(model)

        try:
            response = await client.chat.completions.create(
                model=actual_model,
                messages=[{"role": "system", "content": system_prompt}, *messages],
                temperature=temperature,
                max_tokens=max_tokens,
            )
            if response.usage:
                logger.info(
                    f"[TOKENS] Prompt: {response.usage.prompt_tokens}, "
                    f"Completion: {response.usage.completion_tokens}, "
                    f"Total: {response.usage.total_tokens}"
                )
                if token_usage:
                    token_usage.add(
                        response.usage.prompt_tokens,
                        response.usage.completion_tokens,
                        response.usage.total_tokens,
                    )
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"[LLM] Error generating response: {str(e)}")
            raise

    async def generate_response_stream(
        self,
        model: str,
        system_prompt: str,
        messages: list[dict],
        temperature: float,
        max_tokens: int = 512,
        token_usage: TokenUsage | None = None,
    ) -> AsyncGenerator[str, None]:
        client, actual_model = self._get_client_for_model(model)
        char_count = 0

        try:
            response = await client.chat.completions.create(
                model=actual_model,
                messages=[{"role": "system", "content": system_prompt}, *messages],
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
                stream_options={"include_usage": True},
            )
            async for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    char_count += len(content)
                    yield content
                if chunk.usage:
                    logger.info(
                        f"[TOKENS] Stream - Prompt: {chunk.usage.prompt_tokens}, "
                        f"Completion: {chunk.usage.completion_tokens}, "
                        f"Total: {chunk.usage.total_tokens}"
                    )
                    if token_usage:
                        token_usage.add(
                            chunk.usage.prompt_tokens,
                            chunk.usage.completion_tokens,
                            chunk.usage.total_tokens,
                        )
        except Exception as e:
            logger.error(f"[LLM] Stream error: {str(e)}")
            yield f"\n\n[Stream error: {str(e)[:100]}]"
