import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Message, Thread
from app.schemas.message import MessageCreate
from app.types.message import MessageRole


async def get_messages_by_thread(db: AsyncSession, thread_id: str) -> list[Message]:
    result = await db.execute(
        select(Message)
        .where(Message.thread_id == thread_id)
        .order_by(Message.created_at.asc())
    )
    return list(result.scalars().all())


async def create_user_message(
    db: AsyncSession,
    thread_id: str,
    data: MessageCreate,
) -> Message:
    """ユーザーメッセージのみ作成"""
    user_message = Message(
        id=str(uuid.uuid4()),
        thread_id=thread_id,
        role=MessageRole.USER,
        content=data.content,
    )
    db.add(user_message)

    thread = await db.get(Thread, thread_id)
    if thread:
        thread.last_message = data.content

    await db.commit()
    await db.refresh(user_message)
    return user_message


async def create_assistant_message(
    db: AsyncSession,
    thread_id: str,
    content: str,
) -> Message:
    """アシスタントメッセージを作成"""
    assistant_message = Message(
        id=str(uuid.uuid4()),
        thread_id=thread_id,
        role=MessageRole.ASSISTANT,
        content=content,
    )
    db.add(assistant_message)
    await db.commit()
    await db.refresh(assistant_message)
    return assistant_message
