from collections.abc import AsyncGenerator
from typing import Protocol


class AIService(Protocol):
    """AIプロバイダーの抽象インターフェース"""

    def generate_stream(
        self,
        messages: list[dict[str, str]],
    ) -> AsyncGenerator[str, None]:
        """会話履歴を基にストリーミングレスポンスを生成"""
        ...

    async def generate_title(self, content: str) -> str:
        """メッセージ内容からタイトルを生成"""
        ...
