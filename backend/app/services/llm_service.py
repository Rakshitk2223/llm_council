from typing import AsyncGenerator

from openai import AsyncAzureOpenAI, AsyncOpenAI

from app.config import settings


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

    async def generate_response(
        self,
        model: str,
        system_prompt: str,
        messages: list[dict],
        temperature: float,
        max_tokens: int = 512,
    ) -> str:
        response = await self.client.chat.completions.create(
            model=model,
            messages=[{"role": "system", "content": system_prompt}, *messages],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content or ""

    async def generate_response_stream(
        self,
        model: str,
        system_prompt: str,
        messages: list[dict],
        temperature: float,
        max_tokens: int = 512,
    ) -> AsyncGenerator[str, None]:
        try:
            response = await self.client.chat.completions.create(
                model=model,
                messages=[{"role": "system", "content": system_prompt}, *messages],
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
            )
            async for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            yield f"\n\n[Stream error: {str(e)[:100]}]"
