import pytest

from app.repositories.thread_repository import ThreadRepository
from app.schemas.thread import ThreadCreate, ThreadUpdate
from app.services.thread_service import ThreadService
from tests.services.fake_ai import FakeAIService


@pytest.fixture()
def fake_ai() -> FakeAIService:
    return FakeAIService()


@pytest.fixture()
def service(thread_repo: ThreadRepository, fake_ai: FakeAIService) -> ThreadService:
    return ThreadService(thread_repo=thread_repo, ai=fake_ai)


@pytest.mark.asyncio
async def test_get_all_threads(service: ThreadService, thread_repo: ThreadRepository):
    """スレッド一覧を取得できる"""
    # Arrange
    await thread_repo.create(ThreadCreate(title="Thread 1"))
    await thread_repo.create(ThreadCreate(title="Thread 2"))

    # Act
    threads = await service.get_all_threads()

    # Assert
    assert len(threads) == 2


@pytest.mark.asyncio
async def test_get_thread_or_raise(
    service: ThreadService, thread_repo: ThreadRepository
):
    """存在するスレッドを取得できる"""
    # Arrange
    created = await thread_repo.create(ThreadCreate(title="Test"))

    # Act
    thread = await service.get_thread_or_raise(created.id)

    # Assert
    assert thread.id == created.id
    assert thread.title == "Test"


@pytest.mark.asyncio
async def test_get_thread_or_raise_not_found(service: ThreadService):
    """存在しないスレッドでThreadNotFoundが発生する"""
    from app.exceptions import ThreadNotFound

    # Arrange

    # Act & Assert
    with pytest.raises(ThreadNotFound):
        await service.get_thread_or_raise("non-existent")


@pytest.mark.asyncio
async def test_create_thread(service: ThreadService):
    """スレッドを作成できる"""
    # Arrange
    data = ThreadCreate(title="New Thread")

    # Act
    thread = await service.create_thread(data)

    # Assert
    assert thread.title == "New Thread"
    assert thread.id is not None


@pytest.mark.asyncio
async def test_update_thread(service: ThreadService, thread_repo: ThreadRepository):
    """スレッドを更新できる"""
    # Arrange
    created = await thread_repo.create(ThreadCreate(title="Original"))

    # Act
    updated = await service.update_thread(created.id, ThreadUpdate(title="Updated"))

    # Assert
    assert updated.title == "Updated"


@pytest.mark.asyncio
async def test_update_thread_not_found(service: ThreadService):
    """存在しないスレッドの更新でThreadNotFoundが発生する"""
    from app.exceptions import ThreadNotFound

    # Arrange

    # Act & Assert
    with pytest.raises(ThreadNotFound):
        await service.update_thread("non-existent", ThreadUpdate(title="X"))


@pytest.mark.asyncio
async def test_delete_thread(service: ThreadService, thread_repo: ThreadRepository):
    """スレッドを削除できる"""
    # Arrange
    created = await thread_repo.create(ThreadCreate(title="To Delete"))

    # Act
    await service.delete_thread(created.id)

    # Assert
    found = await thread_repo.get_by_id(created.id)
    assert found is None


@pytest.mark.asyncio
async def test_delete_thread_not_found(service: ThreadService):
    """存在しないスレッドの削除でThreadNotFoundが発生する"""
    from app.exceptions import ThreadNotFound

    # Arrange

    # Act & Assert
    with pytest.raises(ThreadNotFound):
        await service.delete_thread("non-existent")


@pytest.mark.asyncio
async def test_generate_title(
    service: ThreadService,
    thread_repo: ThreadRepository,
    fake_ai: FakeAIService,
):
    """AIでタイトルを生成してスレッドを更新する"""
    # Arrange
    created = await thread_repo.create(ThreadCreate(title="Original"))

    # Act
    title = await service.generate_title(created.id, "こんにちは")

    # Assert
    assert title == "テストタイトル"
    assert fake_ai.generate_title_calls == ["こんにちは"]

    updated = await thread_repo.get_by_id(created.id)
    assert updated is not None
    assert updated.title == "テストタイトル"


@pytest.mark.asyncio
async def test_generate_title_thread_not_found(
    service: ThreadService, fake_ai: FakeAIService
):
    """存在しないスレッドのタイトル生成でThreadNotFoundが発生する"""
    from app.exceptions import ThreadNotFound

    # Arrange

    # Act & Assert
    with pytest.raises(ThreadNotFound):
        await service.generate_title("non-existent", "Hello")

    # AIは呼ばれない
    assert fake_ai.generate_title_calls == []
