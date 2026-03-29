import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Thread
from app.schemas.thread import ThreadCreate, ThreadUpdate


class ThreadRepository:
    """スレッドのDB操作"""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_all(self) -> list[Thread]:
        result = await self._db.execute(
            select(Thread).order_by(Thread.updated_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, thread_id: str) -> Thread | None:
        result = await self._db.execute(select(Thread).where(Thread.id == thread_id))
        return result.scalar_one_or_none()

    async def create(self, data: ThreadCreate) -> Thread:
        thread = Thread(
            id=str(uuid.uuid4()),
            title=data.title,
            last_message="",
        )
        self._db.add(thread)
        await self._db.commit()
        await self._db.refresh(thread)
        return thread

    async def update(self, thread_id: str, data: ThreadUpdate) -> Thread | None:
        thread = await self.get_by_id(thread_id)
        if not thread:
            return None

        if data.title is not None:
            thread.title = data.title

        await self._db.commit()
        await self._db.refresh(thread)
        return thread

    async def delete(self, thread_id: str) -> bool:
        result = await self._db.execute(delete(Thread).where(Thread.id == thread_id))
        await self._db.commit()
        return result.rowcount > 0  # type: ignore[operator]
