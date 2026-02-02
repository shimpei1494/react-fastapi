import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.message import Message
from app.models.thread import Thread
from app.schemas.message import MessageCreate


async def get_messages_by_thread(db: AsyncSession, thread_id: str) -> list[Message]:
    result = await db.execute(
        select(Message)
        .where(Message.thread_id == thread_id)
        .order_by(Message.created_at.asc())
    )
    return list(result.scalars().all())


async def create_message(
    db: AsyncSession,
    thread_id: str,
    data: MessageCreate,
) -> tuple[Message, Message]:
    user_message = Message(
        id=str(uuid.uuid4()),
        thread_id=thread_id,
        role="user",
        content=data.content,
    )
    db.add(user_message)

    assistant_message = Message(
        id=str(uuid.uuid4()),
        thread_id=thread_id,
        role="assistant",
        content=f"「{data.content}」についてですね。これはモックの返答です。",
    )
    db.add(assistant_message)

    thread = await db.get(Thread, thread_id)
    if thread:
        thread.last_message = data.content

    await db.commit()
    await db.refresh(user_message)
    await db.refresh(assistant_message)

    return user_message, assistant_message
