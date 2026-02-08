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


async def generate_title(content: str) -> str:
    """メッセージ内容からチャットのタイトルを生成"""
    prompt = (
        "以下のメッセージに対する簡潔なタイトルを10文字以内の日本語で生成してください。"
        "タイトルのみを出力し、句読点や記号は含めないでください:\n\n"
        f"{content}"
    )

    response = await client.responses.create(
        model="gpt-4o-mini",
        input=[{"role": "user", "content": prompt}],
    )

    # レスポンスからテキストを抽出
    title = ""
    for item in response.output:
        if item.type == "message":
            for content_item in item.content:
                if content_item.type == "output_text":
                    title = content_item.text
                    break

    return title.strip()[:20]  # 最大20文字に制限
