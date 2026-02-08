import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.thread import ThreadCreate, ThreadUpdate
from app.services import thread_service


@pytest.mark.asyncio
async def test_get_all_threads_empty(db_session: AsyncSession):
    """スレッドが空のときに空リストが返される"""
    threads = await thread_service.get_all_threads(db_session)
    assert threads == []


@pytest.mark.asyncio
async def test_create_thread(db_session: AsyncSession):
    """スレッドを作成できる"""
    data = ThreadCreate(title="Test Thread")
    thread = await thread_service.create_thread(db_session, data)

    assert thread.id is not None
    assert thread.title == "Test Thread"
    assert thread.last_message == ""
    assert thread.created_at is not None
    assert thread.updated_at is not None


@pytest.mark.asyncio
async def test_get_all_threads(db_session: AsyncSession):
    """すべてのスレッドを取得できる"""
    thread1 = await thread_service.create_thread(
        db_session, ThreadCreate(title="Thread 1")
    )
    thread2 = await thread_service.create_thread(
        db_session, ThreadCreate(title="Thread 2")
    )

    threads = await thread_service.get_all_threads(db_session)
    assert len(threads) == 2
    # 両方のスレッドが含まれている（順序は問わない）
    thread_ids = {t.id for t in threads}
    assert thread_ids == {thread1.id, thread2.id}


@pytest.mark.asyncio
async def test_get_thread_by_id(db_session: AsyncSession):
    """IDでスレッドを取得できる"""
    created = await thread_service.create_thread(
        db_session, ThreadCreate(title="Find Me")
    )

    found = await thread_service.get_thread_by_id(db_session, created.id)
    assert found is not None
    assert found.id == created.id
    assert found.title == "Find Me"


@pytest.mark.asyncio
async def test_get_thread_by_id_not_found(db_session: AsyncSession):
    """存在しないIDではNoneが返される"""
    found = await thread_service.get_thread_by_id(db_session, "non-existent-id")
    assert found is None


@pytest.mark.asyncio
async def test_update_thread(db_session: AsyncSession):
    """スレッドのタイトルを更新できる"""
    thread = await thread_service.create_thread(
        db_session, ThreadCreate(title="Original Title")
    )

    updated = await thread_service.update_thread(
        db_session, thread.id, ThreadUpdate(title="Updated Title")
    )

    assert updated is not None
    assert updated.id == thread.id
    assert updated.title == "Updated Title"


@pytest.mark.asyncio
async def test_update_thread_not_found(db_session: AsyncSession):
    """存在しないIDの更新はNoneを返す"""
    result = await thread_service.update_thread(
        db_session, "non-existent-id", ThreadUpdate(title="New Title")
    )
    assert result is None


@pytest.mark.asyncio
async def test_delete_thread(db_session: AsyncSession):
    """スレッドを削除できる"""
    thread = await thread_service.create_thread(
        db_session, ThreadCreate(title="To Be Deleted")
    )

    deleted = await thread_service.delete_thread(db_session, thread.id)
    assert deleted is True

    # 削除後は取得できない
    found = await thread_service.get_thread_by_id(db_session, thread.id)
    assert found is None


@pytest.mark.asyncio
async def test_delete_thread_not_found(db_session: AsyncSession):
    """存在しないIDの削除はFalseを返す"""
    deleted = await thread_service.delete_thread(db_session, "non-existent-id")
    assert deleted is False
