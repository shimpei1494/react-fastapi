import pytest

from app.repositories.thread_repository import ThreadRepository
from app.schemas.thread import ThreadCreate, ThreadUpdate


@pytest.mark.asyncio
async def test_get_all_empty(thread_repo: ThreadRepository):
    """スレッドが空のときに空リストが返される"""
    # Arrange

    # Act
    threads = await thread_repo.get_all()

    # Assert
    assert threads == []


@pytest.mark.asyncio
async def test_create(thread_repo: ThreadRepository):
    """スレッドを作成できる"""
    # Arrange
    data = ThreadCreate(title="Test Thread")

    # Act
    thread = await thread_repo.create(data)

    # Assert
    assert thread.id is not None
    assert thread.title == "Test Thread"
    assert thread.last_message == ""
    assert thread.created_at is not None
    assert thread.updated_at is not None


@pytest.mark.asyncio
async def test_get_all(thread_repo: ThreadRepository):
    """すべてのスレッドを取得できる"""
    # Arrange
    thread1 = await thread_repo.create(ThreadCreate(title="Thread 1"))
    thread2 = await thread_repo.create(ThreadCreate(title="Thread 2"))

    # Act
    threads = await thread_repo.get_all()

    # Assert
    assert len(threads) == 2
    thread_ids = {t.id for t in threads}
    assert thread_ids == {thread1.id, thread2.id}


@pytest.mark.asyncio
async def test_get_by_id(thread_repo: ThreadRepository):
    """IDでスレッドを取得できる"""
    # Arrange
    created = await thread_repo.create(ThreadCreate(title="Find Me"))

    # Act
    found = await thread_repo.get_by_id(created.id)

    # Assert
    assert found is not None
    assert found.id == created.id
    assert found.title == "Find Me"


@pytest.mark.asyncio
async def test_get_by_id_not_found(thread_repo: ThreadRepository):
    """存在しないIDではNoneが返される"""
    # Arrange

    # Act
    found = await thread_repo.get_by_id("non-existent-id")

    # Assert
    assert found is None


@pytest.mark.asyncio
async def test_update(thread_repo: ThreadRepository):
    """スレッドのタイトルを更新できる"""
    # Arrange
    thread = await thread_repo.create(ThreadCreate(title="Original Title"))

    # Act
    updated = await thread_repo.update(thread.id, ThreadUpdate(title="Updated Title"))

    # Assert
    assert updated is not None
    assert updated.id == thread.id
    assert updated.title == "Updated Title"


@pytest.mark.asyncio
async def test_update_not_found(thread_repo: ThreadRepository):
    """存在しないIDの更新はNoneを返す"""
    # Arrange

    # Act
    result = await thread_repo.update("non-existent-id", ThreadUpdate(title="New"))

    # Assert
    assert result is None


@pytest.mark.asyncio
async def test_delete(thread_repo: ThreadRepository):
    """スレッドを削除できる"""
    # Arrange
    thread = await thread_repo.create(ThreadCreate(title="To Be Deleted"))

    # Act
    deleted = await thread_repo.delete(thread.id)

    # Assert
    assert deleted is True
    found = await thread_repo.get_by_id(thread.id)
    assert found is None


@pytest.mark.asyncio
async def test_delete_not_found(thread_repo: ThreadRepository):
    """存在しないIDの削除はFalseを返す"""
    # Arrange

    # Act
    deleted = await thread_repo.delete("non-existent-id")

    # Assert
    assert deleted is False
