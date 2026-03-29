from collections.abc import AsyncGenerator

from app.ai.protocol import AIService
from app.exceptions import ThreadNotFound
from app.models.models import Message
from app.repositories.message_repository import MessageRepository
from app.repositories.thread_repository import ThreadRepository
from app.schemas.message import MessageCreate


class MessageService:
    """メッセージに関するユースケース"""

    def __init__(
        self,
        thread_repo: ThreadRepository,
        message_repo: MessageRepository,
        ai: AIService,
    ) -> None:
        self._thread_repo = thread_repo
        self._message_repo = message_repo
        self._ai = ai

    async def get_messages(self, thread_id: str) -> list[Message]:
        await self._ensure_thread_exists(thread_id)
        return await self._message_repo.get_by_thread(thread_id)

    async def create_user_message(
        self,
        thread_id: str,
        data: MessageCreate,
    ) -> Message:
        await self._ensure_thread_exists(thread_id)
        return await self._message_repo.create_user_message(thread_id, data)

    async def stream_reply(
        self,
        thread_id: str,
        data: MessageCreate,
    ) -> AsyncGenerator[str, None]:
        """ユーザーメッセージを保存し、AIストリーミング応答を生成して保存"""
        await self._ensure_thread_exists(thread_id)

        await self._message_repo.create_user_message(thread_id, data)
        messages = await self._message_repo.get_by_thread(thread_id)

        input_messages = [{"role": m.role, "content": m.content} for m in messages]

        full_response = ""
        async for chunk in self._ai.generate_stream(input_messages):
            full_response += chunk
            yield chunk

        await self._message_repo.create_assistant_message(thread_id, full_response)

    async def _ensure_thread_exists(self, thread_id: str) -> None:
        thread = await self._thread_repo.get_by_id(thread_id)
        if thread is None:
            raise ThreadNotFound(thread_id)
