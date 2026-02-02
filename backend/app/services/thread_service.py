import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.thread import Thread
from app.schemas.thread import ThreadCreate, ThreadUpdate


async def get_all_threads(db: AsyncSession) -> list[Thread]:
    result = await db.execute(select(Thread).order_by(Thread.updated_at.desc()))
    return list(result.scalars().all())


async def get_thread_by_id(db: AsyncSession, thread_id: str) -> Thread | None:
    result = await db.execute(select(Thread).where(Thread.id == thread_id))
    return result.scalar_one_or_none()


async def create_thread(db: AsyncSession, data: ThreadCreate) -> Thread:
    thread = Thread(
        id=str(uuid.uuid4()),
        title=data.title,
        last_message="",
    )
    db.add(thread)
    await db.commit()
    await db.refresh(thread)
    return thread


async def update_thread(
    db: AsyncSession, thread_id: str, data: ThreadUpdate
) -> Thread | None:
    thread = await get_thread_by_id(db, thread_id)
    if not thread:
        return None

    if data.title is not None:
        thread.title = data.title

    await db.commit()
    await db.refresh(thread)
    return thread


async def delete_thread(db: AsyncSession, thread_id: str) -> bool:
    result = await db.execute(delete(Thread).where(Thread.id == thread_id))
    await db.commit()
    return result.rowcount > 0  # type: ignore[operator]
