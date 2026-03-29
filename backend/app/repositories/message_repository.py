import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Message, Thread
from app.schemas.message import MessageCreate
from app.types.message import MessageRole


class MessageRepository:
    """メッセージのDB操作"""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_thread(self, thread_id: str) -> list[Message]:
        result = await self._db.execute(
            select(Message)
            .where(Message.thread_id == thread_id)
            .order_by(Message.created_at.asc())
        )
        return list(result.scalars().all())

    async def create_user_message(
        self,
        thread_id: str,
        data: MessageCreate,
    ) -> Message:
        user_message = Message(
            id=str(uuid.uuid4()),
            thread_id=thread_id,
            role=MessageRole.USER,
            content=data.content,
        )
        self._db.add(user_message)

        thread = await self._db.get(Thread, thread_id)
        if thread:
            thread.last_message = data.content

        await self._db.commit()
        await self._db.refresh(user_message)
        return user_message

    async def create_assistant_message(
        self,
        thread_id: str,
        content: str,
    ) -> Message:
        assistant_message = Message(
            id=str(uuid.uuid4()),
            thread_id=thread_id,
            role=MessageRole.ASSISTANT,
            content=content,
        )
        self._db.add(assistant_message)
        await self._db.commit()
        await self._db.refresh(assistant_message)
        return assistant_message
