import logging
from dataclasses import dataclass, field
from typing import AsyncGenerator

from openai import AsyncAzureOpenAI, AsyncOpenAI

from app.config import settings, DEFAULT_MODEL, USE_DEFAULT_MODEL_ONLY

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
        self.client = self._create_client()
        self.is_azure = isinstance(self.client, AsyncAzureOpenAI)

    def _create_client(self) -> AsyncOpenAI | AsyncAzureOpenAI:
        if "openai.azure.com" in settings.llm_base_url:
            azure_endpoint = settings.llm_base_url
            if azure_endpoint.endswith("/v1"):
                azure_endpoint = azure_endpoint[:-3]
            return AsyncAzureOpenAI(
                azure_endpoint=azure_endpoint,
                api_key=settings.llm_api_key,
                api_version=settings.azure_api_version,
            )
        return AsyncOpenAI(base_url=settings.llm_base_url, api_key=settings.llm_api_key)

    def _get_model(self, model: str) -> str:
        if USE_DEFAULT_MODEL_ONLY:
            return DEFAULT_MODEL
        return model

    async def generate_response(
        self,
        model: str,
        system_prompt: str,
        messages: list[dict],
        temperature: float,
        max_tokens: int = 512,
        token_usage: TokenUsage | None = None,
    ) -> str:
        actual_model = self._get_model(model)
        response = await self.client.chat.completions.create(
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

    async def generate_response_stream(
        self,
        model: str,
        system_prompt: str,
        messages: list[dict],
        temperature: float,
        max_tokens: int = 512,
        token_usage: TokenUsage | None = None,
    ) -> AsyncGenerator[str, None]:
        actual_model = self._get_model(model)
        char_count = 0
        try:
            response = await self.client.chat.completions.create(
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
