from collections.abc import AsyncGenerator
from typing import Any

from openai import AsyncOpenAI


class OpenAIAdapter:
    """OpenAI APIを使用したAIService実装"""

    def __init__(self, api_key: str) -> None:
        self._client = AsyncOpenAI(api_key=api_key)

    async def generate_stream(
        self,
        messages: list[dict[str, str]],
    ) -> AsyncGenerator[str, None]:
        """会話履歴を基にストリーミングレスポンスを生成"""
        input_messages: Any = messages

        stream = await self._client.responses.create(
            model="gpt-4o-mini",
            input=input_messages,
            stream=True,
        )

        async for event in stream:
            if event.type == "response.output_text.delta":
                if event.delta:
                    yield event.delta

    async def generate_title(self, content: str) -> str:
        """メッセージ内容からチャットのタイトルを生成"""
        prompt = (
            "以下のメッセージに対する簡潔なタイトルを10文字以内の日本語で生成してください。"
            "タイトルのみを出力し、句読点や記号は含めないでください:\n\n"
            f"{content}"
        )

        response = await self._client.responses.create(
            model="gpt-4o-mini",
            input=[{"role": "user", "content": prompt}],
        )

        title = ""
        for item in response.output:
            if item.type == "message":
                for content_item in item.content:
                    if content_item.type == "output_text":
                        title = content_item.text
                        break

        return title.strip()[:20]
