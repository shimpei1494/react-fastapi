import asyncio
from collections.abc import AsyncGenerator
from typing import Any

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.database import Base, get_db
from app.main import app
from app.repositories.message_repository import MessageRepository
from app.repositories.thread_repository import ThreadRepository

# テスト用インメモリDBエンジン
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)


# SQLiteで外部キー制約を有効化
@event.listens_for(test_engine.sync_engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


TestAsyncSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest.fixture(scope="session")
def event_loop():
    """セッションスコープのイベントループを提供"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """各テストで独立したDBセッションを提供"""
    # テーブル作成
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestAsyncSessionLocal() as session:
        yield session

    # テーブル削除（クリーンアップ）
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, Any]:
    """テスト用HTTPクライアントを提供（DBセッションをオーバーライド）"""

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def thread_repo(db_session: AsyncSession) -> ThreadRepository:
    """テスト用ThreadRepositoryを提供"""
    return ThreadRepository(db_session)


@pytest.fixture(scope="function")
def message_repo(db_session: AsyncSession) -> MessageRepository:
    """テスト用MessageRepositoryを提供"""
    return MessageRepository(db_session)
