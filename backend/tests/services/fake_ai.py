from collections.abc import AsyncGenerator
from typing import Any


class FakeAIService:
    """テスト用AIServiceフェイク実装"""

    def __init__(
        self,
        stream_chunks: list[str] | None = None,
        title: str = "テストタイトル",
    ) -> None:
        self._stream_chunks = stream_chunks or ["Hello", " ", "World"]
        self._title = title
        self.generate_title_calls: list[str] = []
        self.generate_stream_calls: list[Any] = []

    async def generate_stream(
        self,
        messages: list[dict[str, str]],
    ) -> AsyncGenerator[str, None]:
        self.generate_stream_calls.append(messages)
        for chunk in self._stream_chunks:
            yield chunk

    async def generate_title(self, content: str) -> str:
        self.generate_title_calls.append(content)
        return self._title
