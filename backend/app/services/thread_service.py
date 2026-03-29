from app.ai.protocol import AIService
from app.exceptions import ThreadNotFound
from app.models.models import Thread
from app.repositories.thread_repository import ThreadRepository
from app.schemas.thread import ThreadCreate, ThreadUpdate


class ThreadService:
    """スレッドに関するユースケース"""

    def __init__(
        self,
        thread_repo: ThreadRepository,
        ai: AIService,
    ) -> None:
        self._thread_repo = thread_repo
        self._ai = ai

    async def get_all_threads(self) -> list[Thread]:
        return await self._thread_repo.get_all()

    async def get_thread_or_raise(self, thread_id: str) -> Thread:
        thread = await self._thread_repo.get_by_id(thread_id)
        if thread is None:
            raise ThreadNotFound(thread_id)
        return thread

    async def create_thread(self, data: ThreadCreate) -> Thread:
        return await self._thread_repo.create(data)

    async def update_thread(self, thread_id: str, data: ThreadUpdate) -> Thread:
        thread = await self._thread_repo.update(thread_id, data)
        if thread is None:
            raise ThreadNotFound(thread_id)
        return thread

    async def delete_thread(self, thread_id: str) -> None:
        deleted = await self._thread_repo.delete(thread_id)
        if not deleted:
            raise ThreadNotFound(thread_id)

    async def generate_title(self, thread_id: str, content: str) -> str:
        """AIでタイトルを生成してスレッドを更新"""
        await self.get_thread_or_raise(thread_id)
        title = await self._ai.generate_title(content)
        await self._thread_repo.update(thread_id, ThreadUpdate(title=title))
        return title
