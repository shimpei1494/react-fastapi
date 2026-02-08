from collections.abc import AsyncGenerator
from typing import Any

from openai import AsyncOpenAI

from app.config import get_settings
from app.models.models import Message

client = AsyncOpenAI(api_key=get_settings().openai_api_key)


async def generate_response_stream(
    messages: list[Message],
) -> AsyncGenerator[str, None]:
    """会話履歴を基にストリーミングレスポンスを生成"""
    # 型が合わないので一旦Any
    input_messages: Any = [{"role": m.role, "content": m.content} for m in messages]

    stream = await client.responses.create(
        model="gpt-4o-mini",
        input=input_messages,
        stream=True,
    )

    async for event in stream:
        # テキストデルタイベントを処理
        if event.type == "response.output_text.delta":
            if event.delta:
                yield event.delta
